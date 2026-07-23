import { searchFacilityController } from './controller.js'

export const searchFacility = {
  plugin: {
    name: 'search-facility',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/search-facility',
          ...searchFacilityController
        },
        {
          method: 'POST',
          path: '/search-facility',
          ...searchFacilityController
        }
      ])
    }
  }
}
