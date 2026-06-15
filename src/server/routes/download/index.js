import { downloadController } from './controller.js'
import { downloadFileController } from './download-proxy.js' // TODO: remove when backend sends Content-Disposition: attachment

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
        // TODO: remove this route when backend sends Content-Disposition: attachment
        {
          method: 'GET',
          path: '/download-all-data-for-a-year/file',
          options: {
            validate: {
              query: (query) => {
                if (!query.url || typeof query.url !== 'string') {
                  throw new Error('Missing required query parameter: url')
                }

                if (query.year && !/^\d{4}$/.test(String(query.year))) {
                  throw new Error('Invalid year format')
                }

                return query
              }
            }
          },
          ...downloadFileController
        }
      ])
    }
  }
}
