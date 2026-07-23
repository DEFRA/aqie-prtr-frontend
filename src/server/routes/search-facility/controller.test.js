import { describe, it, expect, beforeEach, vi } from 'vitest'
import { handleSearchFacility } from './controller.js'

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

describe('handleSearchFacility', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the chooser with all search options on GET', () => {
    const h = buildH()
    handleSearchFacility(buildRequest(), h)

    expect(h.view.mock.calls[0][0]).toBe('search-facility/index')
    const model = h.view.mock.calls[0][1]
    expect(model.items.map((item) => item.value)).toEqual([
      'location',
      'name',
      'region',
      'river-basin',
      'year'
    ])
  })

  it('routes location to the existing location page', () => {
    const h = buildH()
    handleSearchFacility(
      buildRequest({ method: 'post', payload: { searchType: 'location' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/find-industrial-sites-by-location'
    )
  })

  it('routes name to the name search page', () => {
    const h = buildH()
    handleSearchFacility(
      buildRequest({ method: 'post', payload: { searchType: 'name' } }),
      h
    )
    expect(h.redirect).toHaveBeenCalledWith('/search-by-name')
  })

  it('re-renders with an error when no option is selected', () => {
    const set = vi.fn()
    const h = buildH()
    handleSearchFacility(
      buildRequest({
        method: 'post',
        payload: {},
        yar: { get: vi.fn(() => ''), set, clear: vi.fn() }
      }),
      h
    )
    expect(set).toHaveBeenCalledWith('chooserError', expect.any(String))
    expect(h.redirect).toHaveBeenCalledWith('/search-facility')
  })
})
