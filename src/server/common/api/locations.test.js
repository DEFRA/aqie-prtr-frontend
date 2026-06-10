import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/helpers/fetch-with-retry.js', () => ({
  fetchWithRetry: vi.fn()
}))

import { searchLocations } from '#src/server/common/api/locations.js'
import { fetchWithRetry } from '#src/server/common/helpers/fetch-with-retry.js'

describe('searchLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls the backend with q query param URL-encoded', async () => {
    fetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ query: 'newcastle', count: 0, results: [] })
    })

    await searchLocations('Newcastle upon Tyne')

    const fetchFn = fetchWithRetry.mock.calls[0][0]
    const options = fetchWithRetry.mock.calls[0][1]
    expect(options.operationName).toBe('searchLocations')
    // simulate the fetch the wrapper would do
    const fakeSignal = new AbortController().signal
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await fetchFn(fakeSignal)
    expect(globalThis.fetch.mock.calls[0][0]).toContain(
      '/locations/search?q=Newcastle%20upon%20Tyne'
    )
    globalThis.fetch = originalFetch
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { query: 'x', count: 1, results: [{ id: 'a' }] }
    fetchWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload
    })

    const result = await searchLocations('x')

    expect(result).toEqual(payload)
  })

  it('throws error when backend returns non-2xx', async () => {
    fetchWithRetry.mockResolvedValue({ ok: false, status: 502 })

    await expect(searchLocations('x')).rejects.toThrow(/502/)
  })
})
