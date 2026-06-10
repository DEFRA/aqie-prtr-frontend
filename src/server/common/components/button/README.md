# Button Component

Secondary button styling for download links and secondary actions.

## Usage

Import and use the `appButtonSecondary` macro in your Nunjucks template:

```njk
{% from "common/components/button/macro.njk" import appButtonSecondary %}

{{ appButtonSecondary({
  href: "/download",
  text: "Download file",
  icon: iconSvg
}) }}
```

## Parameters

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| `href`    | string | Yes      | Link URL                                         |
| `text`    | string | Yes      | Button text                                      |
| `icon`    | string | No       | SVG markup for icon (renders left-aligned)       |
| `target`  | string | No       | Link target attribute (e.g., `_blank`)           |
| `rel`     | string | No       | Link rel attribute (e.g., `noopener noreferrer`) |

## Examples

### Basic button

```njk
{{ appButtonSecondary({
  href: "/download",
  text: "Download"
}) }}
```

### With icon

```njk
{{ appButtonSecondary({
  href: "/download",
  text: "Download file",
  icon: downloadIcon,
  target: "_blank",
  rel: "noopener noreferrer"
}) }}
```

## Styling

Styles are defined in:

- **Variables**: `src/client/stylesheets/variables/_button.scss`
- **Component**: `src/client/stylesheets/components/_button.scss`

The component uses GOV.UK Frontend design tokens for colors, spacing, and typography.

## Testing

Run tests with:

```bash
npm test -- src/server/common/components/button/template.test.js
```

## Accessibility

- Uses semantic `<a>` element
- Text is wrapped in `.aq-button-secondary__text` span for styling
- Icon (if present) is positioned absolutely, doesn't affect content flow
- Focus states use GOV.UK focus colour with sufficient contrast
- Covered by server-rendered component tests
