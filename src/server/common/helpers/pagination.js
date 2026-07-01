const ELLIPSIS = { ellipsis: true }

function hrefFor(baseQuery, page) {
  return baseQuery ? `?${baseQuery}&page=${page}` : `?page=${page}`
}

// First, last, current and its neighbours — gaps become ellipses.
function visiblePageNumbers(current, totalPages) {
  const pages = new Set([1, totalPages, current, current - 1, current + 1])
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
}

/**
 * Build the view-model for govukPagination plus the results summary line.
 *
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.perPage
 * @param {number} params.total
 * @param {number} params.totalPages
 * @param {string} params.baseQuery - query string WITHOUT `page` (e.g. "lng=..&lat=..")
 * @returns {{ pagination: object|null, summary: { from, to, total } }}
 */
export function buildPagination({ page, perPage, total, totalPages, baseQuery }) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const summary = { from, to, total }

  if (totalPages <= 1) {
    return { pagination: null, summary }
  }

  const items = []
  let prev = null
  for (const n of visiblePageNumbers(page, totalPages)) {
    if (prev !== null && n - prev > 1) items.push(ELLIPSIS)
    items.push({ number: n, href: hrefFor(baseQuery, n), current: n === page })
    prev = n
  }

  const pagination = { items }
  if (page > 1) pagination.previous = { href: hrefFor(baseQuery, page - 1) }
  if (page < totalPages) pagination.next = { href: hrefFor(baseQuery, page + 1) }
  return { pagination, summary }
}
