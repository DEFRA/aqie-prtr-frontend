import { searchLocationController } from './controller.js'

export const searchLocation = {
  plugin: {
    name: 'search-location',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/find-industrial-sites-by-locationn',
          ...searchLocationController
        },
        {
          method: 'POST',
          path: '/find-industrial-sites-by-location',
          ...searchLocationController
        },
        {
          method: 'GET',
          path: '/find-industrial-sites-by-location/searchagain',
          ...searchLocationController
        }
      ])
    }
  }
}
