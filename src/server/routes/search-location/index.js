import { searchLocationController } from './controller.js'

export const searchLocation = {
  plugin: {
    name: 'search-location',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/search-location',
          ...searchLocationController
        },
        {
          method: 'POST',
          path: '/search-location',
          ...searchLocationController
        },
        {
          method: 'GET',
          path: '/search-location/searchagain',
          ...searchLocationController
        }
      ])
    }
  }
}
