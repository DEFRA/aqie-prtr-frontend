import { searchByYearController } from './controller.js'

export const searchByYear = {
  plugin: {
    name: 'search-by-year',
    register(server) {
      server.route([
        { method: 'GET', path: '/search-by-year', ...searchByYearController },
        { method: 'POST', path: '/search-by-year', ...searchByYearController }
      ])
    }
  }
}
