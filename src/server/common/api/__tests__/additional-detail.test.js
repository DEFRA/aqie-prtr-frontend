import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getAdditionalDetail } from '#src/server/common/api/additional-detail.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

const ID = 'f-20bb38aa47c991bab94b8d7ae0a1101b'
const YEAR = 2024
const LINE_ID = 7

describe('getAdditionalDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the line path and operation name', async () => {
    fetchJson.mockResolvedValue({ kind: 'release' })

    await getAdditionalDetail(ID, YEAR, LINE_ID)

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/record/${YEAR}/lines/${LINE_ID}`,
      'getAdditionalDetail'
    )
  })

  it('encodes every segment so none can break out of the path', async () => {
    fetchJson.mockResolvedValue({})

    await getAdditionalDetail('f-1/../admin', '2024/x', '7/y')

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/f-1%2F..%2Fadmin/record/2024%2Fx/lines/7%2Fy',
      'getAdditionalDetail'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = {
      kind: 'waste',
      wasteTypeCode: 'NONHW',
      treatment: 'Recovery'
    }
    fetchJson.mockResolvedValue(payload)

    expect(await getAdditionalDetail(ID, YEAR, LINE_ID)).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getAdditionalDetail failed: 404'))

    await expect(getAdditionalDetail(ID, YEAR, LINE_ID)).rejects.toThrow(/404/)
  })
})
