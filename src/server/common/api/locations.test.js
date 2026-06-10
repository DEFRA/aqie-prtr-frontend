import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { searchLocations } from '#src/server/common/api/locations.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

describe('searchLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the correct path and operation name', async () => {
    const payload = { query: 'Newcastle upon Tyne', count: 0, results: [] }
    fetchJson.mockResolvedValue(payload)

    await searchLocations('Newcastle upon Tyne')

    expect(fetchJson).toHaveBeenCalledWith(
      '/locations/search?q=Newcastle%20upon%20Tyne',
      'searchLocations'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { query: 'x', count: 1, results: [{ id: 'a' }] }
    fetchJson.mockResolvedValue(payload)

    const result = await searchLocations('x')

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('searchLocations failed: 502'))

    await expect(searchLocations('x')).rejects.toThrow(/502/)
  })
})
