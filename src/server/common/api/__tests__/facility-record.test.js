import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getFacilityRecord } from '#src/server/common/api/facility-record.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

const ID = 'f-20bb38aa47c991bab94b8d7ae0a1101b'

describe('getFacilityRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the record path including the year', async () => {
    fetchJson.mockResolvedValue({ year: 2023 })

    await getFacilityRecord(ID, 2023)

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/record/2023`,
      'getFacilityRecord'
    )
  })

  it('omits the year segment so the backend defaults to the latest year', async () => {
    fetchJson.mockResolvedValue({ year: 2024 })

    await getFacilityRecord(ID)

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/record`,
      'getFacilityRecord'
    )
  })

  it('accepts the year as a string as well as a number', async () => {
    fetchJson.mockResolvedValue({ year: 2023 })

    await getFacilityRecord(ID, '2023')

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/record/2023`,
      'getFacilityRecord'
    )
  })

  it('encodes the id and year so they cannot break out of the path', async () => {
    fetchJson.mockResolvedValue({})

    await getFacilityRecord('f-1/../../admin', '2024/x')

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/f-1%2F..%2F..%2Fadmin/record/2024%2Fx',
      'getFacilityRecord'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = {
      facility: { id: ID, name: 'Brunswick', nationalId: 'EW_EA-13989', reportingYears: [2024, 2023] },
      year: 2024,
      releasesToAir: [{ lineId: 7, pollutant: 'Lead', value: 612, unit: 'KGM', threshold: null }],
      releasesToWater: [],
      releasesToSoil: [],
      transfersToWasteWater: [],
      wasteTransfers: []
    }
    fetchJson.mockResolvedValue(payload)

    const result = await getFacilityRecord(ID, 2024)

    expect(result).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getFacilityRecord failed: 404'))

    await expect(getFacilityRecord(ID, 2024)).rejects.toThrow(/404/)
  })
})
