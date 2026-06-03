import { getYears } from '#src/server/common/api/locations.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { downloadContent } from './content.js'

const logger = createLogger()
const HOME_PATH = '/uk-pollutant-release-and-transfer-register'

export const downloadController = {
  async handler(request, h) {
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

    const downloadLinks = yearsData.map((item) => ({
      text: `${content.downloadPrefix} ${item.year} ${content.dataSuffix}`,
      href: item.downloadLink
    }))

    const hrefq = request.params.language
      ? `${HOME_PATH}/${language}`
      : HOME_PATH

    return h.view('download/index', {
      pageTitle: content.pageTitle,
      description: content.description,
      downloadLinks,
      displayBackLink: true,
      hrefq
    })
  }
}
