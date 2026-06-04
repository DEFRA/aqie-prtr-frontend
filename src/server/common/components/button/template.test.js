import { renderComponent } from '../../../../../test-helpers/component-helpers.js'

describe('Button component', () => {
  let $button

  describe('secondary button', () => {
    beforeEach(() => {
      $button = renderComponent('button', {
        href: '/download',
        text: 'Download'
      })
    })

    test('Should render secondary button link', () => {
      expect($button('[data-testid="aq-button-secondary"]')).toHaveLength(1)
      expect($button('[data-testid="aq-button-secondary"]').attr('href')).toBe(
        '/download'
      )
    })

    test('Should contain expected button text', () => {
      expect($button('.aq-button-secondary__text').text().trim()).toBe('Download')
    })

    test('Should add icon class and render icon markup when provided', () => {
      const $buttonWithIcon = renderComponent('button', {
        href: '/download',
        text: 'Download',
        icon: '<svg data-testid="download-icon"></svg>'
      })

      expect(
        $buttonWithIcon('[data-testid="aq-button-secondary"]').hasClass(
          'aq-button-secondary--icon'
        )
      ).toBe(true)
      expect($buttonWithIcon('[data-testid="download-icon"]')).toHaveLength(1)
    })
  })
})
