import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { searchFacilities } from '#src/server/common/api/facility-search.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

describe('searchFacilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the search path and operation name', async () => {
    fetchJson.mockResolvedValue({ results: [] })

    await searchFacilities({ searchType: 'name', q: 'Brunswick', page: 2 })

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/search?searchType=name&q=Brunswick&page=2&perPage=10',
      'searchFacilities'
    )
  })

  it('applies default page and perPage', async () => {
    fetchJson.mockResolvedValue({ results: [] })

    await searchFacilities({ searchType: 'year', q: '2024' })

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/search?searchType=year&q=2024&page=1&perPage=10',
      'searchFacilities'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = {
      count: 1,
      total: 1,
      page: 1,
      perPage: 10,
      totalPages: 1,
      results: [{ id: 'f-1' }]
    }
    fetchJson.mockResolvedValue(payload)

    expect(await searchFacilities({ searchType: 'name', q: 'x' })).toEqual(
      payload
    )
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('searchFacilities failed: 500'))

    await expect(
      searchFacilities({ searchType: 'name', q: 'x' })
    ).rejects.toThrow(/500/)
  })
})
