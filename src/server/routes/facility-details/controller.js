import { getFacilityDetails } from '#src/server/common/api/facility-details.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { facilityDetailsContent } from './content.js'

const logger = createLogger()

/** Turn the API DTO into ready-to-render display strings. */
function buildViewModel(facility, content) {
  const none = content.notAvailable
  const address = facility.address ?? {}

  return {
    name: facility.name || none,
    activity: facility.activity || none,
    ippcCode: facility.ippcCode || none,
    addressLines: [address.street, address.city, address.postcode].filter(
      Boolean
    ),
    coordinates: facility.coordinates
      ? `${facility.coordinates.lat}, ${facility.coordinates.lng}`
      : none,
    nutsRegion: facility.nutsRegion
      ? `${facility.nutsRegion.name} (${facility.nutsRegion.code})`
      : none,
    nace:
      facility.naceCode && facility.naceName
        ? `${facility.naceCode} - ${facility.naceName}`
        : facility.naceCode || none,
    riverBasin: facility.riverBasin || none,
    nationalId: facility.nationalId || none
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
