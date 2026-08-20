# Migrating consumers to the Reka-based UI internals

## What changed

`@agala-labs/ui` now uses [`reka-ui`](https://reka-ui.com) as the headless
behavior layer for 20 component families. Public component APIs (props,
emits, slots) are unchanged. This is an internal implementation swap, not a
redesign — the goal was to stop hand-rolling focus traps, roving tabindex,
collision-aware positioning, and dismiss logic, and lean on a maintained
primitives library instead.

- **Peer dependency:** `vue` bumped from `^3.3.0` to `>=3.5.0 <4`. All three
  consumer apps (`intelligence`, `smaltt-app`, `kervo-app`) already run
  `^3.5.33`, so this is not a blocker for any of them.
- **New dependency:** `reka-ui@^2.10.3` is now a direct dependency of
  `@agala-labs/ui` (not a peer dep — consumers don't install it themselves).
- **Migrated:** Accordion, Avatar, Checkbox, CreatableSelect, DatePicker,
  Divider, Drawer, DropdownMenu, FormField, Modal, Pagination, Progress,
  RadioGroup, SegmentedControl, Select, Tabs, ToastProvider, Toggle, Tooltip.
- **Deliberately not migrated:** `ColorPicker`. Reka's `ColorArea`/`ColorSlider`/
  `ColorField` primitives emit on every pointer move and canonicalize hex
  differently than this component's confirm/rollback/clearable behavior
  requires — migrating it would need a large adapter layer for no real
  benefit, so it stays on the original custom implementation.

## The one real behavior change: DropdownMenu + Tab

The old custom `DropdownMenu` closed on `Tab`. Reka's menu traps focus
inside an open menu instead (matching the WAI-ARIA menu button pattern more
closely) — pressing `Tab` inside an open menu now cycles within it rather
than closing it. Only `Escape`, selecting an item, or clicking outside
closes it now.

If any consumer app has a test or a documented flow that relies on
"Tab closes the dropdown," it needs updating. A repo-wide search turned up
none in `smaltt-app` or `kervo-app`, but re-check screens with dropdown
menus embedded in complex forms during manual QA (see checklist below).

## What did *not* change (verified, not assumed)

- No consumer app imports the internal `useFloatingOverlay` or
  `usePopoverBehavior` composables directly — both were removed from
  `@agala-labs/ui`'s internals during the migration. Confirmed via a
  repo-wide search across `smaltt-app` and `kervo-app`; safe.
- Component props/emits/slots are unchanged for every migrated component.
- Visual appearance is unchanged (background, border, radius, shadow,
  spacing) — this was verified by screenshot during the migration.

## Real bugs this migration surfaced and fixed (context, not action items)

These were regressions introduced *during* the Reka migration and are
already fixed on this branch — listed here so you know what was actually
tested, not because consumers need to do anything about them:

- Scoped CSS wasn't reaching Reka's teleported (portaled) content in
  `DropdownMenu`, `Tooltip`, `Select`, and `CreatableSelect` — those
  components briefly rendered completely unstyled. Fixed by scoping the
  affected rules to a static wrapper class per component instead of relying
  on Vue's scoped-attribute propagation through a third-party `<Teleport>`.
- `Select`/`CreatableSelect` search input focus and `ArrowDown`-to-open threw
  a runtime error and silently broke floating-panel positioning (missing
  `ComboboxAnchor` wrapper around the trigger).
- `DropdownMenu`'s `align="end"` positioned content flush against the
  trigger's edge instead of right-aligned to it — traced to a leftover
  `position: fixed` rule on `.menu` from the pre-Reka implementation, which
  broke Reka's own positioning wrapper's width calculation.
- Global CSS collided with VitePress's own `.menu` class site-wide (only
  matters for this repo's docs site, not consumer apps, since consumer apps
  don't include this library's raw source styles).

## Migration checklist per app

Each app pins `@agala-labs/ui` explicitly (`intelligence` at an exact
`0.39.1`, `smaltt-app` and `kervo-app` on `^0.37.x` — both several minors
behind and *not* eligible for an automatic caret update to whatever version
ships this migration). Nothing auto-updates; this is an explicit, app-by-app
opt-in.

1. **Publish** the new `@agala-labs/ui` version once this branch lands
   (local commit only, not published — see note at the end).
2. **Bump the pin** in the app's `package.json` to the new version, then
   `npm install`.
3. **Rebuild and smoke-test locally** before touching CI/deploy.
4. **Manually re-verify overlay-heavy screens** — this is the part worth
   real attention, since positioning/stacking bugs like the ones above don't
   always show up in a type-check or a quick glance:
   - Any screen with a `Select`, `CreatableSelect`, or `DropdownMenu`
     rendered inside a `Modal` or `Drawer` (the stacking-order class of bug
     found during this migration only shows up in that combination).
   - Any screen with a `DropdownMenu` or `Select` near a viewport edge
     (right-aligned dropdowns, mobile widths) — check it doesn't overflow.
   - Tooltip hover/focus behavior on icon-only buttons.
   - Any custom CSS in the consumer app that targets this library's
     internal class names directly (`.menu`, `.dropdown`, `.tooltipShell`,
     `.option`, etc.) rather than the documented component props — these
     are implementation details and were never a supported extension point,
     but if anything reaches in via a global stylesheet it should be found
     and ported to a supported prop/slot instead of assumed to still work
     identically.
5. **Recommended order:** `intelligence` first (already the dogfooding
   target for this migration, smallest usage surface at 17 files), then
   `smaltt-app` (36 files) and `kervo-app` (78 files) — in that order, since
   `kervo-app` has the largest surface area and benefits most from bugs
   already being shaken out by the earlier two.
6. **Rollback:** revert the version pin and reinstall — this is a published
   package version bump, not a schema or data migration, so rollback is
   just "point at the old version again."

## Note on publish state

As of this write-up, the Reka migration exists as **uncommitted local
changes in `../ui`**, not yet committed, versioned, or published to npm.
Before any consumer app can start step 2 above, the `ui` maintainer needs
to: review the diff, commit, bump the package version, and `npm publish`.
This document assumes that has happened by the time anyone acts on it.
