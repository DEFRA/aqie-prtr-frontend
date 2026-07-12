import { fetchJson } from './api-common.js'

/**
 * Fetch a facility's releases & transfers for a year (omit year → latest).
 *
 * @param {string} id internalFacilityId
 * @param {number|string} [year]
 * @returns {Promise<object>}
 */
export function getFacilityRecord(id, year) {
  const path = year
    ? `/facilities/${encodeURIComponent(id)}/record/${encodeURIComponent(year)}`
    : `/facilities/${encodeURIComponent(id)}/record`
  return fetchJson(path, 'getFacilityRecord')
}
