import { describe, it, expect, beforeEach, vi } from 'vitest'

import { handleSearchLocationGet } from '#src/server/routes/find-industrial-sites-by-location/controller.js'

function buildResponseToolkit() {
  const h = { view: vi.fn().mockReturnValue({}) }
  return h
}

function buildRequest({
  pathname = '/find-industrial-sites-by-location',
  yarStore = {},
  query = {}
} = {}) {
  return {
    url: { pathname },
    query,
    yar: {
      get: (key) => yarStore[key],
      set: (key, value) => {
        yarStore[key] = value
      },
      clear: (key) => {
        delete yarStore[key]
      }
    }
  }
}

describe('handleSearchLocationGet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with content keys', () => {
    const h = buildResponseToolkit()
    handleSearchLocationGet(buildRequest(), h)

    expect(h.view).toHaveBeenCalledWith(
      'search-location/index',
      expect.objectContaining({
        pageTitle: 'Search for a facility',
        heading: expect.any(String),
        buttonText: 'Continue'
      })
    )
  })

  it('clears prior session state when on /searchagain', () => {
    const yarStore = {
      fullSearchQuery: { value: 'old' },
      locationsResult: { count: 1 },
      facilitiesResult: { count: 5 }
    }
    const request = buildRequest({
      pathname: '/find-industrial-sites-by-location/searchagain',
      yarStore
    })
    const h = buildResponseToolkit()

    handleSearchLocationGet(request, h)

    expect(yarStore.fullSearchQuery).toBeUndefined()
    expect(yarStore.locationsResult).toBeUndefined()
    expect(yarStore.facilitiesResult).toBeUndefined()
  })

  it('passes errors from session into the view', () => {
    const yarStore = {
      errors: { list: [{ text: 'oops' }] },
      errorMessage: { message: { text: 'oops' } }
    }
    const request = buildRequest({ yarStore })
    const h = buildResponseToolkit()

    handleSearchLocationGet(request, h)

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.errors).toEqual({ list: [{ text: 'oops' }] })
    expect(viewData.errorMessage.message.text).toBe('oops')
  })
})
