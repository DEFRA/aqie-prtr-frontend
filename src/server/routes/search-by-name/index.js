import { searchByNameController } from './controller.js'

export const searchByName = {
  plugin: {
    name: 'search-by-name',
    register(server) {
      server.route([
        { method: 'GET', path: '/search-by-name', ...searchByNameController },
        { method: 'POST', path: '/search-by-name', ...searchByNameController }
      ])
    }
  }
}
