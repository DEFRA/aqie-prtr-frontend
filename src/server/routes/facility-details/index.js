import { facilityDetailsController } from './controller.js'

/**
 * Sets up the route for the facility details page.
 * Registered in src/server/plugins/router.js.
 */
export const facilityDetails = {
  plugin: {
    name: 'facility-details',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/facility/{id}/details',
          ...facilityDetailsController
        }
      ])
    }
  }
}
