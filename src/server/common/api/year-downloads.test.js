import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import {
  getYears,
  getDownloadLink
} from '#src/server/common/api/year-downloads.js'
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

describe('getDownloadLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the correct path and operation name', async () => {
    fetchJson.mockResolvedValue({ downloadLink: 'https://example.com/data/2025.xml' })

    await getDownloadLink(2025)

    expect(fetchJson).toHaveBeenCalledWith(
      '/years/get-download-link/2025',
      'getDownloadLink'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { downloadLink: 'https://example.com/data/2025.xml' }
    fetchJson.mockResolvedValue(payload)

    const result = await getDownloadLink(2025)

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getDownloadLink failed: 500'))

    await expect(getDownloadLink(2025)).rejects.toThrow(/500/)
  })
})
