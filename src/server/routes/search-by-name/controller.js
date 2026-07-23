import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import {
  submitFacilitySearch,
  facilitySearchViewModel
} from '#src/server/common/helpers/facility-search.js'
import { searchByNameContent } from './content.js'

const SEARCH_TYPE = 'name'
const PATH = '/search-by-name'

function handleSearchByName(request, h) {
  const content = searchByNameContent[resolveLang(request)]

  if (request.method === 'post') {
    return submitFacilitySearch(request, h, {
      searchType: SEARCH_TYPE,
      path: PATH,
      errors: content.errors
    })
  }

  return h.view(
    'search-by-name/index',
    facilitySearchViewModel(request, { content, path: PATH })
  )
}

export const searchByNameController = { handler: handleSearchByName }
export { handleSearchByName }
