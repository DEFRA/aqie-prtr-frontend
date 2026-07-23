import { setErrorMessage } from './error-message.js'
import { createLogger } from './logging/logger.js'

const logger = createLogger()
const ERROR_TITLE = 'There is a problem'
const MAX_QUERY_LENGTH = 100
const INVALID_CHARS = /[^a-zA-Z0-9 \-_.',]/
const SESSION_KEY = 'fullSearchQuery'
const CHOOSER_PATH = '/search-facility'

function validationError(value, errors) {
  if (!value || value.length > MAX_QUERY_LENGTH) {
    return errors.emptyQuery
  }
  if (INVALID_CHARS.test(value)) {
    return errors.invalidChars
  }
  return null
}

/**
 * Shared POST handling for a facility-search input page: validate the term,
 * persist it, and redirect to the results list — or back to the page with an
 * error. Each page passes its own searchType, path and error messages.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 * @param {{ searchType: string, path: string, errors: object }} options
 */
export function submitFacilitySearch(request, h, { searchType, path, errors }) {
  const value = (request.payload?.[SESSION_KEY] || '').trim()
  request.yar.set(SESSION_KEY, { value })

  const error = validationError(value, errors)
  if (error) {
    setErrorMessage(request, ERROR_TITLE, error)
    return h.redirect(path).takeover()
  }

  logger.info(`[facility-search] type=${searchType} q="${value}"`)
  const params = new URLSearchParams({ searchType, q: value })
  return h.redirect(`/facilities?${params.toString()}`).takeover()
}

/**
 * Shared GET view-model for a facility-search input page.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {{ content: object, path: string }} options
 * @returns {object}
 */
export function facilitySearchViewModel(request, { content, path }) {
  const errors = request.yar.get('errors') || ''
  const errorMessage = request.yar.get('errorMessage') || ''
  request.yar.clear('errors')
  request.yar.clear('errorMessage')

  return {
    ...content,
    action: path,
    fullSearchQuery: request.yar.get(SESSION_KEY),
    errors,
    errorMessage,
    displayBackLink: true,
    hrefq: CHOOSER_PATH
  }
}
