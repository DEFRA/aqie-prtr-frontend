import { describe, it, expect, vi } from 'vitest'

import { handleNoLocationFoundGet } from '#src/server/routes/no-location-found/controller.js'

function buildResponseToolkit() {
  return { view: vi.fn().mockReturnValue({}) }
}

function buildRequest({ yarStore = {}, query = {} } = {}) {
  return {
    query,
    yar: {
      get: (key) => yarStore[key]
    }
  }
}

describe('handleNoLocationFoundGet', () => {
  it('renders no-location-found/index with English content by default', () => {
    const h = buildResponseToolkit()

    handleNoLocationFoundGet(
      buildRequest({ yarStore: { fullSearchQuery: { value: 'newcastle' } } }),
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'no-location-found/index',
      expect.objectContaining({
        pageTitle: 'No locations found',
        titlePrefix: 'We could not find',
        searchLocation: 'newcastle',
        suggestions: expect.any(Array),
        lang: 'en'
      })
    )
  })

  it('uses Welsh content when ?lang=cy', () => {
    const h = buildResponseToolkit()

    handleNoLocationFoundGet(
      buildRequest({
        query: { lang: 'cy' },
        yarStore: { fullSearchQuery: { value: 'caerdydd' } }
      }),
      h
    )

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.lang).toBe('cy')
    expect(viewData.pageTitle).toContain('--CY')
    expect(viewData.searchLocation).toBe('caerdydd')
  })

  it('renders with empty searchLocation when session has no query', () => {
    const h = buildResponseToolkit()

    handleNoLocationFoundGet(buildRequest(), h)

    expect(h.view).toHaveBeenCalledWith(
      'no-location-found/index',
      expect.objectContaining({ searchLocation: '' })
    )
  })
})
