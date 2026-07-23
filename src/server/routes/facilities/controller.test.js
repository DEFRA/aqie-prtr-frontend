import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/facilities.js', () => ({
  getFacilitiesNearby: vi.fn()
}))
vi.mock('#src/server/common/api/facility-search.js', () => ({
  searchFacilities: vi.fn()
}))

import { facilitiesController } from '#src/server/routes/facilities/controller.js'
import { getFacilitiesNearby } from '#src/server/common/api/facilities.js'
import { searchFacilities } from '#src/server/common/api/facility-search.js'

function buildResponseToolkit() {
  const takeover = vi.fn().mockReturnValue('redirect')
  return {
    view: vi.fn().mockReturnValue('view'),
    redirect: vi.fn().mockReturnValue({ takeover })
  }
}

function buildRequest(query = {}) {
  return { query }
}

describe('facilitiesController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to the search chooser when there are no search params', async () => {
    const h = buildResponseToolkit()

    await facilitiesController.handler(buildRequest({}), h)

    expect(h.redirect).toHaveBeenCalledWith('/search-facility')
    expect(getFacilitiesNearby).not.toHaveBeenCalled()
    expect(searchFacilities).not.toHaveBeenCalled()
  })

  it('renders the facilities list from a nearby (geo) search', async () => {
    vi.mocked(getFacilitiesNearby).mockResolvedValueOnce({
      count: 1,
      total: 657,
      page: 1,
      perPage: 10,
      totalPages: 66,
      results: [
        {
          id: 'f-1',
          name: 'Brunswick',
          activity: 'Disposal',
          distanceMiles: 0.1,
          latestReportingYear: 2024,
          latestReportingTypes: ['pollutantReleases', 'wasteTransfers']
        }
      ]
    })
    const h = buildResponseToolkit()

    await facilitiesController.handler(
      buildRequest({
        lat: '55',
        lng: '-1.6',
        name: 'Newcastle upon Tyne',
        page: '1'
      }),
      h
    )

    expect(getFacilitiesNearby).toHaveBeenCalledWith({
      lat: '55',
      lng: '-1.6',
      page: 1,
      perPage: 10,
      radius: 50
    })
    expect(searchFacilities).not.toHaveBeenCalled()

    const [view, model] = h.view.mock.calls[0]
    expect(view).toBe('facilities/index')
    expect(model.heading).toBe('Facilities near Newcastle upon Tyne')
    expect(model.summary).toEqual({ from: 1, to: 10, total: 657 })
    expect(model.pagination.next.href).toContain('page=2')
    expect(model.facilities[0].reporting).toEqual([
      'Pollutant releases (2024)',
      'Waste transfers (2024)'
    ])
  })

  it('renders the facilities list from a field search (searchType + q)', async () => {
    vi.mocked(searchFacilities).mockResolvedValueOnce({
      count: 1,
      total: 3,
      page: 1,
      perPage: 10,
      totalPages: 1,
      results: [
        {
          id: 'f-2',
          name: 'Ampthill Metal Recycling',
          activity: 'Disposal',
          latestReportingYear: 2024,
          latestReportingTypes: ['wasteTransfers']
        }
      ]
    })
    const h = buildResponseToolkit()

    await facilitiesController.handler(
      buildRequest({ searchType: 'name', q: 'Ampthill', page: '1' }),
      h
    )

    expect(searchFacilities).toHaveBeenCalledWith({
      searchType: 'name',
      q: 'Ampthill',
      page: 1,
      perPage: 10
    })
    expect(getFacilitiesNearby).not.toHaveBeenCalled()

    const [view, model] = h.view.mock.calls[0]
    expect(view).toBe('facilities/index')
    expect(model.heading).toBe('Facilities matching Ampthill')
    expect(model.pagination).toBeNull() // single page
    expect(model.facilities[0].reporting).toEqual(['Waste transfers (2024)'])
  })

  it('redirects to the problem page when the API fails', async () => {
    vi.mocked(getFacilitiesNearby).mockRejectedValueOnce(new Error('boom'))
    const h = buildResponseToolkit()

    await facilitiesController.handler(
      buildRequest({ lat: '55', lng: '-1.6' }),
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=500'
    )
  })
})
