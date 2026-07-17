import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { statusCodes } from '#src/server/common/constants/status-codes.js'
import { content } from './content.js'

const logger = createLogger()

// `statusCode` arrives from the query string, so it is user-controlled.
// Whitelist it: anything else becomes a 500. It is only ever used to set the
// HTTP status — never rendered into the page.
const ALLOWED_STATUS_CODES = new Set([
  statusCodes.internalServerError, // 500 — backend/BFF failure
  statusCodes.badGateway, // 502 — upstream (S3 / backend) failure
  statusCodes.serviceUnavailable // 503
])

function resolveStatusCode(value) {
  const parsed = Number.parseInt(value, 10)
  return ALLOWED_STATUS_CODES.has(parsed)
    ? parsed
    : statusCodes.internalServerError
}

/**
 * Render the GOV.UK "problem with the service" page.
 *
 * Responds with the real error status (not 200) so monitoring sees the failure
 * and search engines do not index it. Deliberately has no route validation —
 * an error page must never itself fail validation and bounce.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
function handleProblemWithService(request, h) {
  const lang = resolveLang(request)
  const langContent = content[lang]
  const statusCode = resolveStatusCode(request.query.statusCode)

  logger.error(`[problem-with-service] rendered statusCode=${statusCode}`)

  return h
    .view('problem-with-service/index', {
      ...langContent,
      lang
    })
    .code(statusCode)
}

export const problemWithServiceController = {
  handler: handleProblemWithService
}
export { handleProblemWithService }
