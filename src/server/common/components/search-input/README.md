# Search input

`appSearchInput` — a reusable search form (heading + optional hint + text box +
Continue button + error summary/inline error) shared by the facility search
pages (search by location / name / region or county / river basin / year).

## Usage

```njk
{% from "search-input/macro.njk" import appSearchInput %}

{{ appSearchInput({
heading: heading,
hint: hint,
inputLabel: inputLabel,
buttonText: buttonText,
action: action,
value: fullSearchQuery.value,
errors: errors,
errorMessage: errorMessage
}) }}
```

## Params

| Param                     | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `heading`                 | Page heading, rendered as the input's `<label>`                                    |
| `hint`                    | Optional hint text under the heading                                               |
| `inputLabel`              | Visible label for the text box                                                     |
| `buttonText`              | Submit button text                                                                 |
| `action`                  | Form POST target                                                                   |
| `value`                   | Current input value (re-rendered after a validation error)                         |
| `errors` / `errorMessage` | Session values set by `setErrorMessage()` — drive the error summary + inline error |
| `name`                    | Input name (default: `fullSearchQuery`)                                            |
