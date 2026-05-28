import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { content } from './content.js'

const logger = createLogger()
const TRY_AGAIN_PATH = '/search-location'

/**
 * Render the no-location-found page. Reads the last attempted search from
 * the yar session so the page can display "We could not find '<query>'".
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
function handleNoLocationFoundGet(request, h) {
  const lang = resolveLang(request)
  const langContent = content[lang]
  const searchValue = request.yar.get('fullSearchQuery')?.value || ''

  logger.info(`[no-location-found.GET] rendered for q="${searchValue}"`)

  return h.view('no-location-found/index', {
    ...langContent,
    lang,
    searchLocation: searchValue,
    displayBackLink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

export const noLocationFoundController = { handler: handleNoLocationFoundGet }
export { handleNoLocationFoundGet }
