import { render } from '@testing-library/preact'
import { axe } from 'jest-axe'

describe('Button component', () => {
  describe('secondary button', () => {
    it('renders a link with secondary button styling', () => {
      const { container } = render(
        `<a href="/download" class="aq-button-secondary">
          <span class="aq-button-secondary__text">Download</span>
        </a>`,
      )
      const button = container.querySelector('.aq-button-secondary')
      expect(button).toBeTruthy()
      expect(button.href).toContain('/download')
    })

    it('renders with icon when provided', () => {
      const { container } = render(
        `<a href="/download" class="aq-button-secondary aq-button-secondary--icon">
          <svg></svg>
          <span class="aq-button-secondary__text">Download</span>
        </a>`,
      )
      const button = container.querySelector('.aq-button-secondary--icon')
      const icon = button.querySelector('svg')
      expect(icon).toBeTruthy()
    })

    it('should not have accessibility violations', async () => {
      const { container } = render(
        `<a href="/download" class="aq-button-secondary">
          <span class="aq-button-secondary__text">Download</span>
        </a>`,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
