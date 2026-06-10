import { homeContent } from './content.js'

export const homeController = {
  handler(request, h) {
    const { language = 'en' } = request.params // optional language parameter
    const content = homeContent[language]

    return h.view('home/index', {
      pageTitle: content.pageTitle,
      searchByLocation: content.searchByLocation,
      searchByLocationDescription: content.searchByLocationDescription,
      downloadData: content.downloadData,
      downloadDataDescription: content.downloadDataDescription,
      language
    })
  }
}
