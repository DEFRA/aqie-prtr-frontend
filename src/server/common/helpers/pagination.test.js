import { describe, it, expect } from 'vitest'
import { buildPagination } from '#src/server/common/helpers/pagination.js'

describe('buildPagination', () => {
  it('returns no pagination but a summary for a single page', () => {
    const { pagination, summary } = buildPagination({
      page: 1,
      perPage: 10,
      total: 7,
      totalPages: 1,
      baseQuery: 'lng=-1.6&lat=55'
    })
    expect(pagination).toBeNull()
    expect(summary).toEqual({ from: 1, to: 7, total: 7 })
  })

  it('builds items, a next link and a "Showing 1 to 10" summary on page 1', () => {
    const { pagination, summary } = buildPagination({
      page: 1,
      perPage: 10,
      total: 657,
      totalPages: 66,
      baseQuery: 'lng=-1.6&lat=55'
    })
    expect(summary).toEqual({ from: 1, to: 10, total: 657 })
    expect(pagination.previous).toBeUndefined()
    expect(pagination.next.href).toBe('?lng=-1.6&lat=55&page=2')
    expect(pagination.items[0]).toEqual({
      number: 1,
      href: '?lng=-1.6&lat=55&page=1',
      current: true
    })
  })

  it('inserts ellipses for large gaps', () => {
    const { pagination } = buildPagination({
      page: 5,
      perPage: 10,
      total: 100,
      totalPages: 10,
      baseQuery: 'lng=1&lat=2'
    })
    const shape = pagination.items.map((i) => (i.ellipsis ? '…' : i.number))
    expect(shape).toEqual([1, '…', 4, 5, 6, '…', 10])
  })

  it('computes the summary for the last partial page', () => {
    const { summary } = buildPagination({
      page: 66,
      perPage: 10,
      total: 657,
      totalPages: 66,
      baseQuery: 'lng=1&lat=2'
    })
    expect(summary).toEqual({ from: 651, to: 657, total: 657 })
  })
})
