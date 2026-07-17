import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('#src/config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'backend.url') {
        return 'http://localhost:3001/'
      }
      return undefined
    })
  }
}))

vi.mock('#src/server/common/helpers/fetch-with-retry.js', () => ({
  fetchWithRetry: vi.fn()
}))

vi.mock('#src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

import {
  baseUrl,
  defaultHeaders,
  buildUrl,
  fetchJson
} from '#src/server/common/api/api-common.js'
import { fetchWithRetry } from '#src/server/common/helpers/fetch-with-retry.js'

describe('api-common', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('baseUrl', () => {
    it('returns the backend URL with trailing slash stripped', () => {
      expect(baseUrl()).toBe('http://localhost:3001')
    })
  })

  describe('defaultHeaders', () => {
    it('returns Accept: application/json', () => {
      expect(defaultHeaders()).toEqual({ Accept: 'application/json' })
    })
  })

  describe('buildUrl', () => {
    it('prepends the base URL to a path with a leading slash', () => {
      expect(buildUrl('/years')).toBe('http://localhost:3001/years')
    })

    it('adds a leading slash if the path is missing one', () => {
      expect(buildUrl('years')).toBe('http://localhost:3001/years')
    })
  })

  describe('fetchJson', () => {
    it('calls fetchWithRetry and returns parsed JSON on success', async () => {
      const payload = { results: [2024, 2025] }
      fetchWithRetry.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(payload)
      })

      const result = await fetchJson('/reports', 'getReports')

      expect(fetchWithRetry).toHaveBeenCalledWith(expect.any(Function), {
        operationName: 'getReports'
      })
      expect(result).toEqual(payload)
    })

    it('returns null for a 204 response', async () => {
      fetchWithRetry.mockResolvedValue({
        ok: true,
        status: 204
      })

      const result = await fetchJson('/empty', 'emptyOp')

      expect(result).toBeNull()
    })

    it('throws on a non-ok response', async () => {
      fetchWithRetry.mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve('Bad Gateway')
      })

      await expect(fetchJson('/fail', 'failOp')).rejects.toThrow(
        'failOp failed: 502'
      )
    })
  })
})
