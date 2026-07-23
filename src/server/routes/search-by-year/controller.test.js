import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSearchByYear } from './controller.js'

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

describe('handleSearchByYear', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the search box on GET', () => {
    const h = buildH()
    handleSearchByYear(buildRequest(), h)

    expect(h.view.mock.calls[0][0]).toBe('search-by-year/index')
    expect(h.view.mock.calls[0][1].heading).toBe('Search by year')
  })

  it('redirects to the results list on a valid POST', () => {
    const h = buildH()
    handleSearchByYear(
      buildRequest({ method: 'post', payload: { fullSearchQuery: '2024' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/facilities?searchType=year&q=2024'
    )
  })

  it('redirects back with an error on an empty POST', () => {
    const h = buildH()
    handleSearchByYear(
      buildRequest({ method: 'post', payload: { fullSearchQuery: '' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-by-year')
  })
})
