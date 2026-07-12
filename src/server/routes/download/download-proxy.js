/**
 * Temporary frontend download handler.
 *
 * Fetches S3 presigned URLs server-side and streams them back with
 * Content-Disposition: attachment so the browser saves the file rather
 * than rendering it inline.
 *
 * Once the backend sends the correct Content-Disposition header itself,
 * the links can point directly to the backend URL.
 */
import { Readable } from 'node:stream'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { getDownloadLink } from '#src/server/common/api/reports.js'

const logger = createLogger()

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

/**
 * Handles download requests by fetching the presigned URL from the backend
 * and streaming it back with proper Content-Disposition headers.
 * Triggered when a user clicks a download link.
 *
 * TEMPORARY: This handler exists because the backend presigned URLs don't include
 * Content-Disposition: attachment headers. Without these headers, S3 renders XML
 * in the browser instead of prompting a download.
 *
 * TODO: Once the backend is updated to serve correct Content-Disposition headers,
 * the links can point directly to the presigned URL and this handler can be removed.
 *
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Stream response or error redirect
 */
export async function handleDownload(request, h) {
  const { year } = request.params

  try {
    // Fetch presigned URL from backend
    const response = await getDownloadLink(year)
    const presignedUrl = response.downloadLink

    if (!presignedUrl) {
      logger.error(`[download] no download link returned for year ${year}`)
      return h.redirect('/problem-with-service?statusCode=502')
    }

    // Validate presigned URL
    let parsedUrl
    try {
      parsedUrl = new URL(presignedUrl)
    } catch {
      logger.error(`[download] invalid presigned URL for year ${year}`)
      return h.redirect('/problem-with-service?statusCode=502')
    }

    if (parsedUrl.protocol !== 'https:') {
      logger.error(`[download] presigned URL is not https for year ${year}`)
      return h.redirect('/problem-with-service?statusCode=502')
    }

    // Fetch file from presigned URL
    const upstream = await fetch(presignedUrl)

    if (!upstream.ok || !upstream.body) {
      logger.error(
        `[download] failed to fetch file for year ${year}: ${upstream.status}`
      )
      return h.redirect('/problem-with-service?statusCode=502')
    }

    // Stream file back with proper headers
    const stream = Readable.fromWeb(upstream.body)
    const filename = buildDownloadFilename(year, presignedUrl)
    const contentType =
      upstream.headers.get('content-type') || 'application/octet-stream'

    return h
      .response(stream)
      .type(contentType)
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .header('Cache-Control', 'no-store')
  } catch (error) {
    logger.error(
      `[download] failed to handle download for year ${year}: ${error.message}`
    )
    return h.redirect('/problem-with-service?statusCode=502')
  }
}

export const downloadController = { handler: handleDownload }
