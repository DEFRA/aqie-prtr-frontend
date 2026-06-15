/**
 * Temporary frontend download proxy.
 *
 * Fetches S3 presigned URLs server-side and streams them back with
 * Content-Disposition: attachment so the browser saves the file rather
 * than rendering it inline.
 *
 * Remove this file (and the two references in index.js / controller.js)
 * once the backend sends the correct Content-Disposition header itself.
 */
import { Readable } from 'node:stream'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { statusCodes } from '#src/server/common/constants/status-codes.js'

const logger = createLogger()

const PROXY_PATH = '/download-all-data-for-a-year/file'

/**
 * Rewrites a direct presigned URL to go through the same-origin proxy route.
 * Swap this back to `directUrl` when removing the proxy.
 *
 * @param {string} directUrl
 * @param {number|string} year
 * @returns {string}
 */
export function toProxyHref(directUrl, year) {
  return `${PROXY_PATH}?url=${encodeURIComponent(directUrl)}&year=${year}`
}

function buildDownloadFilename(year, sourceUrl) {
  if (year) {
    return `uk_prtr_dataset_${year}.xml`
  }

  try {
    const pathname = new URL(sourceUrl).pathname
    const fromPath = pathname.split('/').pop()
    if (fromPath) {
      return decodeURIComponent(fromPath)
    }
  } catch {
    // Fall back to a safe default when URL parsing fails.
  }

  return 'uk_prtr_dataset.xml'
}

export async function handleDownloadFile(request, h) {
  const { url, year } = request.query

  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    return h.response('Invalid download URL').code(statusCodes.badRequest)
  }

  if (parsedUrl.protocol !== 'https:') {
    return h
      .response('Download URL must use https')
      .code(statusCodes.badRequest)
  }

  try {
    const upstream = await fetch(parsedUrl.toString())

    if (!upstream.ok || !upstream.body) {
      logger.error(
        `[download] upstream download failed: ${upstream.status} ${parsedUrl.toString()}`
      )
      return h.response('Unable to download file').code(statusCodes.badGateway)
    }

    const stream = Readable.fromWeb(upstream.body)
    const filename = buildDownloadFilename(year, parsedUrl.toString())
    const contentType =
      upstream.headers.get('content-type') || 'application/octet-stream'

    return h
      .response(stream)
      .type(contentType)
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .header('Cache-Control', 'no-store')
  } catch (error) {
    logger.error(`[download] proxy failed: ${error.message}`)
    return h.response('Unable to download file').code(statusCodes.badGateway)
  }
}

export const downloadFileController = { handler: handleDownloadFile }
