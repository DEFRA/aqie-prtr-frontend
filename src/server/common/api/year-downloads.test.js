import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getYears } from '#src/server/common/api/year-downloads.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

describe('getYears', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the correct path and operation name', async () => {
    fetchJson.mockResolvedValue({ years: [] })

    await getYears()

    expect(fetchJson).toHaveBeenCalledWith('/years', 'getYears')
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { years: [{ year: 2025, url: '/downloads/2025.xml' }] }
    fetchJson.mockResolvedValue(payload)

    const result = await getYears()

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getYears failed: 500'))

    await expect(getYears()).rejects.toThrow(/500/)
  })
})
