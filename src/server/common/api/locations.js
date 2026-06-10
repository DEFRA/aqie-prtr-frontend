import { config } from '#src/config/config.js'
import { fetchWithRetry } from '../helpers/fetch-with-retry.js'

const baseUrl = () => config.get('backend.url').replace(/\/$/, '')
const defaultHeaders = () => ({ Accept: 'application/json' })

/**
 * Resolve a town/postcode string to candidate locations via the aqie-prtr-backend.
 *
 * @param {string} query
 * @returns {Promise<{ query: string, count: number, results: object[] }>}
 */
export async function searchLocations(query) {
  const url = `${baseUrl()}/locations/search?q=${encodeURIComponent(query)}`
  const response = await fetchWithRetry(
    (signal) => fetch(url, { headers: defaultHeaders(), signal }),
    { operationName: 'searchLocations' }
  )
  if (!response.ok) {
    throw new Error(`searchLocations failed: ${response.status}`)
  }
  return response.json()
}
