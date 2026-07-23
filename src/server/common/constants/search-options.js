export const SEARCH_OPTIONS = [
  { value: 'location', path: '/find-industrial-sites-by-location' },
  { value: 'name', path: '/search-by-name' },
  { value: 'region', path: '/search-by-region' },
  { value: 'river-basin', path: '/search-by-river-basin' },
  { value: 'year', path: '/search-by-year' } // additional option — may be removed later
]

export const OPTION_PATHS = Object.fromEntries(
  SEARCH_OPTIONS.map((option) => [option.value, option.path])
)
