import { randomInt } from 'node:crypto'

import { createLogger } from './logging/logger.js'

const logger = createLogger()

export const DEFAULT_MAX_RETRIES = 0
export const DEFAULT_RETRY_DELAY_MS = 500
export const DEFAULT_TIMEOUT_MS = 10_000

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate ms to wait before the next retry — exponential growth + small
 * random offset to prevent many clients retrying in lockstep.
 *
 * @param {number} attemptNumber - 0-based index of the failed attempt.
 * @param {number} baseDelayMs - Base delay for the first retry.
 * @returns {number}
 */
function calculateRetryDelay(attemptNumber, baseDelayMs) {
  const randomOffsetMs = randomInt(0, 100)
  return baseDelayMs * 2 ** attemptNumber + randomOffsetMs
}

function createTimeoutController(timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, clear: () => clearTimeout(timeoutId) }
}

/**
 * Run a fetch with structured timing/error logging, abort-on-timeout, and
 * optional retry. Returns the raw Response — the caller checks `response.ok`
 * and parses the body.
 *
 * @param {(signal: AbortSignal) => Promise<Response>} fetchFn
 * @param {object} options
 * @param {string} options.operationName
 * @param {number} [options.maxRetries=0]
 * @param {number} [options.retryDelayMs=500]
 * @param {number} [options.timeoutMs=10000]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(fetchFn, options) {
  const {
    operationName,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = options

  let lastError

  for (let attemptNumber = 0; attemptNumber <= maxRetries; attemptNumber++) {
    const startTime = Date.now()
    const { controller, clear } = createTimeoutController(timeoutMs)

    try {
      const response = await fetchFn(controller.signal)
      const duration = Date.now() - startTime
      logger.info(
        `[${operationName}] ${response.status} in ${duration}ms (attempt ${attemptNumber + 1}/${maxRetries + 1})`
      )
      return response
    } catch (error) {
      lastError = error
      const duration = Date.now() - startTime
      const isLastAttempt = attemptNumber === maxRetries

      if (isLastAttempt) {
        logger.error(
          `[${operationName}] failed after ${attemptNumber + 1} attempts in ${duration}ms: ${error.message}`
        )
        break
      }

      const nextRetryDelayMs = calculateRetryDelay(attemptNumber, retryDelayMs)
      logger.warn(
        `[${operationName}] attempt ${attemptNumber + 1}/${maxRetries + 1} failed in ${duration}ms: ${error.message}; retrying in ${Math.round(nextRetryDelayMs)}ms`
      )
      await delay(nextRetryDelayMs)
    } finally {
      clear()
    }
  }
  throw lastError
}
