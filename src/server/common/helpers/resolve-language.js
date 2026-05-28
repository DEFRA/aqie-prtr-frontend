export const DEFAULT_LANG = 'en'
export const SUPPORTED_LANGS = ['en', 'cy']

/**
 * Pick the active language for the request. Reads `?lang=` query param,
 * falls back to DEFAULT_LANG if missing or unsupported.
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {string} An entry from SUPPORTED_LANGS.
 */
export function resolveLang(request) {
  const requested = request.query?.lang
  if (SUPPORTED_LANGS.includes(requested)) {
    return requested
  }
  return DEFAULT_LANG
}
