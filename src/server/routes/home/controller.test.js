import { createServer } from '#src/server/server.js'
import { statusCodes } from '#src/server/common/constants/status-codes.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/uk-pollutant-release-and-transfer-register/en'
    })

    expect(result).toEqual(
      expect.stringContaining(
        'UK Pollutant Release and Transfer Register (PRTR) |'
      )
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
