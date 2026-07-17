import { facilitiesController } from './controller.js'

/**
 * Sets up the route for the facilities list page.
 * Registered in src/server/plugins/router.js.
 */
export const facilities = {
  plugin: {
    name: 'facilities',
    register(server) {
      server.route([
        { method: 'GET', path: '/facilities', ...facilitiesController }
      ])
    }
  }
}
