import { describe, it, expect, vi } from 'vitest'

import { setErrorMessage } from '#src/server/common/helpers/error-message.js'

function buildRequest() {
  const store = {}
  return {
    yar: {
      set: vi.fn((key, value) => {
        store[key] = value
      }),
      get: (key) => store[key],
      _store: store
    }
  }
}

describe('setErrorMessage', () => {
  it('sets errors.list with title and a single-entry errorList', () => {
    const request = buildRequest()

    setErrorMessage(request, 'There is a problem', 'Enter a town or postcode')

    expect(request.yar._store.errors.list.titleText).toBe('There is a problem')
    expect(request.yar._store.errors.list.errorList).toEqual([
      { text: 'Enter a town or postcode', href: '#search-input' }
    ])
  })

  it('sets errorMessage.message.text to the error text', () => {
    const request = buildRequest()

    setErrorMessage(request, 'There is a problem', 'Invalid input')

    expect(request.yar._store.errorMessage.message.text).toBe('Invalid input')
  })

  it('returns true', () => {
    const request = buildRequest()
    expect(setErrorMessage(request, 'x', 'y')).toBe(true)
  })
})
