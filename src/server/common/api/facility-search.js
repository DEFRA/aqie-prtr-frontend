import { fetchJson } from './api-common.js'

/**
 * Search facilities by a field (name / region / river-basin / year), paginated.
 * @param {{ searchType, q, page?, perPage? }} params
 */
const PER_PAGE_ITEMS = 10

export function searchFacilities({
  searchType,
  q,
  page = 1,
  perPage = PER_PAGE_ITEMS
}) {
  const params = new URLSearchParams({
    searchType,
    q: String(q),
    page: String(page),
    perPage: String(perPage)
  })
  return fetchJson(
    `/facilities/search?${params.toString()}`,
    'searchFacilities'
  )
}
