import { searchByRegionController } from './controller.js'

export const searchByRegion = {
  plugin: {
    name: 'search-by-region',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/search-by-region',
          ...searchByRegionController
        },
        {
          method: 'POST',
          path: '/search-by-region',
          ...searchByRegionController
        }
      ])
    }
  }
}
