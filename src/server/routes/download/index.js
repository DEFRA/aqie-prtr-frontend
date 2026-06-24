import { downloadController } from './controller.js'
import { downloadController as downloadGetController } from './download-proxy.js'

const supportedLanguages = new Set(['en', 'cy'])

/**
 * Sets up the routes used in the download page.
 * These routes are registered in src/server/router.js.
 */
export const download = {
  plugin: {
    name: 'download',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/download-all-data-for-a-year/{language?}',
          options: {
            validate: {
              params: (params) => {
                if (
                  params.language &&
                  !supportedLanguages.has(params.language)
                ) {
                  throw new Error(
                    'Invalid language. Supported languages are en and cy'
                  )
                }
                return params
              }
            }
          },
          ...downloadController
        },
        // TEMPORARY: Route to fetch presigned URL and stream file with proper headers
        // TODO: Once backend sends Content-Disposition: attachment headers,
        // the frontend can redirect directly to the presigned URL without this route.
        // This handler can be removed and controller links can point to backend directly
        {
          method: 'GET',
          path: '/download-all-data-for-a-year/file/{year}',
          options: {
            validate: {
              params: (params) => {
                if (!/^\d{4}$/.test(String(params.year))) {
                  throw new Error('Invalid year format')
                }
                return params
              }
            }
          },
          ...downloadGetController
        }
      ])
    }
  }
}
