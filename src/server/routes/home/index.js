import { homeController } from './controller.js'

const supportedLanguages = new Set(['en', 'cy'])

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/uk-pollutant-release-and-transfer-register/{language?}',
          options: {
            validate: {
              params: (params) => {
                if (params.language && !supportedLanguages.has(params.language)) {
                  throw new Error('Invalid language. Supported languages are en and cy')
                }
                return params
              }
            }
          },
          ...homeController
        }
      ])
    }
  }
}
