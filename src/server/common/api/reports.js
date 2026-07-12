import { fetchJson } from './api-common.js'

/**
 * Fetch available reports from the backend.
 *
 * @returns {Promise<object>}
 */
export function getReports() {
  return fetchJson('/reports', 'getReports')
}

/**
 * Fetch a download link for a given year from the backend.
 *
 * @param {number|string} year - The year for which to fetch the download link
 * @returns {Promise<object>}
 */
export function getDownloadLink(year) {
  return fetchJson(`/reports/get-download-link/${year}`, 'getDownloadLink')
}
