import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/additional-detail.js', () => ({
  getAdditionalDetail: vi.fn()
}))

import { additionalDetailController } from '#src/server/routes/additional-detail/controller.js'
import { getAdditionalDetail } from '#src/server/common/api/additional-detail.js'

const YEAR = 2024
const LINE_ID = 7
const LEAD_KG = 612
const NICKEL_KG = 24
const WASTE_TONNES = 5788
const ACCIDENTAL_PERCENT = 10

const toolkit = () => ({
  view: vi.fn(() => 'view'),
  redirect: vi.fn(() => 'redirect')
})

const params = { id: 'f-1', year: String(YEAR), lineId: String(LINE_ID) }

describe('additionalDetailController', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders a release to air', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'release',
      medium: 'AIR',
      pollutant: 'Lead and compounds (as Pb)',
      total: { value: LEAD_KG, unit: 'KGM' },
      threshold: null,
      accidental: 0,
      percentAccidental: 0,
      methodBasis: 'Measured',
      methodDescription: 'Measurement by weighing.',
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    expect(h.view.mock.calls[0][0]).toBe('additional-detail/index')
    const { view, hrefq } = h.view.mock.calls[0][1]

    expect(view.heading).toBe('Additional details of release to air')
    expect(view.rows[0]).toEqual({
      key: 'Pollutant released to air',
      text: 'Lead and compounds (as Pb)'
    })
    expect(view.rows[1]).toEqual({ key: 'Total released', text: '612kg' })
    expect(view.rows[2].text).toBe('—') // threshold not available
    expect(view.rows[7].text).toBe('None') // confidentiality
    expect(view.explainers).toEqual([])
    expect(hrefq).toBe('/facility/f-1/2024')
  })

  it('renders a release to soil for medium LAND', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'release',
      medium: 'LAND',
      pollutant: 'Zinc',
      total: { value: LEAD_KG, unit: 'KGM' },
      threshold: null,
      accidental: 0,
      percentAccidental: 0,
      methodBasis: 'Measured',
      methodDescription: 'x',
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    expect(h.view.mock.calls[0][1].view.heading).toBe(
      'Additional details of release to soil'
    )
    expect(h.view.mock.calls[0][1].view.rows[0].key).toBe(
      'Pollutant released to soil'
    )
  })

  it('renders a transfer to waste water with "Total transferred"', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'transfer',
      medium: null,
      pollutant: 'Nickel and compounds (as Ni)',
      total: { value: NICKEL_KG, unit: 'KGM' },
      threshold: null,
      accidental: 0,
      percentAccidental: 0,
      methodBasis: 'Estimated',
      methodDescription: 'Estimated.',
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    const { view } = h.view.mock.calls[0][1]
    expect(view.heading).toBe('Additional details of transfer to waste water')
    expect(view.rows[0].key).toBe('Pollutant transferred to waste water')
    expect(view.rows[1]).toEqual({ key: 'Total transferred', text: '24kg' })
  })

  it('formats the accidental percentage', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'release',
      medium: 'AIR',
      pollutant: 'Lead',
      total: { value: LEAD_KG, unit: 'KGM' },
      threshold: null,
      accidental: 61,
      percentAccidental: ACCIDENTAL_PERCENT,
      methodBasis: 'Measured',
      methodDescription: 'x',
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    expect(h.view.mock.calls[0][1].view.rows[4].text).toBe('10%')
  })

  it('renders a transboundary waste transfer with receiver company, site and three explainers', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'waste',
      wasteTypeCode: 'HWOC',
      treatment: 'Disposal',
      quantity: { value: WASTE_TONNES, unit: 'TNE' },
      methodBasis: 'Measured',
      methodDescription: 'Measurement by weighing.',
      receiverCompany: {
        name: 'Portoesme s.r.l',
        address: {
          streetName: 'S.P.n.2',
          cityName: 'Portoscuso',
          postcodeCode: '09010',
          countryName: 'Italy'
        }
      },
      site: {
        streetName: 'S.P.n.2',
        cityName: 'Portoscuso',
        postcodeCode: '09010'
      },
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    const { view } = h.view.mock.calls[0][1]
    expect(view.heading).toBe(
      'Additional detail of transboundary hazardous waste transfer'
    )
    expect(view.rows[0]).toEqual({ key: 'Quantity', text: '5,788 TONNE' })
    expect(view.rows.find((r) => r.key === 'Receiver company').lines).toEqual([
      'Portoesme s.r.l',
      'S.P.n.2',
      'Portoscuso',
      '09010',
      'Italy'
    ])
    expect(view.rows.find((r) => r.key === 'Site').lines).toEqual([
      'S.P.n.2',
      'Portoscuso',
      '09010'
    ])
    expect(view.explainers.map((e) => e.heading)).toEqual([
      'What is a transboundary hazardous waste transfer?',
      'What is hazardous waste?',
      'What does disposal mean?'
    ])
  })

  it('renders a non-hazardous waste transfer with two explainers and no receiver block', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'waste',
      wasteTypeCode: 'NONHW',
      treatment: 'Recovery',
      quantity: { value: WASTE_TONNES, unit: 'TNE' },
      methodBasis: 'Measured',
      methodDescription: 'Measurement by weighing.',
      receiverCompany: null,
      site: null,
      confidentiality: null
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    const { view } = h.view.mock.calls[0][1]
    expect(view.heading).toBe(
      'Additional detail of non hazardous waste transfer'
    )
    expect(view.rows.find((r) => r.key === 'Receiver company')).toBeUndefined()
    expect(view.explainers.map((e) => e.heading)).toEqual([
      'What is non hazardous waste?',
      'What does recovery mean?'
    ])
  })

  it('shows the confidentiality reason when a line is confidential', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'waste',
      wasteTypeCode: 'HWIC',
      treatment: 'Disposal',
      quantity: { value: 0, unit: 'TNE' },
      methodBasis: 'Estimated',
      methodDescription: 'Estimated.',
      receiverCompany: null,
      site: null,
      confidentiality: {
        code: 'A42d',
        name: 'Article 4(2)(d) of Directive 2003/4/EC'
      }
    })
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    const { view } = h.view.mock.calls[0][1]
    expect(
      view.rows.find((r) => r.key === 'Confidentiality requested').text
    ).toBe('Article 4(2)(d) of Directive 2003/4/EC')
  })

  it('redirects to the problem page when the API fails', async () => {
    vi.mocked(getAdditionalDetail).mockRejectedValueOnce(new Error('boom'))
    const h = toolkit()

    await additionalDetailController.handler({ params, query: {} }, h)

    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=500'
    )
  })

  it('renders a release to water', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'release',
      medium: 'WATER',
      pollutant: 'NP/NPEs',
      total: { value: 110, unit: 'KGM' },
      threshold: null,
      accidental: 0,
      percentAccidental: 0,
      methodBasis: 'Calculated',
      methodDescription: 'Other calculation methodology.',
      confidentiality: null
    })
    const h = toolkit()
    await additionalDetailController.handler(
      { params: { id: 'f-1', year: '2024', lineId: '3' }, query: {} },
      h
    )
    const { view } = h.view.mock.calls[0][1]
    expect(view.heading).toBe('Additional details of release to water')
    expect(view.rows[0].key).toBe('Pollutant released to water')
  })

  it('renders a domestic hazardous (HWIC) waste with two explainers', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'waste',
      wasteTypeCode: 'HWIC',
      treatment: 'Recovery',
      quantity: { value: 7026, unit: 'TNE' },
      methodBasis: 'Measured',
      methodDescription: 'Measurement by weighing.',
      receiverCompany: null,
      site: null,
      confidentiality: null
    })
    const h = toolkit()
    await additionalDetailController.handler(
      { params: { id: 'f-1', year: '2024', lineId: '4' }, query: {} },
      h
    )
    const { view } = h.view.mock.calls[0][1]
    expect(view.heading).toBe(
      'Additional detail of domestic hazardous waste transfer'
    )
    expect(view.explainers.map((e) => e.heading)).toEqual([
      'What is a domestic hazardous waste transfer?',
      'What is hazardous waste?',
      'What does recovery mean?'
    ])
  })

  it('formats a threshold when one is present', async () => {
    vi.mocked(getAdditionalDetail).mockResolvedValueOnce({
      kind: 'release',
      medium: 'AIR',
      pollutant: 'Lead',
      total: { value: 612, unit: 'KGM' },
      threshold: 200, // ← non-null exercises formatThreshold
      accidental: 0,
      percentAccidental: 0,
      methodBasis: 'Measured',
      methodDescription: 'x',
      confidentiality: null
    })
    const h = toolkit()
    await additionalDetailController.handler(
      { params: { id: 'f-1', year: '2024', lineId: '1' }, query: {} },
      h
    )
    expect(h.view.mock.calls[0][1].view.rows[2].text).toBe('200kg')
  })
})
