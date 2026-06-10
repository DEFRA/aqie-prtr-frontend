/**
 * Set Hapi yar session keys used by the search-location form templates to
 * display an error summary + inline error message.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {string} titleText - Summary heading, e.g. "There is a problem".
 * @param {string} errorListText - User-facing error text.
 * @returns {true}
 */
export function setErrorMessage(request, titleText, errorListText) {
  request.yar.set('errors', {
    list: {
      titleText,
      errorList: [
        {
          text: errorListText,
          href: '#search-input'
        }
      ]
    }
  })
  request.yar.set('errorMessage', {
    message: { text: errorListText }
  })

  return true
}
