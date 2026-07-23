import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  submitFacilitySearch,
  facilitySearchViewModel
} from '../facility-search.js'

const ERRORS = { emptyQuery: 'Enter a term', invalidChars: 'Bad characters' }

function buildRequest(payload = {}) {
  return {
    payload,
    yar: { get: vi.fn(() => ''), set: vi.fn(), clear: vi.fn() }
  }
}

function buildH() {
  const takeover = vi.fn(() => 'redirect')
  return { redirect: vi.fn(() => ({ takeover })), takeover }
}

describe('submitFacilitySearch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('persists the term and redirects to the results list on a valid term', () => {
    const request = buildRequest({ fullSearchQuery: 'Brunswick' })
    const h = buildH()

    submitFacilitySearch(request, h, {
      searchType: 'name',
      path: '/search-by-name',
      errors: ERRORS
    })

    expect(request.yar.set).toHaveBeenCalledWith('fullSearchQuery', {
      value: 'Brunswick'
    })
    expect(h.redirect).toHaveBeenCalledWith(
      '/facilities?searchType=name&q=Brunswick'
    )
  })

  it('redirects back to the page on an empty term', () => {
    const h = buildH()
    submitFacilitySearch(buildRequest({ fullSearchQuery: ' ' }), h, {
      searchType: 'name',
      path: '/search-by-name',
      errors: ERRORS
    })
    expect(h.redirect).toHaveBeenCalledWith('/search-by-name')
  })

  it('redirects back to the page on invalid characters', () => {
    const h = buildH()
    submitFacilitySearch(buildRequest({ fullSearchQuery: 'a<b>' }), h, {
      searchType: 'name',
      path: '/search-by-name',
      errors: ERRORS
    })
    expect(h.redirect).toHaveBeenCalledWith('/search-by-name')
  })
})

describe('facilitySearchViewModel', () => {
  it('builds the view-model with the action, persisted value and back link', () => {
    const request = {
      yar: {
        get: vi.fn((key) => (key === 'fullSearchQuery' ? { value: 'x' } : '')),
        clear: vi.fn()
      }
    }

    const model = facilitySearchViewModel(request, {
      content: { heading: 'Search by name' },
      path: '/search-by-name'
    })

    expect(model).toMatchObject({
      heading: 'Search by name',
      action: '/search-by-name',
      fullSearchQuery: { value: 'x' },
      displayBackLink: true,
      hrefq: '/search-facility'
    })
  })
})
