import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/facility-details.js', () => ({
  getFacilityDetails: vi.fn()
}))

import { facilityDetailsController } from '#src/server/routes/facility-details/controller.js'
import { getFacilityDetails } from '#src/server/common/api/facility-details.js'

const toolkit = () => ({
  view: vi.fn(() => 'view'),
  redirect: vi.fn(() => 'redirect')
})

const DTO = {
  id: 'f-1',
  name: 'Brunswick Waste Reception Site',
  nationalId: 'EW_EA-13989',
  activity: '5c Disposal of non-hazardous waste',
  ippcCode: null,
  address: {
    street: 'Brunswick Industrial Est',
    city: 'Newcastle Upon Tyne',
    postcode: 'NE13 7'
  },
  coordinates: { lat: 55.046479, lng: -1.643142 },
  nutsRegion: { name: 'Northumberland and Tyne and Wear', code: 'UKC2' },
  naceCode: '38.21',
  naceName: 'Treatment and disposal of non-hazardous waste',
  riverBasin: 'Northumbria'
}

describe('facilityDetailsController', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the details view-model with joined NUTS, NACE and coordinates', async () => {
    vi.mocked(getFacilityDetails).mockResolvedValueOnce(DTO)
    const h = toolkit()

    await facilityDetailsController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )

    expect(h.view.mock.calls[0][0]).toBe('facility-details/index')
    const model = h.view.mock.calls[0][1]

    expect(model.view.coordinates).toBe('55.046479, -1.643142')
    expect(model.view.nutsRegion).toBe(
      'Northumberland and Tyne and Wear (UKC2)'
    )
    expect(model.view.nace).toBe(
      '38.21 - Treatment and disposal of non-hazardous waste'
    )
    expect(model.view.addressLines).toEqual([
      'Brunswick Industrial Est',
      'Newcastle Upon Tyne',
      'NE13 7'
    ])
    expect(model.hrefq).toBe('/facility/f-1')
  })

  it('renders an em dash for a missing IPPC code', async () => {
    vi.mocked(getFacilityDetails).mockResolvedValueOnce(DTO)
    const h = toolkit()

    await facilityDetailsController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )

    expect(h.view.mock.calls[0][1].view.ippcCode).toBe('—')
  })

  it('handles a facility with no location, address or nuts region', async () => {
    vi.mocked(getFacilityDetails).mockResolvedValueOnce({
      id: 'f-2',
      name: 'X',
      nationalId: 'Y'
    })
    const h = toolkit()

    await facilityDetailsController.handler(
      { params: { id: 'f-2' }, query: {} },
      h
    )

    const { view } = h.view.mock.calls[0][1]
    expect(view.coordinates).toBe('—')
    expect(view.nutsRegion).toBe('—')
    expect(view.addressLines).toEqual([])
  })

  it('redirects to the problem page when the API fails', async () => {
    vi.mocked(getFacilityDetails).mockRejectedValueOnce(new Error('boom'))
    const h = toolkit()

    await facilityDetailsController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=500'
    )
  })
})
