import { fetchJson } from './api-common.js'

/**
 * Fetch available years from the backend.
 *
 * @returns {Promise<object>}
 */
export function getYears() {
  return fetchJson('/years', 'getYears')
}
