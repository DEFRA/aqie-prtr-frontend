import { competentAuthorityController } from './controller.js'

/**
 * Sets up the route for the competent authority details page.
 * Registered in src/server/plugins/router.js.
 */
export const competentAuthority = {
  plugin: {
    name: 'competent-authority',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/facility/{id}/competent-authority',
          ...competentAuthorityController
        }
      ])
    }
  }
}
