import { searchByRiverBasinController } from './controller.js'

export const searchByRiverBasin = {
  plugin: {
    name: 'search-by-river-basin',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/search-by-river-basin',
          ...searchByRiverBasinController
        },
        {
          method: 'POST',
          path: '/search-by-river-basin',
          ...searchByRiverBasinController
        }
      ])
    }
  }
}
