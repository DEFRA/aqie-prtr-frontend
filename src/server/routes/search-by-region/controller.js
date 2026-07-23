import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import {
  submitFacilitySearch,
  facilitySearchViewModel
} from '#src/server/common/helpers/facility-search.js'
import { searchByRegionContent } from './content.js'

const SEARCH_TYPE = 'region'
const PATH = '/search-by-region'

function handleSearchByRegion(request, h) {
  const content = searchByRegionContent[resolveLang(request)]

  if (request.method === 'post') {
    return submitFacilitySearch(request, h, {
      searchType: SEARCH_TYPE,
      path: PATH,
      errors: content.errors
    })
  }

  return h.view(
    'search-by-region/index',
    facilitySearchViewModel(request, { content, path: PATH })
  )
}

export const searchByRegionController = { handler: handleSearchByRegion }
export { handleSearchByRegion }
