import { searchLocationController } from './controller.js'

export const searchLocation = {
  plugin: {
    name: 'find-industrial-sites-by-location',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/find-industrial-sites-by-location',
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
