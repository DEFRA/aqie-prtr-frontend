import { config } from '#src/config/config.js'
import { fetchWithRetry } from '#src/server/common/helpers/fetch-with-retry.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'

const logger = createLogger()

export function baseUrl() {
  return config.get('backend.url').replace(/\/$/, '')
}

export function defaultHeaders() {
  return { Accept: 'application/json' }
}

/**
 * Build a full backend URL from a path, normalising the leading slash.
 *
 * @param {string} path
 * @returns {string}
 */
export function buildUrl(path) {
  const base = baseUrl()
  const normalisedPath = path.startsWith('/') ? path : `/${path}`
  logger.info(`API: ${base}${normalisedPath}`)
  return `${base}${normalisedPath}`
}

/**
 * GET JSON from the backend with retry, timeout, and logging.
 *
 * @param {string} path - Backend path (e.g. '/years')
 * @param {string} operationName - Label for logging/retry diagnostics
 * @returns {Promise<any>}
 */
export async function fetchJson(path, operationName) {
  const url = buildUrl(path)
  const response = await fetchWithRetry(
    (signal) => fetch(url, { headers: defaultHeaders(), signal }),
    { operationName }
  )

  if (!response.ok) {
    const text = await response.text()
    logger.error(
      `[api.GET] ${path} -> ${response.status}: ${text.slice(0, 200)}`
    )
    throw new Error(`${operationName} failed: ${response.status}`)
  }

  if (response.status === 204) return null

  return response.json()
}
