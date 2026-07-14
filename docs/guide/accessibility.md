---
outline: deep
---

# Accessibility

Agala components provide accessible primitives, but the consuming application remains responsible for meaningful labels, content, validation, and workflow behavior.

## Keyboard interaction

- Popovers, menus, selects, tabs, calendars, and composite controls support their expected Arrow, Enter, Space, Escape, Home, and End interactions where applicable.
- Modal and drawer overlays manage focus, close with Escape when enabled, and restore focus when dismissed.
- Focus rings use `--agala-ring` and remain visible for keyboard navigation.

## Forms

- Pair controls with `AgalaFormField` and connect `htmlFor` to the control ID.
- Use `error` for state and `errorMessage` or the field error for specific recovery instructions.
- Preserve native `disabled`, `readonly`, input `type`, and form button `type` behavior.
- Placeholders are examples, not replacements for labels.

## Color and status

- Status badges, alerts, progress, and trends must include meaningful text; color cannot carry the entire message.
- Icons rendered by `AgalaIcon` are decorative by default. Put the accessible name on the containing button or link.
- Provide sufficient contrast when overriding tokens or passing custom colors.

## Dynamic feedback

Toasts are appropriate for short confirmation but should not be the only place a user can discover or recover from an error. Keep persistent errors next to the affected control or workflow region.

## Consumer verification

Test each workflow with keyboard-only navigation, browser zoom, a screen reader, reduced viewport widths, and both default and dark color schemes.
