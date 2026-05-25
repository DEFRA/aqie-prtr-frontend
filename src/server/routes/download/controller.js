import { downloadPageContent } from './content.js'

export const downloadController = {
  handler(request, h) {
    const { language = 'en' } = request.params // optional language parameter
    const content = downloadPageContent[language]

    return h.view('download/index', {
    })
  }
}
