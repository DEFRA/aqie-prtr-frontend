import { fetchJson } from './api-common.js'

/**
 * Fetch available years from the backend.
 *
 * @returns {Promise<object>}
 */
export function getYears() {
  return fetchJson('/years', 'getYears')
}

/**
 * Fetch a download link for a given year from the backend.
 *
 * @param {number|string} year
 * @returns {Promise<object>}
 */
export function getDownloadLink(year) {
  return fetchJson(`/years/get-download-link/${year}`, 'getDownloadLink')
}
