import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/competent-authority.js', () => ({
  getCompetentAuthority: vi.fn()
}))

import { competentAuthorityController } from '#src/server/routes/competent-authority/controller.js'
import { getCompetentAuthority } from '#src/server/common/api/competent-authority.js'

const toolkit = () => ({
  view: vi.fn(() => 'view'),
  redirect: vi.fn(() => 'redirect')
})

const DTO = {
  facilityId: 'f-1',
  facilityName: 'Brunswick Waste Reception Site',
  sourceYear: 2024,
  name: 'Environment Agency (EA)',
  agency: 'EA',
  contactPersonName: 'Pollution Inventory team',
  address: {
    street: 'Parkway Avenue',
    building: 'Quadrant Two',
    city: 'Sheffield',
    postcode: 'S9 4WF'
  },
  telephone: '+44 03708506506',
  fax: null,
  email: 'pollution.inventory@environment-agency.gov.uk'
}

describe('competentAuthorityController', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the authority with address lines in order', async () => {
    vi.mocked(getCompetentAuthority).mockResolvedValueOnce(DTO)
    const h = toolkit()

    await competentAuthorityController.handler({ params: { id: 'f-1' }, query: {} }, h)

    expect(h.view.mock.calls[0][0]).toBe('competent-authority/index')
    const model = h.view.mock.calls[0][1]

    expect(model.view.name).toBe('Environment Agency (EA)')
    expect(model.view.contactPersonName).toBe('Pollution Inventory team')
    expect(model.view.addressLines).toEqual([
      'Parkway Avenue',
      'Quadrant Two',
      'Sheffield',
      'S9 4WF'
    ])
    expect(model.view.telephone).toBe('+44 03708506506')
    expect(model.view.email).toBe('pollution.inventory@environment-agency.gov.uk')
    expect(model.hrefq).toBe('/facility/f-1')
  })

  it('shows "Not provided" for a missing fax', async () => {
    vi.mocked(getCompetentAuthority).mockResolvedValueOnce(DTO)
    const h = toolkit()

    await competentAuthorityController.handler({ params: { id: 'f-1' }, query: {} }, h)

    expect(h.view.mock.calls[0][1].view.fax).toBe('Not provided')
  })

  it('leaves email null when absent so the view renders "Not provided" instead of a mailto', async () => {
    vi.mocked(getCompetentAuthority).mockResolvedValueOnce({ ...DTO, email: null })
    const h = toolkit()

    await competentAuthorityController.handler({ params: { id: 'f-1' }, query: {} }, h)

    expect(h.view.mock.calls[0][1].view.email).toBeNull()
  })

  it('handles an authority with no contact block at all', async () => {
    vi.mocked(getCompetentAuthority).mockResolvedValueOnce({
      facilityId: 'f-2',
      facilityName: 'X',
      sourceYear: null,
      name: 'Environment Agency (EA)',
      contactPersonName: null,
      address: null,
      telephone: null,
      fax: null,
      email: null
    })
    const h = toolkit()

    await competentAuthorityController.handler({ params: { id: 'f-2' }, query: {} }, h)

    const { view } = h.view.mock.calls[0][1]
    expect(view.addressLines).toEqual([])
    expect(view.telephone).toBe('Not provided')
    expect(view.contactPersonName).toBe('Not provided')
  })

  it('redirects to the problem page when the API fails', async () => {
    vi.mocked(getCompetentAuthority).mockRejectedValueOnce(new Error('boom'))
    const h = toolkit()

    await competentAuthorityController.handler({ params: { id: 'f-1' }, query: {} }, h)

    expect(h.redirect).toHaveBeenCalledWith('/problem-with-service?statusCode=500')
  })
})
