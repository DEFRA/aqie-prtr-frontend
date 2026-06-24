import { getReports } from '#src/server/common/api/reports.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { downloadContent } from './content.js'

const logger = createLogger()
const HOME_PATH = '/uk-pollutant-release-and-transfer-register'

async function handleDownloads(request, h) {
  const { language = 'en' } = request.params // optional language parameter
  const content = downloadContent[language]

  let reportsData = []
  try {
    const response = await getReports()
    reportsData = response.results || []
  } catch (error) {
    logger.error(`[download] failed to fetch reports: ${error.message}`)
    return h.redirect('/problem-with-service?statusCode=500')
  }

  const downloadLinks = reportsData
    .filter((item) => item.reportIsLive === true)
    .map((item) => {
      return {
        text: `${content.downloadPrefix} ${item.year} ${content.dataSuffix}`,
        href: `/download-all-data-for-a-year/file/${item.year}`
      }
    })
    .reverse()

  const hrefq = request.params.language ? `${HOME_PATH}/${language}` : HOME_PATH

  return h.view('download/index', {
    pageTitle: content.pageTitle,
    description: content.description,
    downloadLinks,
    displayBackLink: true,
    hrefq
  })
}
export const downloadController = { handler: handleDownloads }
export { handleDownloads }
