import { fetchJson } from './api-common.js'

/**
 * Fetch a page of facilities near a point from the aqie-prtr-backend.
 *
 * @param {object} params
 * @param {number|string} params.lat
 * @param {number|string} params.lng
 * @param {number} [params.page=1]
 * @param {number} [params.perPage=10]
 * @param {number} [params.radius=50]
 * @returns {Promise<{ count, total, page, perPage, totalPages, results: object[] }>}
 */
export function getFacilitiesNearby({ lat, lng, page = 1, perPage = 10, radius = 50 }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    page: String(page),
    perPage: String(perPage),
    radius: String(radius)
  })
  return fetchJson(`/facilities/nearby?${params.toString()}`, 'getFacilitiesNearby')
}
