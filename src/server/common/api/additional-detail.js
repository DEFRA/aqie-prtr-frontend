import { fetchJson } from './api-common.js'

/**
 * Fetch the additional detail of one release/transfer/waste line.
 *
 * @param {string} id internalFacilityId
 * @param {number|string} year
 * @param {number|string} lineId ricardoReleaseTransferId
 * @returns {Promise<object>}
 */
export function getAdditionalDetail(id, year, lineId) {
  return fetchJson(
    `/facilities/${encodeURIComponent(id)}/record/${encodeURIComponent(year)}/lines/${encodeURIComponent(lineId)}`,
    'getAdditionalDetail'
  )
}
