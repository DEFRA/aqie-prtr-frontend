import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getFacilityDetails } from '#src/server/common/api/facility-details.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

const ID = 'f-20bb38aa47c991bab94b8d7ae0a1101b'

describe('getFacilityDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the details path and operation name', async () => {
    fetchJson.mockResolvedValue({ id: ID })

    await getFacilityDetails(ID)

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/details`,
      'getFacilityDetails'
    )
  })

  it('encodes the id so it cannot break out of the path', async () => {
    fetchJson.mockResolvedValue({})

    await getFacilityDetails('f-1/../../admin')

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/f-1%2F..%2F..%2Fadmin/details',
      'getFacilityDetails'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { id: ID, name: 'Brunswick', nationalId: 'EW_EA-13989' }
    fetchJson.mockResolvedValue(payload)

    expect(await getFacilityDetails(ID)).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getFacilityDetails failed: 404'))

    await expect(getFacilityDetails(ID)).rejects.toThrow(/404/)
  })
})
