import { getFacilityDetails } from '#src/server/common/api/facility-details.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { facilityDetailsContent } from './content.js'

const logger = createLogger()

/** Fallback to the "not available" text when a value is empty. */
const withFallback = (value, fallback) => value || fallback

function formatCoordinates(coordinates, none) {
  if (!coordinates) {
    return none
  }
  return `${coordinates.lat}, ${coordinates.lng}`
}

function formatNutsRegion(nutsRegion, none) {
  if (!nutsRegion) {
    return none
  }
  return `${nutsRegion.name} (${nutsRegion.code})`
}

function formatNace(facility, none) {
  if (facility.naceCode && facility.naceName) {
    return `${facility.naceCode} - ${facility.naceName}`
  }
  return facility.naceCode || none
}

/** Turn the API DTO into ready-to-render display strings. */
function buildViewModel(facility, content) {
  const none = content.notAvailable
  const address = facility.address ?? {}

  return {
    name: withFallback(facility.name, none),
    activity: withFallback(facility.activity, none),
    ippcCode: withFallback(facility.ippcCode, none),
    addressLines: [address.street, address.city, address.postcode].filter(
      Boolean
    ),
    coordinates: formatCoordinates(facility.coordinates, none),
    nutsRegion: formatNutsRegion(facility.nutsRegion, none),
    nace: formatNace(facility, none),
    riverBasin: withFallback(facility.riverBasin, none),
    nationalId: withFallback(facility.nationalId, none)
  }
}

async function handleFacilityDetails(request, h) {
  const lang = resolveLang(request)
  const content = facilityDetailsContent[lang]
  const { id } = request.params

  try {
    const facility = await getFacilityDetails(id)

    return h.view('facility-details/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      fields: content.fields,
      notAvailable: content.notAvailable,
      explainers: content.explainers,
      view: buildViewModel(facility, content),
      displayBackLink: true,
      hrefq: `/facility/${id}` // back to the facility record page
    })
  } catch (error) {
    logger.error(`[facility-details] failed id=${id}: ${error.message}`)
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const facilityDetailsController = { handler: handleFacilityDetails }
export { handleFacilityDetails }
