import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/facility-record.js', () => ({
  getFacilityRecord: vi.fn()
}))

import { facilityRecordController } from '#src/server/routes/facility-record/controller.js'
import { getFacilityRecord } from '#src/server/common/api/facility-record.js'

const toolkit = () => ({
  view: vi.fn(() => 'view'),
  redirect: vi.fn(() => 'redirect')
})

describe('facilityRecordController', () => {
  beforeEach(() => vi.clearAllMocks())

  it('formats quantities, maps waste types and marks the current year tab', async () => {
    vi.mocked(getFacilityRecord).mockResolvedValueOnce({
      facility: {
        id: 'f-1',
        name: 'Brunswick',
        nationalId: 'EW_EA-13989',
        reportingYears: [2024, 2023]
      },
      year: 2024,
      releasesToAir: [
        {
          lineId: 7,
          pollutant: 'Lead',
          value: 612,
          unit: 'KGM',
          threshold: null
        }
      ],
      releasesToWater: [],
      releasesToSoil: [],
      transfersToWasteWater: [],
      wasteTransfers: [
        {
          lineId: 9,
          value: 134982,
          unit: 'TNE',
          wasteTypeCode: 'NONHW',
          treatment: 'Recovery'
        }
      ]
    })
    const h = toolkit()

    await facilityRecordController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )

    const model = h.view.mock.calls[0][1]
    expect(h.view.mock.calls[0][0]).toBe('facility-record/index')
    expect(model.releasesToAir[0].total).toBe('612kg')
    expect(model.releasesToAir[0].threshold).toBe('—')
    expect(model.wasteTransfers[0].quantity).toBe('134,982 TONNE')
    expect(model.wasteTransfers[0].wasteType).toBe('Non hazardous waste')
    expect(model.yearTabs.find((tab) => tab.current).year).toBe(2024)
    expect(model.hasAnyData).toBe(true)
  })

  it('redirects to the problem page when the API fails', async () => {
    vi.mocked(getFacilityRecord).mockRejectedValueOnce(new Error('boom'))
    const h = toolkit()
    await facilityRecordController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )
    expect(h.redirect).toHaveBeenCalledWith(
      '/problem-with-service?statusCode=500'
    )
  })

  it('renders the no-data state when every section is empty', async () => {
    vi.mocked(getFacilityRecord).mockResolvedValueOnce({
      facility: {
        id: 'f-1',
        name: 'X',
        nationalId: 'Y',
        reportingYears: [2024]
      },
      year: 2024,
      releasesToAir: [],
      releasesToWater: [],
      releasesToSoil: [],
      transfersToWasteWater: [],
      wasteTransfers: []
    })
    const h = toolkit()
    await facilityRecordController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )
    expect(h.view.mock.calls[0][1].hasAnyData).toBe(false)
  })

  it('renders — for a null release value and falls back for unknown waste type', async () => {
    vi.mocked(getFacilityRecord).mockResolvedValueOnce({
      facility: {
        id: 'f-1',
        name: 'X',
        nationalId: 'Y',
        reportingYears: [2024]
      },
      year: 2024,
      releasesToAir: [
        {
          lineId: 1,
          pollutant: 'Pb',
          value: null,
          unit: 'KGM',
          threshold: null
        }
      ],
      releasesToWater: [],
      releasesToSoil: [],
      transfersToWasteWater: [],
      wasteTransfers: [
        {
          lineId: 2,
          value: 5,
          unit: 'TNE',
          wasteTypeCode: 'ZZZ',
          treatment: null
        }
      ]
    })
    const h = toolkit()
    await facilityRecordController.handler(
      { params: { id: 'f-1' }, query: {} },
      h
    )
    const m = h.view.mock.calls[0][1]
    expect(m.releasesToAir[0].total).toBe('—')
    expect(m.wasteTransfers[0].wasteType).toBe('ZZZ') // fell back to the raw code
    expect(m.wasteTransfers[0].treatment).toBe(m.table ? '—' : '—')
  })
})
