# Form-control attribute migration

The next `@agala-labs/ui` release keeps the per-instance popup IDs introduced
in 0.40.0 and makes form metadata explicit for `AgalaInput`, `AgalaSelect`,
`AgalaCreatableSelect`, and `AgalaDatePicker`.

## Consumer changes

- Prefer `id` for new code. `inputId` remains supported as a compatibility
  alias and is used when `id` is not provided.
- `name`, `required`, and `autocomplete` now have typed props. On
  `AgalaInput` they are forwarded to the native `<input>`. Select controls
  expose a native form value when `name` is present; DatePicker exposes a
  native date value for the same purpose.
- `ariaLabel`, `ariaLabelledby`, `ariaDescribedby`, `ariaDetails`, and
  `ariaErrorMessage` target the interactive control. `ariaInvalid` and
  `ariaRequired` can provide an explicit ARIA state; component validation and
  `required` still provide their default state when these are omitted.
- Existing `inputId`, popup `aria-controls`, and `v-model` contracts do not
  change. Popup/listbox/grid IDs remain unique per component instance.

No runtime dependency or utility CSS is required. The package version remains
maintainer-owned; bump and publish only after consumer smoke tests pass.
