import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/reports.js', () => ({
  getReports: vi.fn(),
  getDownloadLink: vi.fn()
}))

vi.mock('#src/server/routes/download/download-proxy.js', () => ({
  toProxyHref: (url) => url
}))

import { downloadController } from '#src/server/routes/download/controller.js'
import {
  getReports,
  getDownloadLink
} from '#src/server/common/api/reports.js'

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

  it('renders the download page with reports data from the API', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getReports).mockResolvedValueOnce({
      success: true,
      count: 2,
      results: [
        {
          id: 'report1',
          year: 2023,
          reportIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        },
        {
          id: 'report2',
          year: 2022,
          reportIsLive: true,
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
        pageTitle: 'Download Data',
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

    vi.mocked(getReports).mockRejectedValueOnce(new Error('API Error'))

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        pageTitle: 'Download Data',
        downloadLinks: []
      })
    )
  })

  it('uses Welsh content when cy language is requested', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest('cy')

    vi.mocked(getReports).mockResolvedValueOnce({
      success: true,
      count: 1,
      results: [
        {
          id: 'report1',
          year: 2023,
          reportIsLive: true,
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
        pageTitle: 'Download Data --CY',
        displayBackLink: true,
        hrefq: '/uk-pollutant-release-and-transfer-register/cy'
      })
    )
  })

  it('reverses reports order (newest first)', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getReports).mockResolvedValueOnce({
      success: true,
      count: 3,
      results: [
        {
          id: 'report1',
          year: 2021,
          reportIsLive: true,
          downloadLink: 'https://example.com/data/2021.xml'
        },
        {
          id: 'report2',
          year: 2022,
          reportIsLive: true,
          downloadLink: 'https://example.com/data/2022.xml'
        },
        {
          id: 'report3',
          year: 2023,
          reportIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        }
      ]
    })
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2021.xml'
    })
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2022.xml'
    })
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://example.com/data/2023.xml'
    })

    await downloadController.handler(request, h)

    const callArgs = h.view.mock.calls[0][1]
    expect(callArgs.downloadLinks[0].text).toContain('2023')
    expect(callArgs.downloadLinks[1].text).toContain('2022')
    expect(callArgs.downloadLinks[2].text).toContain('2021')
  })

  it('handles API response with empty reports array', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getReports).mockResolvedValueOnce({
      success: true,
      count: 0,
      results: []
    })

    await downloadController.handler(request, h)

    expect(h.view).toHaveBeenCalledWith(
      'download/index',
      expect.objectContaining({
        downloadLinks: []
      })
    )
  })

  it('handles API response with missing results property', async () => {
    const h = buildResponseToolkit()
    const request = buildRequest()

    vi.mocked(getReports).mockResolvedValueOnce({
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
