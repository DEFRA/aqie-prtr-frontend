import { getFacilitiesNearby } from '#src/server/common/api/facilities.js'
import { buildPagination } from '#src/server/common/helpers/pagination.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { facilitiesContent } from './content.js'

const logger = createLogger()
const DEFAULT_PER_PAGE = 10
const DEFAULT_RADIUS_MILES = 50

function parsePage(value) {
  const page = Number.parseInt(value, 10)
  return Number.isInteger(page) && page > 0 ? page : 1
}

// Query string reused by every pagination link (everything except `page`).
function baseQueryFor({ lat, lng, name, radius }) {
  const params = new URLSearchParams({ lng, lat, radius: String(radius) })
  if (name) {
    params.set('name', name)
  }
  return params.toString()
}

// "pollutantReleases" + 2024 -> "Pollutant releases (2024)"
function reportingLabels(facility, content) {
  const labels = content.reportingTypes
  return (facility.latestReportingTypes || []).map(
    (type) => `${labels[type] ?? type} (${facility.latestReportingYear})`
  )
}

async function handleFacilities(request, h) {
  const lang = resolveLang(request)
  const content = facilitiesContent[lang]
  const { lat, lng, name } = request.query
  const radius = DEFAULT_RADIUS_MILES
  const page = parsePage(request.query.page)

  if (!lat || !lng) {
    return h.redirect('/find-industrial-sites-by-location').takeover()
  }

  try {
    const data = await getFacilitiesNearby({
      lat,
      lng,
      page,
      perPage: DEFAULT_PER_PAGE,
      radius
    })

    const { pagination, summary } = buildPagination({
      page: data.page,
      perPage: data.perPage,
      total: data.total,
      totalPages: data.totalPages,
      baseQuery: baseQueryFor({ lat, lng, name, radius })
    })

    const facilities = (data.results || []).map((facility) => ({
      ...facility,
      reporting: reportingLabels(facility, content)
    }))

    return h.view('facilities/index', {
      pageTitle: content.pageTitle,
      heading: content.headingTemplate.replace('{location}', name || ''),
      summaryTemplate: content.summaryTemplate,
      table: content.table,
      summary,
      facilities,
      pagination,
      displayBackLink: true,
      hrefq: '/multiplelocations'
    })
  } catch (error) {
    logger.error(`[facilities] failed lat=${lat} lng=${lng}: ${error.message}`)
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const facilitiesController = { handler: handleFacilities }
export { handleFacilities }
