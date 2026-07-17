import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getFacilitiesNearby } from '#src/server/common/api/facilities.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

describe('getFacilitiesNearby', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the nearby path and operation name', async () => {
    fetchJson.mockResolvedValue({ results: [] })

    await getFacilitiesNearby({
      lat: 55,
      lng: -1.6,
      page: 2,
      perPage: 10,
      radius: 50
    })

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/nearby?lat=55&lng=-1.6&page=2&perPage=10&radius=50',
      'getFacilitiesNearby'
    )
  })

  it('applies default page, perPage and radius', async () => {
    fetchJson.mockResolvedValue({ results: [] })

    await getFacilitiesNearby({ lat: 55, lng: -1.6 })

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/nearby?lat=55&lng=-1.6&page=1&perPage=10&radius=50',
      'getFacilitiesNearby'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = {
      count: 1,
      total: 657,
      page: 1,
      perPage: 10,
      totalPages: 66,
      results: [{ id: 'f-1' }]
    }
    fetchJson.mockResolvedValue(payload)

    const result = await getFacilitiesNearby({ lat: 55, lng: -1.6 })

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getFacilitiesNearby failed: 500'))

    await expect(getFacilitiesNearby({ lat: 55, lng: -1.6 })).rejects.toThrow(
      /500/
    )
  })
})
