import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import {
  submitFacilitySearch,
  facilitySearchViewModel
} from '#src/server/common/helpers/facility-search.js'
import { searchByRiverBasinContent } from './content.js'

const SEARCH_TYPE = 'river-basin'
const PATH = '/search-by-river-basin'

function handleSearchByRiverBasin(request, h) {
  const content = searchByRiverBasinContent[resolveLang(request)]

  if (request.method === 'post') {
    return submitFacilitySearch(request, h, {
      searchType: SEARCH_TYPE,
      path: PATH,
      errors: content.errors
    })
  }

  return h.view(
    'search-by-river-basin/index',
    facilitySearchViewModel(request, { content, path: PATH })
  )
}

export const searchByRiverBasinController = {
  handler: handleSearchByRiverBasin
}
export { handleSearchByRiverBasin }
