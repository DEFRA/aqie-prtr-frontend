import { fetchJson } from './api-common.js'

/**
 * Resolve a town/postcode string to candidate locations via the aqie-prtr-backend.
 *
 * @param {string} query
 * @returns {Promise<{ query: string, count: number, results: object[] }>}
 */
export function searchLocations(query) {
  return fetchJson(
    `/locations/search?q=${encodeURIComponent(query)}`,
    'searchLocations'
  )
}
