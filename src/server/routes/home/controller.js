import { homeContent } from './content.js'

export const homeController = {
  handler(request, h) {
    const { language = 'en' } = request.params // optional language parameter
    const content = homeContent[language]

    return h.view('home/index', {
      pageTitle: content.pageTitle,
      searchForFacility: content.searchForFacility,
      searchForFacilityDescription: content.searchForFacilityDescription,
      downloadData: content.downloadData,
      downloadDataLinkText: content.downloadDataLinkText,
      downloadDataDescription: content.downloadDataDescription,
      language
    })
  }
}
