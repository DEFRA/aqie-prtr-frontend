import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/server/common/api/api-common.js', () => ({
  fetchJson: vi.fn()
}))

import { getCompetentAuthority } from '#src/server/common/api/competent-authority.js'
import { fetchJson } from '#src/server/common/api/api-common.js'

const ID = 'f-20bb38aa47c991bab94b8d7ae0a1101b'

describe('getCompetentAuthority', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchJson with the competent-authority path and operation name', async () => {
    fetchJson.mockResolvedValue({ name: 'Environment Agency (EA)' })

    await getCompetentAuthority(ID)

    expect(fetchJson).toHaveBeenCalledWith(
      `/facilities/${ID}/competent-authority`,
      'getCompetentAuthority'
    )
  })

  it('encodes the id so it cannot break out of the path', async () => {
    fetchJson.mockResolvedValue({})

    await getCompetentAuthority('f-1/../../admin')

    expect(fetchJson).toHaveBeenCalledWith(
      '/facilities/f-1%2F..%2F..%2Fadmin/competent-authority',
      'getCompetentAuthority'
    )
  })

  it('returns the parsed JSON on success', async () => {
    const payload = { name: 'Environment Agency (EA)', email: 'x@y.gov.uk' }
    fetchJson.mockResolvedValue(payload)

    expect(await getCompetentAuthority(ID)).toEqual(payload)
  })

  it('propagates errors from fetchJson', async () => {
    fetchJson.mockRejectedValue(new Error('getCompetentAuthority failed: 404'))

    await expect(getCompetentAuthority(ID)).rejects.toThrow(/404/)
  })
})
