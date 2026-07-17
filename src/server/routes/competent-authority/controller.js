import { getCompetentAuthority } from '#src/server/common/api/competent-authority.js'
import { createLogger } from '#src/server/common/helpers/logging/logger.js'
import { resolveLang } from '#src/server/common/helpers/resolve-language.js'
import { competentAuthorityContent } from './content.js'

const logger = createLogger()

/** Turn the API DTO into ready-to-render display values. */
function buildViewModel(authority, content) {
  const none = content.notProvided
  const address = authority.address ?? {}

  return {
    name: authority.name || none,
    contactPersonName: authority.contactPersonName || none,
    addressLines: [
      address.street,
      address.building,
      address.city,
      address.postcode
    ].filter(Boolean),
    telephone: authority.telephone || none,
    fax: authority.fax || none,
    // Kept as null when absent so the view can decide between a mailto link
    // and the "Not provided" text.
    email: authority.email || null
  }
}

async function handleCompetentAuthority(request, h) {
  const lang = resolveLang(request)
  const content = competentAuthorityContent[lang]
  const { id } = request.params

  try {
    const authority = await getCompetentAuthority(id)

    return h.view('competent-authority/index', {
      pageTitle: content.pageTitle,
      heading: content.heading,
      fields: content.fields,
      notProvided: content.notProvided,
      view: buildViewModel(authority, content),
      displayBackLink: true,
      hrefq: `/facility/${id}` // back to the facility record page
    })
  } catch (error) {
    logger.error(`[competent-authority] failed id=${id}: ${error.message}`)
    return h.redirect('/problem-with-service?statusCode=500')
  }
}

export const competentAuthorityController = {
  handler: handleCompetentAuthority
}
export { handleCompetentAuthority }
