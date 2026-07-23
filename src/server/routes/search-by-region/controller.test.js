import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSearchByRegion } from './controller.js'

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

describe('handleSearchByRegion', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the search box on GET', () => {
    const h = buildH()
    handleSearchByRegion(buildRequest(), h)

    expect(h.view.mock.calls[0][0]).toBe('search-by-region/index')
    expect(h.view.mock.calls[0][1].heading).toBe('Search by region or county')
  })

  it('redirects to the results list on a valid POST', () => {
    const h = buildH()
    handleSearchByRegion(
      buildRequest({
        method: 'post',
        payload: { fullSearchQuery: 'Tyne and Wear' }
      }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/facilities?searchType=region&q=Tyne+and+Wear'
    )
  })

  it('redirects back with an error on an empty POST', () => {
    const h = buildH()
    handleSearchByRegion(
      buildRequest({ method: 'post', payload: { fullSearchQuery: '' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-by-region')
  })
})
