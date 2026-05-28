import { searchLocations } from '#src/server/common/api/locations.js'
//import { getFacilitiesNearby } from '#src/server/common/api/facilities.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { content } from './content.js'
import { setErrorMessage } from '#src/server/common/helpers/error-message.js'

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

function renderNoLocation(h, query) {
  return h.view('multiplelocations/nolocation', {
    pageTitle: content.noLocation.pageTitle,
    heading: content.noLocation.heading,
    body: content.noLocation.bodyTemplate.replace('{query}', query),
    tryAgainLink: content.noLocation.tryAgainLink,
    displayBacklink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

function renderNoFacility(h, locationName, radiusMiles) {
  return h.view('multiplelocations/nofacility', {
    pageTitle: content.noFacility.pageTitle,
    heading: content.noFacility.headingTemplate
      .replace('{radius}', radiusMiles)
      .replace('{location}', locationName),
    tryAgainLink: content.noFacility.tryAgainLink,
    displayBacklink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

function renderFacilities(h, locationName, radiusMiles, facilitiesResponse) {
  return h.view('facilities/index', {
    pageTitle: 'Facilities',
    searchLocation: locationName,
    radiusMiles,
    facilities: facilitiesResponse.results,
    displayBacklink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

function renderMultiple(h, query, matches, radiusMiles) {
  return h.view('multiplelocations/index', {
    pageTitle: content.pageTitle,
    heading: content.heading,
    helpText: content.helpText.replace('{radius}', radiusMiles),
    searchLocation: query,
    radiusMiles,
    results: matches,
    displayBacklink: true,
    hrefq: TRY_AGAIN_PATH
  })
}

// async function handleSingleMatch(h, match, radiusMiles) {
//   const facilities = await getFacilitiesNearby({
//     lng: match.lng,
//     lat: match.lat,
//     radiusMiles
//   })
//   if (facilities.count === 0) {
//     return renderNoFacility(h, match.name, radiusMiles)
//   }
//   return renderFacilities(h, match.name, radiusMiles, facilities)
// }

/**
 * Orchestrate the search → branch on match count → render the right view.
 *
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 */
async function handleMultipleLocations(request, h) {
  const searchValue = persistAndReadSearchValue(request)
  const radiusMiles = DEFAULT_RADIUS_MILES

  if (!searchValue) {
    return setErrorRedirect(request, h, content.validationErrors.emptyQuery)
  }
  if (SPECIAL_CHAR_REGEX.test(searchValue)) {
    return setErrorRedirect(request, h, content.validationErrors.invalidChars)
  }

  try {
    const locationsResponse = await searchLocations(searchValue)
    request.yar.set('locationsResult', locationsResponse)
    const matches = locationsResponse.results || []

    if (matches.length === 0) {
      logger.info(`[multiplelocations.POST] no matches for q="${searchValue}"`)
      return renderNoLocation(h, searchValue)
    }
    if (matches.length === 1) {
      logger.info(
        `[multiplelocations.POST] single match for q="${searchValue}" → facilities`
      )
      return await handleSingleMatch(h, matches[0], radiusMiles)
    }
    logger.info(
      `[multiplelocations.POST] ${matches.length} matches for q="${searchValue}" → disambiguation`
    )
    return renderMultiple(h, searchValue, matches, radiusMiles)
  } catch (error) {
    logger.error(
      `[multiplelocations.POST] failed for q="${searchValue}": ${error.message}`
    )
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const multipleLocationsController = { handler: handleMultipleLocations }
export { handleMultipleLocations }
