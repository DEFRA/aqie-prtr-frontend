import { statusCodes } from '../common/constants/status-codes.js'
import hapi from '@hapi/hapi'
import inert from '@hapi/inert'
import { serveStaticFiles } from './serve-static-files.js'

describe('#serveStaticFiles', () => {
  let server

  describe('When secure context is disabled', () => {
    beforeEach(async () => {
      server = hapi.Server()
      await server.register(inert)
      await server.register(serveStaticFiles)
      await server.initialize()
    })

    afterEach(async () => {
      await server.stop()
    })

    test('Should serve favicon as expected', async () => {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: '/favicon.ico'
      })

      expect(statusCode).toBe(statusCodes.noContent)
    })
  })
})
