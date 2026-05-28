import { noLocationFoundController } from './controller.js'

export const noLocationFound = {
  plugin: {
    name: 'no-location-found',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/no-location-found',
          ...noLocationFoundController
        }
      ])
    }
  }
}
