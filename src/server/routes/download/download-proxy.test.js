import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReadableStream } from 'node:stream/web'
import { handleDownload } from '#src/server/routes/download/download-proxy.js'

vi.mock('#src/server/common/api/reports.js', () => ({
  getDownloadLink: vi.fn()
}))

import { getDownloadLink } from '#src/server/common/api/reports.js'

describe('handleDownload', () => {
  function buildH() {
    const response = {
      type: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis()
    }
    return {
      h: {
        response: vi.fn().mockReturnValue(response),
        redirect: vi.fn().mockReturnValue({})
      },
      response
    }
  }

  function buildRequest(year) {
    return { params: { year } }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches presigned URL and streams file with attachment header', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('xml'))
        controller.close()
      }
    })

    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://s3.example.com/data/2023.xml?presigned=token'
    })

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
      headers: {
        get: (name) => (name === 'content-type' ? 'application/xml' : null)
      }
    })

    const { h, response } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(getDownloadLink).toHaveBeenCalledWith('2023')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://s3.example.com/data/2023.xml?presigned=token'
    )
    expect(response.type).toHaveBeenCalledWith('application/xml')
    expect(response.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="uk_prtr_dataset_2023.xml"'
    )
  })

  it('redirects to error page when getDownloadLink fails', async () => {
    vi.mocked(getDownloadLink).mockRejectedValueOnce(new Error('API Error'))

    const { h } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=502'
    )
  })

  it('redirects to error page when downloadLink is missing', async () => {
    vi.mocked(getDownloadLink).mockResolvedValueOnce({})

    const { h } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=502'
    )
  })

  it('redirects to error page when presigned URL is invalid', async () => {
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'not-a-valid-url'
    })

    const { h } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=502'
    )
  })

  it('redirects to error page when presigned URL is not https', async () => {
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'http://example.com/data/2023.xml'
    })

    const { h } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=502'
    )
  })

  it('redirects to error page when upstream request fails', async () => {
    vi.mocked(getDownloadLink).mockResolvedValueOnce({
      downloadLink: 'https://s3.example.com/data/2023.xml?presigned=token'
    })

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      body: null,
      headers: { get: () => null }
    })

    const { h } = buildH()
    const request = buildRequest('2023')

    await handleDownload(request, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=502'
    )
  })
})
