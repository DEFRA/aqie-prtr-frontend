import inert from '@hapi/inert'

import { home } from '../routes/home/index.js'
import { about } from '../routes/about/index.js'
import { download } from '../routes/download/index.js'
import { health } from '../routes/health/index.js'
import { serveStaticFiles } from './serve-static-files.js'
import { config } from '#src/config/config.js'
import { searchLocation } from '../routes/find-industrial-sites-by-location/index.js'
import { multiplelocations } from '../routes/multiplelocations/index.js'
import { noLocationFound } from '../routes/no-location-found/index.js'
import { facilities } from '../routes/facilities/index.js'
import { facilityRecord } from '../routes/facility-record/index.js'
import { facilityDetails } from '../routes/facility-details/index.js'
import { competentAuthority } from '../routes/competent-authority/index.js'
import { additionalDetail } from '../routes/additional-detail/index.js'
import { problemWithService } from '../routes/problem-with-service/index.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([
        home,
        about,
        searchLocation,
        multiplelocations,
        noLocationFound,
        download,
        facilities,
        facilityRecord,
        facilityDetails,
        competentAuthority,
        additionalDetail,
        problemWithService
      ])

      // Static assets
      if (!config.get('isProduction') && !config.get('isTest')) {
        await (async () => {
          const createViteServer = (await import('vite')).createServer
          const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom'
          })

          await server.register({
            plugin: (await import('@defra/hapi-connect')).default,
            options: {
              path: '/public',
              middleware: [vite.middlewares]
            }
          })
        })()
      } else {
        server.register(serveStaticFiles)
      }
    }
  }
}
