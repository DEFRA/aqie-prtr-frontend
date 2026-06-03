import { multipleLocationsController } from './controller.js'

export const multiplelocations = {
  plugin: {
    name: 'multiplelocations',
    register(server) {
      server.route([
        {
          method: 'POST',
          path: '/multiplelocations',
          ...multipleLocationsController
        },
        {
          method: 'GET',
          path: '/multiplelocations',
          ...multipleLocationsController
        }
      ])
    }
  }
}
