import { additionalDetailController } from './controller.js'

/**
 * Sets up the route for the additional-detail page. One route serves all five
 * variants (release to air/water/soil, transfer to waste water, waste transfer).
 * Registered in src/server/plugins/router.js.
 */
export const additionalDetail = {
  plugin: {
    name: 'additional-detail',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/facility/{id}/{year}/lines/{lineId}',
          ...additionalDetailController
        }
      ])
    }
  }
}
