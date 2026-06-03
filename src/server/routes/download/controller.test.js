import { createServer } from '../../server.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { vi, describe, test, beforeAll, afterAll, beforeEach } from 'vitest'

vi.mock('#src/server/common/api/locations.js', () => ({
  getYears: vi.fn()
}))

import { getYears } from '#src/server/common/api/locations.js'

describe('#downloadController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('Should provide expected response', async () => {
    // Mock the getYears API to return test data
    vi.mocked(getYears).mockResolvedValueOnce({
      success: true,
      count: 2,
      years: [
        {
          id: 'year1',
          year: 2023,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2023.xml'
        },
        {
          id: 'year2',
          year: 2022,
          yearIsLive: true,
          downloadLink: 'https://example.com/data/2022.xml'
        }
      ]
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year'
    })

    expect(result).toEqual(expect.stringContaining('Download Data'))
    expect(result).toEqual(expect.stringContaining('2023'))
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should handle API error gracefully', async () => {
    // Mock the getYears API to throw an error
    vi.mocked(getYears).mockRejectedValueOnce(new Error('API Error'))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year'
    })

    // Should still render the page with empty download links
    expect(statusCode).toBe(statusCodes.ok)
  })
})
