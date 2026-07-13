import { problemWithServiceController } from './controller.js'

export const problemWithService = {
  plugin: {
    name: 'problem-with-service',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/problem-with-service',
          ...problemWithServiceController
        }
      ])
    }
  }
}
