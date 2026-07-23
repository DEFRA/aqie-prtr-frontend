import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import {
  submitFacilitySearch,
  facilitySearchViewModel
} from '#src/server/common/helpers/facility-search.js'
import { searchByYearContent } from './content.js'

// Additional search option — may be removed later.
const SEARCH_TYPE = 'year'
const PATH = '/search-by-year'

function handleSearchByYear(request, h) {
  const content = searchByYearContent[resolveLang(request)]

  if (request.method === 'post') {
    return submitFacilitySearch(request, h, {
      searchType: SEARCH_TYPE,
      path: PATH,
      errors: content.errors
    })
  }

  return h.view(
    'search-by-year/index',
    facilitySearchViewModel(request, { content, path: PATH })
  )
}

export const searchByYearController = { handler: handleSearchByYear }
export { handleSearchByYear }
