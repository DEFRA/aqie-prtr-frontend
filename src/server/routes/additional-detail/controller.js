import { getAdditionalDetail } from '#src/server/common/api/additional-detail.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { additionalDetailContent } from './content.js'

const logger = createLogger()

const RELEASE_UNIT = { KGM: 'kg', TNE: 'tonne' }
const WASTE_UNIT = { TNE: 'TONNE', KGM: 'kg' }
const MEDIUM_HEADING_KEY = {
  AIR: 'releaseAir',
  WATER: 'releaseWater',
  LAND: 'releaseSoil'
}
const DISPOSAL = 'Disposal'

function formatQty(quantity, unitMap, { space = false } = {}) {
  if (!quantity || quantity.value == null) {
    return null
  }
  const amount = Number(quantity.value).toLocaleString('en-GB')
  const unit = unitMap[quantity.unit] ?? quantity.unit ?? ''
  return space ? `${amount} ${unit}` : `${amount}${unit}`
}

function addressLines(...parts) {
  return parts.filter(Boolean)
}

/** Release (air/water/soil) and transfer-to-waste-water share one field set. */
function buildPollutantView(detail, content) {
  const isTransfer = detail.kind === 'transfer'
  const heading = isTransfer
    ? content.headings.transfer
    : content.headings[MEDIUM_HEADING_KEY[detail.medium]]
  const pollutantLabel = isTransfer
    ? content.pollutantLabel.transfer
    : content.pollutantLabel[detail.medium]

  return {
    heading,
    rows: [
      { key: pollutantLabel, text: detail.pollutant ?? content.notAvailable },
      {
        key: isTransfer
          ? content.fields.totalTransferred
          : content.fields.totalReleased,
        text: formatQty(detail.total, RELEASE_UNIT) ?? content.notAvailable
      },
      {
        key: content.fields.threshold,
        // Reporting thresholds are not in the Ricardo export yet.
        text:
          detail.threshold == null
            ? content.notAvailable
            : formatQty(
                { value: detail.threshold, unit: detail.total?.unit },
                RELEASE_UNIT
              )
      },
      { key: content.fields.accidental, text: String(detail.accidental ?? 0) },
      {
        key: content.fields.percentAccidental,
        text: `${detail.percentAccidental ?? 0}%`
      },
      {
        key: content.fields.method,
        text: detail.methodBasis ?? content.notAvailable
      },
      {
        key: content.fields.methodDescription,
        text: detail.methodDescription ?? content.notAvailable
      },
      {
        key: content.fields.confidentiality,
        text: detail.confidentiality?.name ?? content.none
      }
    ],
    explainers: []
  }
}

function wasteExplainers(detail, content) {
  const treatment =
    detail.treatment === DISPOSAL
      ? content.explainers.disposal
      : content.explainers.recovery

  const byWasteType = {
    NONHW: [content.explainers.nonHazardous, treatment],
    HWIC: [
      content.explainers.domesticTransfer,
      content.explainers.hazardousWaste,
      treatment
    ],
    HWOC: [
      content.explainers.transboundaryTransfer,
      content.explainers.hazardousWaste,
      treatment
    ]
  }

  return byWasteType[detail.wasteTypeCode] ?? []
}

function buildWasteView(detail, content) {
  const heading = content.headings[`waste${detail.wasteTypeCode}`]

  const rows = [
    {
      key: content.fields.quantity,
      text:
        formatQty(detail.quantity, WASTE_UNIT, { space: true }) ??
        content.notAvailable
    },
    {
      key: content.fields.treatment,
      text: detail.treatment ?? content.notAvailable
    },
    {
      key: content.fields.method,
      text: detail.methodBasis ?? content.notAvailable
    },
    {
      key: content.fields.methodDescription,
      text: detail.methodDescription ?? content.notAvailable
    }
  ]

  // Only transboundary transfers normally carry a waste handler.
  if (detail.receiverCompany) {
    const { name, address } = detail.receiverCompany
    rows.push({
      key: content.fields.receiverCompany,
      lines: addressLines(
        name,
        address?.streetName,
        address?.cityName,
        address?.postcodeCode,
        address?.countryName
      )
    })
  }

  if (detail.site) {
    rows.push({
      key: content.fields.site,
      lines: addressLines(
        detail.site.streetName,
        detail.site.cityName,
        detail.site.postcodeCode
      )
    })
  }

  rows.push({
    key: content.fields.confidentiality,
    text: detail.confidentiality?.name ?? content.none
  })

  return { heading, rows, explainers: wasteExplainers(detail, content) }
}

async function handleAdditionalDetail(request, h) {
  const lang = resolveLang(request)
  const content = additionalDetailContent[lang]
  const { id, year, lineId } = request.params

  try {
    const detail = await getAdditionalDetail(id, year, lineId)

    const view =
      detail.kind === 'waste'
        ? buildWasteView(detail, content)
        : buildPollutantView(detail, content)

    return h.view('additional-detail/index', {
      pageTitle: view.heading,
      view,
      displayBackLink: true,
      hrefq: `/facility/${id}/${year}` // back to the record page for that year
    })
  } catch (error) {
    logger.error(
      `[additional-detail] failed id=${id} year=${year} line=${lineId}: ${error.message}`
    )
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const additionalDetailController = { handler: handleAdditionalDetail }
export { handleAdditionalDetail }
