import { fetchJson } from './api-common.js'

/**
 * Fetch a facility's reference details from the aqie-prtr-backend.
 *
 * @param {string} id internalFacilityId
 * @returns {Promise<object>}
 */
export function getFacilityDetails(id) {
  return fetchJson(
    `/facilities/${encodeURIComponent(id)}/details`,
    'getFacilityDetails'
  )
}
