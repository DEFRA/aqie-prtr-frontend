import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSearchByRiverBasin } from './controller.js'

function buildH() {
  const takeover = vi.fn(() => 'redirect')
  return {
    view: vi.fn(() => 'view'),
    redirect: vi.fn(() => ({ takeover }))
  }
}

function buildRequest(overrides = {}) {
  return {
    method: 'get',
    query: {},
    payload: {},
    yar: { get: vi.fn(() => ''), set: vi.fn(), clear: vi.fn() },
    ...overrides
  }
}

describe('handleSearchByRiverBasin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the search box on GET', () => {
    const h = buildH()
    handleSearchByRiverBasin(buildRequest(), h)

    expect(h.view.mock.calls[0][0]).toBe('search-by-river-basin/index')
    expect(h.view.mock.calls[0][1].heading).toBe('Search by river basin')
  })

  it('redirects to the results list on a valid POST', () => {
    const h = buildH()
    handleSearchByRiverBasin(
      buildRequest({
        method: 'post',
        payload: { fullSearchQuery: 'Northumbria' }
      }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/facilities?searchType=river-basin&q=Northumbria'
    )
  })

  it('redirects back with an error on an empty POST', () => {
    const h = buildH()
    handleSearchByRiverBasin(
      buildRequest({ method: 'post', payload: { fullSearchQuery: '' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-by-river-basin')
  })
})
