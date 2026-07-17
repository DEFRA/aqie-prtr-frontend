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

/** Display value, or the given fallback text when it's null/undefined. */
const displayText = (value, fallback) => value ?? fallback

function resolveHeading(detail, content) {
  if (detail.kind === 'transfer') {
    return content.headings.transfer
  }
  return content.headings[MEDIUM_HEADING_KEY[detail.medium]]
}

function resolvePollutantLabel(detail, content) {
  if (detail.kind === 'transfer') {
    return content.pollutantLabel.transfer
  }
  return content.pollutantLabel[detail.medium]
}

function formatThreshold(detail, content) {
  if (detail.threshold == null) {
    return content.notAvailable
  }
  return formatQty(
    { value: detail.threshold, unit: detail.total?.unit },
    RELEASE_UNIT
  )
}

function confidentialityText(detail, content) {
  return detail.confidentiality?.name ?? content.none
}

/** Release (air/water/soil) and transfer-to-waste-water share one field set. */
function buildPollutantView(detail, content) {
  const none = content.notAvailable
  const totalKey =
    detail.kind === 'transfer'
      ? content.fields.totalTransferred
      : content.fields.totalReleased

  return {
    heading: resolveHeading(detail, content),
    rows: [
      {
        key: resolvePollutantLabel(detail, content),
        text: displayText(detail.pollutant, none)
      },
      {
        key: totalKey,
        text: displayText(formatQty(detail.total, RELEASE_UNIT), none)
      },
      { key: content.fields.threshold, text: formatThreshold(detail, content) },
      { key: content.fields.accidental, text: String(detail.accidental ?? 0) },
      {
        key: content.fields.percentAccidental,
        text: `${detail.percentAccidental ?? 0}%`
      },
      {
        key: content.fields.method,
        text: displayText(detail.methodBasis, none)
      },
      {
        key: content.fields.methodDescription,
        text: displayText(detail.methodDescription, none)
      },
      {
        key: content.fields.confidentiality,
        text: confidentialityText(detail, content)
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

/** The receiver-company and site rows — only present on transboundary transfers. */
function wasteHandlerRows(detail, content) {
  const rows = []

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

  return rows
}

function buildWasteView(detail, content) {
  const none = content.notAvailable

  const rows = [
    {
      key: content.fields.quantity,
      text: displayText(
        formatQty(detail.quantity, WASTE_UNIT, { space: true }),
        none
      )
    },
    {
      key: content.fields.treatment,
      text: displayText(detail.treatment, none)
    },
    { key: content.fields.method, text: displayText(detail.methodBasis, none) },
    {
      key: content.fields.methodDescription,
      text: displayText(detail.methodDescription, none)
    },
    ...wasteHandlerRows(detail, content),
    {
      key: content.fields.confidentiality,
      text: confidentialityText(detail, content)
    }
  ]

  return {
    heading: content.headings[`waste${detail.wasteTypeCode}`],
    rows,
    explainers: wasteExplainers(detail, content)
  }
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
