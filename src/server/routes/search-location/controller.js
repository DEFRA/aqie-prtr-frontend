import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { content } from './content.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'

const logger = createLogger()

/**
 * Render the search-location form. Clears session state when the
 * "Search again" path is taken.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
function handleSearchLocationGet(request, h) {
  if (request.url.pathname === '/search-location/searchagain') {
    request.yar.clear('fullSearchQuery')
    request.yar.clear('locationsResult')
    request.yar.clear('facilitiesResult')
    logger.info('[search-location.GET] session cleared via searchagain')
  }

  const lang = resolveLang(request)
  const errors = request.yar.get('errors') || ''
  const errorMessage = request.yar.get('errorMessage') || ''
  request.yar.clear('errors')
  request.yar.clear('errorMessage')

  return h.view('search-location/index', {
    ...content[lang],
    displayBackLink: true,
    fullSearchQuery: request.yar.get('fullSearchQuery'),
    errors,
    errorMessage
  })
}

export const searchLocationController = { handler: handleSearchLocationGet }
export { handleSearchLocationGet }
