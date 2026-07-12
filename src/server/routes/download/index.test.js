import { createServer } from '../../server.js'
import { statusCodes } from '../../common/constants/status-codes.js'
import { vi } from 'vitest'

vi.mock('#src/server/common/api/reports.js', () => ({
  getReports: vi.fn().mockResolvedValue({
    success: true,
    count: 0,
    results: []
  }),
  getDownloadLink: vi.fn()
}))

describe('download route', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET /download-all-data-for-a-year with default language (en)', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('GET /download-all-data-for-a-year/en returns English content', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year/en'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('GET /download-all-data-for-a-year/cy returns Welsh content', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year/cy'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('GET /download-all-data-for-a-year/fr rejects invalid language', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year/fr'
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })

  test('GET /download-all-data-for-a-year/de rejects invalid language', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/download-all-data-for-a-year/de'
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })
})
