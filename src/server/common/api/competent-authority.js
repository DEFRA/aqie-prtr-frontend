import { fetchJson } from './api-common.js'

/**
 * Fetch a facility's latest competent authority from the aqie-prtr-backend.
 * Year-independent — the register always shows the most recent authority.
 *
 * @param {string} id internalFacilityId
 * @returns {Promise<object>}
 */
export function getCompetentAuthority(id) {
  return fetchJson(
    `/facilities/${encodeURIComponent(id)}/competent-authority`,
    'getCompetentAuthority'
  )
}
