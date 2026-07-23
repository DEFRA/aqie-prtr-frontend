import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import {
  SEARCH_OPTIONS,
  OPTION_PATHS
} from '#src/server/common/constants/search-options.js'
import { searchFacilityContent } from './content.js'

const CHOOSER_PATH = '/search-facility'

/**
 * Render the "Search for a facility" chooser (GET) and route the selected
 * search type to its page (POST).
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
function handleSearchFacility(request, h) {
  const content = searchFacilityContent[resolveLang(request)]

  if (request.method === 'post') {
    const target = OPTION_PATHS[request.payload?.searchType]
    if (!target) {
      request.yar.set('chooserError', content.errorNoSelection)
      return h.redirect(CHOOSER_PATH).takeover()
    }
    return h.redirect(target).takeover()
  }

  const error = request.yar.get('chooserError') || ''
  request.yar.clear('chooserError')

  return h.view('search-facility/index', {
    ...content,
    items: SEARCH_OPTIONS.map((option) => ({
      value: option.value,
      text: content.options[option.value]
    })),
    error,
    displayBackLink: true,
    hrefq: '/'
  })
}

export const searchFacilityController = { handler: handleSearchFacility }
export { handleSearchFacility }
