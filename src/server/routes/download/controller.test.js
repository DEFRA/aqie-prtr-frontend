import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/year-downloads.js', () => ({
  getYears: vi.fn(),
  getDownloadLink: vi.fn()
}))

vi.mock('#src/server/routes/download/download-proxy.js', () => ({
  toProxyHref: (url) => url
}))

import { downloadController } from '#src/server/routes/download/controller.js'
import {
  getYears,
  getDownloadLink
} from '#src/server/common/api/year-downloads.js'

function buildResponseToolkit() {
  return {
    view: vi.fn().mockReturnValue({})
  }
}

function buildRequest(language) {
  return {
    params: { language }
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
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2023.xml'
    })
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2022.xml'
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        pageTitle: 'Download all data for a year',
        displayBackLink: true,
        hrefq: '/uk-pollutant-release-and-transfer-register',
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
        pageTitle: 'Download all data for a year',
        downloadLinks: []
      })
    )
  })

  it('uses Welsh content when cy language is requested', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest('cy')

    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 1,
      years: [
        {
          id: 'year1',
          year: 2023,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        }
      ]
    })
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2023.xml'
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        pageTitle: 'Download all data for a year --CY',
        displayBackLink: true,
        hrefq: '/uk-pollutant-release-and-transfer-register/cy'
      })
    )
  })

  it('reverses years order (newest first)', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 3,
      years: [
        {
          id: 'year3',
          year: 2023,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        },
        {
          id: 'year2',
          year: 2022,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2022.xml'
        },
        {
          id: 'year1',
          year: 2021,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2021.xml'
        }
      ]
    })

    await downloadController.handler(request, h)

    const callArgs = h.view.mock.calls[0][1]
    expect(callArgs.downloadLinks[0].text).toContain('2023')
    expect(callArgs.downloadLinks[1].text).toContain('2022')
    expect(callArgs.downloadLinks[2].text).toContain('2021')
  })

  it('handles API response with empty years array', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 0,
      years: []
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        downloadLinks: []
      })
    )
  })

  it('handles API response with missing years property', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 0
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        downloadLinks: []
      })
    )
  })
})
