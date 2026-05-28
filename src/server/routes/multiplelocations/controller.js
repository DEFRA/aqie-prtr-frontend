import { searchLocations } from '#src/server/common/api/locations.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { content } from './content.js'
import { setErrorMessage } from '#src/server/common/helpers/error-message.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'

const logger = createLogger()

export const DEFAULT_RADIUS_MILES = 50
const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9 \-_.',]/
const TRY_AGAIN_PATH = '/search-location/searchagain'
const ERROR_SUMMARY_TITLE = 'There is a problem'

function persistAndReadSearchValue(request) {
  const payloadQuery = request.payload?.fullSearchQuery
  if (payloadQuery !== undefined) {
    request.yar.set('fullSearchQuery', { value: payloadQuery })
  }
  return request.yar.get('fullSearchQuery')?.value?.trim()
}

function setErrorRedirect(request, h, message) {
  setErrorMessage(request, ERROR_SUMMARY_TITLE, message)
  return h.redirect('/search-location').takeover()
}

function renderMultiple(h, langContent, query, matches, radiusMiles) {
  return h.view('multiplelocations/index', {
    ...langContent,
    searchLocation: query,
    radiusMiles,
    results: matches,
    displayBackLink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

/**
 * Orchestrate the search → branch on match count → render the right view.
 * For EAFEA-611 (search-location screen only), single-match auto-pick is not
 * wired yet because the facilities endpoint doesn't exist in this branch.
 * One or more matches both fall through to the disambiguation list.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
async function handleMultipleLocations(request, h) {
  const lang = resolveLang(request)
  const langContent = content[lang]
  const searchValue = persistAndReadSearchValue(request)
  const radiusMiles = DEFAULT_RADIUS_MILES

  if (!searchValue) {
    return setErrorRedirect(request, h, langContent.validationErrors.emptyQuery)
  }
  if (SPECIAL_CHAR_REGEX.test(searchValue)) {
    return setErrorRedirect(
      request,
      h,
      langContent.validationErrors.invalidChars
    )
  }

  try {
    const locationsResponse = await searchLocations(searchValue)
    request.yar.set('locationsResult', locationsResponse)
    const matches = locationsResponse.results || []

    if (matches.length === 0) {
      logger.info(`[multiplelocations.POST] no matches for q="${searchValue}"`)
      return h.redirect('/no-location-found').takeover()
    }

    logger.info(
      `[multiplelocations.POST] ${matches.length} matches for q="${searchValue}" → disambiguation`
    )
    return renderMultiple(h, langContent, searchValue, matches, radiusMiles)
  } catch (error) {
    logger.error(
      `[multiplelocations.POST] failed for q="${searchValue}": ${error.message}`
    )
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const multipleLocationsController = { handler: handleMultipleLocations }
export { handleMultipleLocations }
