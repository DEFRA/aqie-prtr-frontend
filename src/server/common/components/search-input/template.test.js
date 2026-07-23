import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nunjucks from 'nunjucks'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const environment = nunjucks.configure(
  ['node_modules/govuk-frontend/dist/', path.resolve(dirname, '..')],
  { autoescape: true, trimBlocks: true, lstripBlocks: true }
)

function render(params) {
  return environment.renderString(
    '{% from "search-input/macro.njk" import appSearchInput %}{{ appSearchInput(params) }}',
    { params }
  )
}

describe('appSearchInput', () => {
  it('renders the heading, text box and button posting to the action', () => {
    const html = render({
      heading: 'Search by name of facility',
      inputLabel: 'Enter a facility name',
      buttonText: 'Continue',
      action: '/search-by-name',
      value: ''
    })
    expect(html).toContain('Search by name of facility')
    expect(html).toContain('name="fullSearchQuery"')
    expect(html).toContain('action="/search-by-name"')
    expect(html).toContain('Continue')
  })

  it('renders the current value back into the input', () => {
    const html = render({
      heading: 'H',
      inputLabel: 'L',
      buttonText: 'C',
      action: '/x',
      value: 'Brunswick'
    })
    expect(html).toContain('value="Brunswick"')
  })

  it('renders the error summary and inline error when errors are present', () => {
    const html = render({
      heading: 'H',
      inputLabel: 'L',
      buttonText: 'C',
      action: '/x',
      value: '',
      errors: { list: { titleText: 'There is a problem' } },
      errorMessage: { message: { text: 'Enter a facility name' } }
    })
    expect(html).toContain('govuk-error-summary')
    expect(html).toContain('There is a problem')
    expect(html).toContain('Enter a facility name')
    expect(html).toContain('govuk-input--error')
  })
})
