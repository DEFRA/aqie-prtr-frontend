import { facilityRecordController } from './controller.js'

/**
 * Sets up the routes for the facility record (releases & transfers) page.
 * Registered in src/server/plugins/router.js.
 */
export const facilityRecord = {
  plugin: {
    name: 'facility-record',
    register(server) {
      server.route([
        { method: 'GET', path: '/facility/{id}', ...facilityRecordController },
        {
          method: 'GET',
          path: '/facility/{id}/{year}',
          ...facilityRecordController
        }
      ])
    }
  }
}
