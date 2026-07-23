import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSearchByName } from './controller.js'

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

describe('handleSearchByName', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the search box on GET', () => {
    const h = buildH()
    handleSearchByName(buildRequest(), h)

    expect(h.view.mock.calls[0][0]).toBe('search-by-name/index')
    const model = h.view.mock.calls[0][1]
    expect(model.action).toBe('/search-by-name')
    expect(model.heading).toBe('Search by name of facility')
  })

  it('redirects to the results list on a valid POST', () => {
    const h = buildH()
    handleSearchByName(
      buildRequest({
        method: 'post',
        payload: { fullSearchQuery: 'Brunswick' }
      }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/facilities?searchType=name&q=Brunswick'
    )
  })

  it('redirects back with an error on an empty POST', () => {
    const h = buildH()
    handleSearchByName(
      buildRequest({ method: 'post', payload: { fullSearchQuery: '' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-by-name')
  })
})
