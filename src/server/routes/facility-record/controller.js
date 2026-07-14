import { getFacilityRecord } from '#src/server/common/api/facility-record.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { facilityRecordContent } from './content.js'

const logger = createLogger()

const RELEASE_UNIT = { KGM: 'kg', TNE: 'tonne' }
const WASTE_UNIT = { TNE: 'TONNE', KGM: 'kg' }

function formatQty(value, unit, unitMap, { space = false } = {}) {
  if (value == null) return '—'
  const amount = Number(value).toLocaleString('en-GB')
  const label = unitMap[unit] ?? unit ?? ''
  return space ? `${amount} ${label}` : `${amount}${label}`
}

function toPollutantRow(row, content, base) {
  return {
    pollutant: row.pollutant,
    total: formatQty(row.value, row.unit, RELEASE_UNIT),
    threshold:
      row.threshold == null
        ? content.notAvailable
        : formatQty(row.threshold, row.unit, RELEASE_UNIT),
    detailHref: `${base}/lines/${row.lineId}`
  }
}

async function handleFacilityRecord(request, h) {
  const lang = resolveLang(request)
  const content = facilityRecordContent[lang]
  const { id, year } = request.params

  try {
    const data = await getFacilityRecord(id, year)
    const selectedYear = data.year
    const base = `/facility/${id}/${selectedYear}`

    const toRows = (rows) =>
      rows.map((row) => toPollutantRow(row, content, base))
    const releasesToAir = toRows(data.releasesToAir)
    const releasesToWater = toRows(data.releasesToWater)
    const releasesToSoil = toRows(data.releasesToSoil)
    const transfersToWasteWater = toRows(data.transfersToWasteWater)

    const wasteTransfers = data.wasteTransfers.map((waste) => ({
      quantity: formatQty(waste.value, waste.unit, WASTE_UNIT, { space: true }),
      wasteType:
        content.wasteTypes[waste.wasteTypeCode] ??
        waste.wasteTypeCode ??
        content.notAvailable,
      treatment: waste.treatment ?? content.notAvailable,
      detailHref: `${base}/lines/${waste.lineId}`
    }))

    const hasAnyData = Boolean(
      releasesToAir.length ||
      releasesToWater.length ||
      releasesToSoil.length ||
      transfersToWasteWater.length ||
      wasteTransfers.length
    )

    const yearTabs = data.facility.reportingYears.map((tabYear) => ({
      year: tabYear,
      current: tabYear === selectedYear,
      href: `/facility/${id}/${tabYear}`
    }))

    return h.view('facility-record/index', {
      pageTitle: `${data.facility.name} - ${content.pageTitleSuffix}`,
      links: content.links,
      releasesHeading: content.releasesHeading,
      sections: content.sections,
      table: content.table,
      noData: content.noData,
      download: content.download,
      facility: data.facility,
      year: selectedYear,
      yearTabs,
      releasesToAir,
      releasesToWater,
      releasesToSoil,
      transfersToWasteWater,
      wasteTransfers,
      hasAnyData,
      detailsHref: `/facility/${id}/details`,
      competentAuthorityHref: `/facility/${id}/competent-authority`,
      downloadHref: `/facility/${id}/${selectedYear}/download`,
      displayBackLink: true,
      hrefq: '/facilities'
    })
  } catch (error) {
    logger.error(`[facility-record] failed id=${id}: ${error.message}`)
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const facilityRecordController = { handler: handleFacilityRecord }
export { handleFacilityRecord }
