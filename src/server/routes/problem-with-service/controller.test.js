import { describe, it, expect, vi, beforeEach } from 'vitest'
import { problemWithServiceController } from '#src/server/routes/problem-with-service/controller.js'
import { statusCodes } from '#src/server/common/constants/status-codes.js'

function buildH() {
  const code = vi.fn((c) => ({ statusCode: c }))
  const view = vi.fn(() => ({ code }))
  return { h: { view }, view, code }
}

describe('problemWithServiceController', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the problem page and responds with the given status code', () => {
    const { h, view, code } = buildH()

    problemWithServiceController.handler({ query: { statusCode: String(statusCodes.badGateway) } }, h)

    expect(view.mock.calls[0][0]).toBe('problem-with-service/index')
    expect(view.mock.calls[0][1]).toMatchObject({
      pageTitle: 'Sorry, there is a problem with the service',
      heading: 'Sorry, there is a problem with the service',
      tryAgain: 'Try again later.'
    })
    expect(code).toHaveBeenCalledWith(statusCodes.badGateway)
  })

  it('defaults to 500 when no status code is supplied', () => {
    const { h, code } = buildH()
    problemWithServiceController.handler({ query: {} }, h)
    expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
  })

  it.each([String(statusCodes.notFound), String(statusCodes.ok), 'abc', '<script>', '999'])(
    'falls back to internal server error for a disallowed statusCode (%s)',
    (value) => {
      const { h, code } = buildH()
      problemWithServiceController.handler({ query: { statusCode: value } }, h)
      expect(code).toHaveBeenCalledWith(statusCodes.internalServerError)
    }
  )

  it('renders Welsh content when lang=cy', () => {
    const { h, view } = buildH()
    problemWithServiceController.handler({ query: { lang: 'cy' } }, h)
    expect(view.mock.calls[0][1].heading).toContain('--CY')
  })
})
