import { describe, it, expect, vi } from 'vitest'
import { ReadableStream } from 'node:stream/web'
import {
  toProxyHref,
  handleDownloadFile
} from '#src/server/routes/download/download-proxy.js'

describe('toProxyHref', () => {
  it('builds a same-origin proxy URL', () => {
    expect(toProxyHref('https://example.com/data/2023.xml', 2023)).toBe(
      '/download-all-data-for-a-year/file?url=https%3A%2F%2Fexample.com%2Fdata%2F2023.xml&year=2023'
    )
  })
})

describe('handleDownloadFile', () => {
  function buildH() {
    const response = {
      code: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis()
    }
    return { h: { response: vi.fn().mockReturnValue(response) }, response }
  }

  it('streams file with attachment header', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('xml'))
        controller.close()
      }
    })

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
      headers: { get: (name) => (name === 'content-type' ? 'application/xml' : null) }
    })

    const { h, response } = buildH()
    await handleDownloadFile(
      { query: { url: 'https://example.com/data/2023.xml', year: '2023' } },
      h
    )

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/data/2023.xml')
    expect(response.type).toHaveBeenCalledWith('application/xml')
    expect(response.header).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="uk_prtr_dataset_2023.xml"'
    )
  })

  it('rejects non-https URLs', async () => {
    const { h, response } = buildH()
    await handleDownloadFile(
      { query: { url: 'http://example.com/data/2023.xml', year: '2023' } },
      h
    )

    expect(h.response).toHaveBeenCalledWith('Download URL must use https')
    expect(response.code).toHaveBeenCalledWith(400)
  })

  it('rejects invalid URLs', async () => {
    const { h, response } = buildH()
    await handleDownloadFile({ query: { url: 'not-a-url', year: '2023' } }, h)

    expect(h.response).toHaveBeenCalledWith('Invalid download URL')
    expect(response.code).toHaveBeenCalledWith(400)
  })

  it('returns 502 when upstream request fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      body: null,
      headers: { get: () => null }
    })

    const { h, response } = buildH()
    await handleDownloadFile(
      { query: { url: 'https://example.com/data/2023.xml', year: '2023' } },
      h
    )

    expect(h.response).toHaveBeenCalledWith('Unable to download file')
    expect(response.code).toHaveBeenCalledWith(502)
  })
})
