import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/locations.js', () => ({
  getYears: vi.fn()
}))

import { downloadController } from '#src/server/routes/download/controller.js'
import { getYears } from '#src/server/common/api/locations.js'

function buildResponseToolkit() {
  return {
    view: vi.fn().mockReturnValue({})
  }
}

function buildRequest() {
  return {
    params: { language: 'en' }
  }
}

describe('downloadController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the download page with years data from the API', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 2,
      years: [
        {
          id: 'year1',
          year: 2023,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        },
        {
          id: 'year2',
          year: 2022,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2022.xml'
        }
      ]
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        pageTitle: 'Download Data',
        downloadLinks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringContaining('2023'),
            href: 'https://example.com/data/2023.xml'
          }),
          expect.objectContaining({
            text: expect.stringContaining('2022'),
            href: 'https://example.com/data/2022.xml'
          })
        ])
      })
    )
  })

  it('handles API errors gracefully and renders with empty download links', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getYears).mockRejectedValueOnce(new Error('API Error'))

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        pageTitle: 'Download Data',
        downloadLinks: []
      })
    )
  })
})
