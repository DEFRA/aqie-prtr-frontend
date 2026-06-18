import {
  getYears,
  getDownloadLink
} from '#src/server/common/api/year-downloads.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { toProxyHref } from './download-proxy.js' // Temporary proxy helper until backend serves attachment headers
import { downloadContent } from './content.js'

const logger = createLogger()
const HOME_PATH = '/uk-pollutant-release-and-transfer-register'

async function handleDownloads(request, h) {
  const { language = 'en' } = request.params // optional language parameter
  const content = downloadContent[language]

  let yearsData = []
  try {
    const response = await getYears()
    yearsData = response.years || []
  } catch (error) {
    logger.error(`[download] failed to fetch years: ${error.message}`)
    yearsData = []
  }

  const downloadLinks = (await Promise.all(
    yearsData
      .filter((item) => item.reportIsLive === true)
      .map(async (item) => {
        try {
          const response = await getDownloadLink(item.year)
          const link = response.downloadLink
          return {
            text: `${content.downloadPrefix} ${item.year} ${content.dataSuffix}`,
            href: toProxyHref(link, item.year)
          }
        } catch (error) {
          logger.error(
            `[download] failed to fetch download link for year ${item.year}: ${error.message}`
          )
          return null
        }
      })
  )).filter(Boolean)

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
