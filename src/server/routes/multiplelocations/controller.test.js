import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/locations.js', () => ({
  searchLocations: vi.fn()
}))

import { handleMultipleLocations } from '#src/server/routes/multiplelocations/controller.js'
import { searchLocations } from '#src/server/common/api/locations.js'

function buildResponseToolkit() {
  const redirectChain = {
    takeover: vi.fn().mockReturnValue({ isRedirect: true })
  }
  return {
    view: vi.fn().mockReturnValue({}),
    redirect: vi.fn().mockReturnValue(redirectChain)
  }
}

function buildRequest({ payload = {}, yarStore = {}, query = {} } = {}) {
  return {
    payload,
    query,
    yar: {
      get: (key) => yarStore[key],
      set: vi.fn((key, value) => {
        yarStore[key] = value
      }),
      clear: vi.fn((key) => {
        delete yarStore[key]
      })
    }
  }
}

const newcastle = {
  id: 'newcastle',
  name: 'Newcastle upon Tyne',
  lng: -1.61,
  lat: 54.97
}
const newcastleUnderLyme = {
  id: 'newcastle-under-lyme',
  name: 'Newcastle-under-Lyme',
  lng: -2.22,
  lat: 53.0
}

describe('handleMultipleLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /find-industrial-sites-by-location when query is empty', async () => {
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: '' } }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/find-industrial-sites-by-location'
    )
    expect(searchLocations).not.toHaveBeenCalled()
  })

  it('redirects to /find-industrial-sites-by-location when query contains forbidden special chars', async () => {
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'newcastle$$$' } }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/find-industrial-sites-by-location'
    )
    expect(searchLocations).not.toHaveBeenCalled()
  })

  it('redirects to /no-location-found when BFF returns 0 matches', async () => {
    searchLocations.mockResolvedValue({ count: 0, results: [] })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'xyz' } }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith('/no-location-found')
  })

  it('renders disambiguation view when 1 match', async () => {
    searchLocations.mockResolvedValue({ count: 1, results: [newcastle] })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'newcastle' } }),
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'multiplelocations/index',
      expect.objectContaining({ results: [newcastle] })
    )
  })

  it('renders disambiguation view when >1 matches', async () => {
    searchLocations.mockResolvedValue({
      count: 2,
      results: [newcastle, newcastleUnderLyme]
    })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'newcastle' } }),
      h
    )

    expect(h.view).toHaveBeenCalledWith(
      'multiplelocations/index',
      expect.objectContaining({
        searchLocation: 'newcastle',
        results: expect.arrayContaining([newcastle, newcastleUnderLyme])
      })
    )
  })

  it('redirects to /problem-with-service when searchLocations rejects', async () => {
    searchLocations.mockRejectedValue(new Error('upstream boom'))
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'newcastle' } }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=500'
    )
  })

  it('uses Welsh content when ?lang=cy is set', async () => {
    searchLocations.mockResolvedValue({
      count: 2,
      results: [newcastle, newcastleUnderLyme]
    })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({
        payload: { fullSearchQuery: 'newcastle' },
        query: { lang: 'cy' }
      }),
      h
    )

    const viewData = h.view.mock.calls[0][1]
    expect(viewData.pageTitle).toContain('--CY')
  })

  it('persists fullSearchQuery to session from payload', async () => {
    searchLocations.mockResolvedValue({ count: 1, results: [newcastle] })
    const yarStore = {}
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'newcastle' }, yarStore }),
      h
    )

    expect(yarStore.fullSearchQuery).toEqual({ value: 'newcastle' })
  })

  it('falls back to session fullSearchQuery when payload is empty', async () => {
    searchLocations.mockResolvedValue({
      count: 2,
      results: [newcastle, newcastleUnderLyme]
    })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({
        payload: {},
        yarStore: { fullSearchQuery: { value: 'newcastle' } }
      }),
      h
    )

    expect(searchLocations).toHaveBeenCalledWith('newcastle')
  })

  it('handles a missing results field on the BFF response as empty matches', async () => {
    searchLocations.mockResolvedValue({ count: 0 })
    const h = buildResponseToolkit()

    await handleMultipleLocations(
      buildRequest({ payload: { fullSearchQuery: 'xyz' } }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith('/no-location-found')
  })
})
