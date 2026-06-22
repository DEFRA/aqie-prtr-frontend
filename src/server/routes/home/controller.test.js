import { createServer } from '../../server.js'
import { statusCodes } from '../../common/constants/status-codes.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response for English', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/uk-pollutant-release-and-transfer-register/en'
    })

    expect(result).toEqual(
      expect.stringContaining('Search industrial pollutant emissions |')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should provide expected response for Welsh', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/uk-pollutant-release-and-transfer-register/cy'
    })

    expect(result).toEqual(
      expect.stringContaining('Search industrial pollutant emissions --CY |')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should provide expected response with default language when not specified', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/uk-pollutant-release-and-transfer-register'
    })

    expect(result).toEqual(
      expect.stringContaining('Search industrial pollutant emissions |')
    )
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should reject request with invalid language parameter', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/uk-pollutant-release-and-transfer-register/fr'
    })

    expect(statusCode).toBe(statusCodes.badRequest)
  })
})
