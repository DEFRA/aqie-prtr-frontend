import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getReports, getDownloadLink } from '#src/server/common/api/reports.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

describe('getReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the correct path and operation name', async () => {
    fetchJson.mockResolvedValue({ results: [] })

    await getReports()

    expect(fetchJson).toHaveBeenCalledWith('/reports', 'getReports')
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { results: [{ year: 2025, url: '/downloads/2025.xml' }] }
    fetchJson.mockResolvedValue(payload)

    const result = await getReports()

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getReports failed: 500'))

    await expect(getReports()).rejects.toThrow(/500/)
  })
})

describe('getDownloadLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the correct path and operation name', async () => {
    fetchJson.mockResolvedValue({
      downloadLink: 'https://example.com/data/2025.xml'
    })

    await getDownloadLink(2025)

    expect(fetchJson).toHaveBeenCalledWith(
      '/reports/get-download-link/2025',
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
