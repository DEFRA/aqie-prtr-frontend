import { describe, it, expect } from 'vitest'

import {
  resolveLang,
  DEFAULT_LANG,
  SUPPORTED_LANGS
} from '#src/server/common/helpers/resolve-language.js'

describe('resolveLang', () => {
  it('returns the default language when no query is present', () => {
    expect(resolveLang({ query: {} })).toBe(DEFAULT_LANG)
  })

  it('returns the default language when the request has no query at all', () => {
    expect(resolveLang({})).toBe(DEFAULT_LANG)
  })

  it.each(SUPPORTED_LANGS)('returns "%s" when ?lang=%s is provided', (lang) => {
    expect(resolveLang({ query: { lang } })).toBe(lang)
  })

  it('falls back to default when the requested lang is unsupported', () => {
    expect(resolveLang({ query: { lang: 'fr' } })).toBe(DEFAULT_LANG)
  })

  it('falls back to default when ?lang= is empty string', () => {
    expect(resolveLang({ query: { lang: '' } })).toBe(DEFAULT_LANG)
  })
})

describe('SUPPORTED_LANGS', () => {
  it('includes the DEFAULT_LANG', () => {
    expect(SUPPORTED_LANGS).toContain(DEFAULT_LANG)
  })
})
