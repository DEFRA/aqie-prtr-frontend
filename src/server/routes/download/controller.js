import { downloadContent } from './content.js'
import { mockData } from './mock-data.js'

export const downloadController = {
  handler(request, h) {
    const { language = 'en' } = request.params // optional language parameter
    const content = downloadContent[language]

    const downloadLinks = [...mockData].reverse().map(item => ({
      text: `${content.downloadPrefix} ${item.year} ${content.dataSuffix}`,
      href: item.fileUrl
    }))

    return h.view('download/index', {
      pageTitle: content.pageTitle,
      description: content.description,
      downloadLinks
    })
  }
}
