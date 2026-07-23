---
name: agala-ui
description: >
  Expert knowledge for working on or consuming @agala-labs/ui, the Agala Labs Vue 3
  component library. Use when the user mentions Agala UI, Agala Labs UI, @agala-labs/ui,
  the UI package in this repo, its design tokens, or any Agala component.
---

# Agala Labs UI

`@agala-labs/ui` is Agala Labs' Vue 3 + TypeScript component library, built with Vite, scoped CSS, HSL design tokens, and accessible primitives. Vue is the peer dependency (`^3.3.0`); current source also uses `date-fns` for date utilities and a private `@lucide/vue` registry behind `AgalaIcon`.

## First Checks

- Read local source before changing APIs; this library is active and component behavior can drift.
- Public entry point: `src/lib/index.ts`.
- Plugin registration: `src/lib/plugin.ts`.
- Global tokens: `src/lib/tokens.css`; optional reset export: `@agala-labs/ui/reset.css`.
- Components live in `src/lib/components/<Component>/` with `<Component>.vue`, `types.ts`, and `index.ts`.
- Use `<script setup lang="ts">`, `withDefaults(defineProps<Props>(), ...)`, typed `defineEmits`, and scoped plain CSS.
- Do not introduce utility CSS frameworks, CSS Modules, or extra runtime dependencies without explicit approval.

## Styling Rules

- Use HSL tokens everywhere: `hsl(var(--agala-primary))`, `hsl(var(--agala-primary) / 0.9)`.
- Component CSS stays in `<style scoped>`.
- Prefer component-level CSS custom properties with token fallbacks, e.g. `--agala-btn-radius`, `--agala-input-bg`.
- Dark mode is handled in tokens via `@media (prefers-color-scheme: dark)`.
- Shipped themes use `html[data-theme="main|smaltt|kervo"]`; Smaltt also supports `data-theme="esmaltt"` for compatibility.
- Kervo keeps its navy/electric-blue/Geist identity while consuming the same semantic component contracts as other themes. Its destructive controls use the theme's deep-red `danger` token with a white `danger-foreground`; do not hardcode local red/foreground pairs.
- Focus rings use `box-shadow` and `--agala-ring`; disabled states should combine native `disabled`/ARIA with `pointer-events: none` and reduced opacity.
- Foundation tokens cover semantic colors, spacing (`--agala-space-*`), typography (`--agala-font-size-*`, `--agala-leading-*`, `--agala-tracking-*`), radii, shadows, icon sizes, opacity, motion, and semantic layers. Existing `--agala-transition-*` and `--agala-z-*` names remain compatibility aliases.

## Imports

```ts
import { AgalaButton, AgalaCard, AgalaUI } from '@agala-labs/ui'
import '@agala-labs/ui/reset.css'

app.use(AgalaUI)
```

Named themes are optional CSS imports:

```ts
import '@agala-labs/ui/themes/main.css'

document.documentElement.dataset.theme = 'main'
```

Available theme entry points are `main.css`, `smaltt.css`, and `kervo.css` under `@agala-labs/ui/themes/`. The default token stylesheet remains automatic light/dark; named product themes are fixed light themes.

All public component names use the `Agala` prefix. Internal implementation files may use unprefixed local imports.

Provider components are exported as `AgalaModalProvider` and `AgalaToastProvider`; managers are `modalManager` and `toastManager`.

## Public Component Inventory

Currently exported and globally registered:

- Form/input: `AgalaButton`, `AgalaInput`, `AgalaFormField`, `AgalaSelect`, `AgalaCreatableSelect`, `AgalaDatePicker`, `AgalaColorPicker`, `AgalaCheckbox`, `AgalaRadioGroup`, `AgalaTextarea`, `AgalaToggle`, `AgalaFileUpload`, `AgalaSegmentedControl`
- Feedback/overlay: `AgalaAlert`, `AgalaBadge`, `AgalaDrawer`, `AgalaModal`, `AgalaModalProvider`, `AgalaToastProvider`, `AgalaTooltip`, `AgalaProgress`, `AgalaSkeleton`, `AgalaEmptyState`, `AgalaDevEnvBanner`
- Navigation/data: `AgalaAccordion`, `AgalaAccordionItem`, `AgalaDropdownMenu`, `AgalaNavbar`, `AgalaPagination`, `AgalaSectionNav`, `AgalaSidebar`, `AgalaSidebarGroup`, `AgalaSidebarItem`, `AgalaSidebarToggle`, `AgalaTable`, `AgalaTabs`
- Layout/display: `AgalaAvatar`, `AgalaCard`, `AgalaCenter`, `AgalaDivider`, `AgalaHStack`, `AgalaListGroup`, `AgalaListGroupItem`, `AgalaSpacer`, `AgalaStack`, `AgalaStat`, `AgalaTag`, `AgalaVStack`
- Icon: `AgalaIcon`; types `IconName`, `IconSize`, `IconMotion`, and `AgalaIconProps`

## Public Utilities

Exported from `@agala-labs/ui`:

- `useMediaQuery`
- Date helpers: `parseDate`, `formatISODate`, `formatISODateTime`, `formatTime`, `formatTime24`, `formatDateLabel`, `formatMonthYear`, `formatFullDate`, `isSameDay`, `isToday`, `startOfWeek`, `addDays`, `getMonthGrid`, `getWeekDays`

Internal source composables include `useSelectFilter`, `useChipDisplay`, `useKeyboardNav`, `useFloatingOverlay`, `usePopoverBehavior`, and `useGridSelection`. Do not document them as package imports unless `src/lib/index.ts` exports them.

## Component API Notes

- `AgalaButton`: `variant` `default|secondary|outline|ghost|danger|link`; `size` `sm|md|lg|icon`; `type`, `loading`, `block`, `icon?: IconName|string`, `disabled`.
- `AgalaInput`: `v-model`, `size`, `variant` `default|ghost`, `error`, `errorMessage`, `disabled`, `readonly`, `iconStart`, `iconEnd`, `iconEndActionable`, `type`, `placeholder`, `wrapperClass`; password inputs use an eye toggle.
- `AgalaFormField`: `label`, `helper`, `error`, `disabled`, `htmlFor`, `required`; default slot for the control.
- `AgalaSelect`: `options`, `v-model`, `multiple`, `searchable`, `clearable`, `loading`, `onSearch`, `maxDisplayed`, `maxSelections`; uses a collision-aware native top-layer listbox and supports grouped/subtitled disabled options.
- `AgalaCreatableSelect`: multi-select chips with `options`, `v-model`, `creatable`, `labelKey`, `idKey`, `maxDisplayed`, `debounce`; emits `create` and `search`.
- `AgalaDatePicker`: `v-model`, `size`, `min`, `max`, `clearable`, `inline`, `highlightDates`, `displayMonth`; emits `update:displayMonth`.
- `AgalaColorPicker`: `v-model` hex string, `size`, `clearable`, `error`, `errorMessage`, visual square/hue controls, presets, manual hex input.
- `AgalaCalendar`: `events`, `v-model:view`, `v-model:currentDate`, `availableViews`, `hideHeader`, `dayStart`, `dayEnd`, `snapMinutes`; views `month|week|day|list`; emits `select`, `day-click`, `slot-select`; slots `header`, `empty-day`, and `event`, which receives `{ event, view, presentation, timeLabel, isCompact }`. Default time-grid cards progressively disclose title, time, and subtitle according to their rendered width and height while keeping complete accessible labels. Event content must not add nested interactive controls because the library retains the event button shell.
- `AgalaTable`: `columns`, `rows`, `selectable`, `v-model:selectedRows`, `v-model:sortKey`, `v-model:sortDir`, `loading`, `loadingRows`, `emptyMessage`, `rowKey`, `variant default|clean|minimal`, `density comfortable|compact`, `stickyHeader`, `stickyFirstColumn`, and `interactiveRows`; columns support `width` and `minWidth`; slots `cell-<key>`, `empty`, `footer`; emits `row-click`.
- `AgalaTabs`: content-panel navigation with `tabs`, `v-model`, `variant underline|pills`, and `ariaLabel`; panel slots are named `panel-<value>` and custom labels use `tab-<value>` with `{ tab, active }`. Underline is the canonical primary treatment. Pills are separated soft navigation items without an enclosing track or raised tile. Custom labels must not contain interactive controls. Do not use Tabs for a form value or immediate view-mode setting.
- `AgalaSectionNav`: one-level local navigation for settings and detail surfaces. Pass `items` with `value`, `label`, and optional `icon`, `href`, `disabled`, or `badge`; bind the active value with `v-model`. Use `variant="panel"` plus `density="compact"` for Smaltt-style bordered text navigation, or `variant="plain"` plus `density="comfortable"` for Kervo-style icon-led navigation. The Kervo theme gives the plain variant a quiet card surface; customize it with `--agala-section-nav-plain-bg`, `--agala-section-nav-plain-border`, `--agala-section-nav-plain-radius`, and `--agala-section-nav-plain-shadow`. `responsive="scroll"` keeps long sets on one narrow row and reveals the active item; `responsive="stack"` keeps the vertical list. The `select(item, event)` event supports router or scroll interception while href items retain native links by default.
- `AgalaPagination`: `v-model`, `total`, `pageSize`, `siblingCount`, `showEdges`; compact mobile layout.
- `AgalaModal`: `v-model:open`, `title`, `size sm|md|lg|xl|full`, `dismissible`, `escapeCloses`, `hideHeader`; footer slot receives `{ close }`; emits `after-leave` after visual removal. Its stable Teleport coordinates backdrop/dialog enter and leave, retains background scroll lock through leave, restores the opener afterward, guards rapid reopen, and removes meaningful transform travel under reduced motion. Tune with `--agala-modal-enter-duration`, `--agala-modal-leave-duration`, `--agala-modal-enter-easing`, and `--agala-modal-leave-easing`.
- `modalManager.open(component, options)`: requires one root `AgalaModalProvider`. Manager promises retain their existing close result while the provider keeps the entry mounted until the shared Modal leave completes.
- `toastManager.show(options)`: requires one root `AgalaToastProvider`; variants `default|success|warning|danger`, `duration: 0` means persistent.
- `AgalaDrawer`: controlled with `:open` and `@close`; `placement left|right|top|bottom`, viewport-clamped `size`, `title`, `dismissible`, `escapeCloses`; slots `header`, default, `footer` with `{ close }`. One coordinated presence transition fades the backdrop while the panel enters/leaves through its configured edge. It traps focus and retains background scroll lock through leave, restores the opener only after exit, guards rapid reopen, and removes meaningful travel under reduced motion. Themes may tune `--agala-drawer-enter-duration`, `--agala-drawer-leave-duration`, `--agala-drawer-enter-easing`, and `--agala-drawer-leave-easing`.
- `AgalaFileUpload`: `v-model` `FileItem[]`, `variant dropzone|inline`, `accept`, `multiple`, `maxSize`, `maxFiles`, labels/text props; emits `change`, `remove`, `error`.
- `AgalaSegmentedControl`: an enclosed immediate value/mode selector with `options`, `v-model`, `size sm|md|lg`, `block`, `ariaLabel`, and `disabled`; options support `icon`, semantic `variant`, and per-option disabled state; custom labels use `option-<value>` with `{ option, selected }` and must not contain interactive controls. Use it for 2–5 short equal-peer values, never for independent content panels; use `AgalaTabs` for those.
- `AgalaSidebar`: either pass structured `items` or use slots. Supports `v-model:collapsed`, `v-model:open`, `v-model:activeValue`, `v-model:expanded`, `defaultExpanded`, `indent compact|comfortable`, `responsive`, `width`, `collapsedWidth`; emits `select`. Tree items support `children`, badges, dots, icons, hrefs, disabled state. The active leaf owns the selected surface, active ancestors use icon/weight context without a competing fill, and nested disclosures coordinate a fast height clip, subtle content fade, and chevron rotation with reduced-motion support. Tune disclosure timing with `--agala-sidebar-disclosure-enter-duration` and `--agala-sidebar-disclosure-leave-duration`.
- `AgalaSidebarItem`: `icon`, `label`, `active`, `badge`, `badgeVariant`, `dot`, `dotVariant`, `disabled`; slots `icon` and default.
- `AgalaSidebarToggle`: emits `click`; props `ariaExpanded`, `ariaControls`, `ariaLabel`.
- `AgalaListGroup`: `variant divided|cards`, `gap`, `borderless`, `dividers`; `AgalaListGroupItem` has label/subtitle/icon/badge/actionIcon/radius, semantic `badgeVariant default|primary|success|warning|danger`, and `leading`, default, `trailing`, `badge` slots. The badge and trailing slots override the built-in badge treatment.
- `AgalaCard`: quiet outlined content container with no default elevation; `padding none|sm|md|lg`, `headerVariant default|compact`, `accent top|left|right|bottom`, `accentColor`; slots `header`, default, `footer`. Accents render as short inset edge markers rather than full-edge borders.
- `AgalaStat`: `label`, `value`, neutral `secondaryValue`, `trend`, `trendLabel`, `icon`, `iconBg`, `layout vertical|row|inline`, `bordered` (default `true`), `labelTransform`. The default surface is quiet and shadowless; labels use sentence case and optional icons render in every layout. Use vertical for comparable dashboard cards, row for icon-led exception summaries, and intrinsic-height inline with `bordered=false` for dense list or toolbar summaries. Secondary values render before trends without sign or percentage formatting and can be themed with `--agala-stat-secondary-size`, `--agala-stat-secondary-color`, and `--agala-stat-secondary-weight`.
- `AgalaBadge`: passive status/count/metadata with `variant default|secondary|outline|subtle|success|warning|danger`, `size sm|md`, `dot`, and any valid CSS `color`. Default and secondary variants are quiet neutral treatments; semantic variants use restrained tints. Badge always renders a non-focusable `span`; dots must accompany meaningful text and represent a real current state.
- `AgalaTag`: a user-applied label/filter token with `label`, `variant default|primary|secondary|success|warning|danger|outline`, `size sm|md`, `removable`, `interactive`, `disabled`, and any valid CSS `color`; emits `remove` and `click`. Passive tags are non-focusable spans. Set `interactive` for a native root button and `click` emission. Removable tags expose only their labeled remove button; if `interactive` and `removable` are both set, removal takes precedence and development builds warn. Use `AgalaBadge` instead for system-reported state, count, or metadata.
- `AgalaAlert`: borderless neutral notice with a subtle semantic icon treatment and `variant info|success|warning|danger`, `title`, `dismissible`, `flat`, `icon?: string|false`; slots are default body and `action`. Set `icon=false` to hide the icon. Icon, content, action, and dismissal keep one DOM order; compact flat alerts center as one row, titled alerts align controls to the first line, and actions wrap below the message under 639px. Dismissal is internal and does not emit.
- `AgalaProgress`: `variant linear|circular`, `value`, `size sm|md|lg`, `color primary|success|warning|danger`, `indeterminate`.
- `AgalaAvatar`: `src`, `alt`, `fallback`, `size xs|sm|md|lg|xl`, `shape circle|rounded|square`.
- `AgalaAccordion`/`AgalaAccordionItem`: `multiple`; items use `value`, `title`, `disabled`. Tune spacing with `--agala-accordion-trigger-padding` and `--agala-accordion-content-padding`; expanded content includes a restrained top inset, normalizes first/last child margins, and disables height/chevron interpolation under reduced motion.
- `AgalaDropdownMenu`: trigger slot; items have `label`, `icon`, `variant default|danger`, `disabled`, `separator`, `onClick`; placement `bottom-start|bottom-end` defaults to `bottom-end`. Its native top-layer menu flips vertically, shifts within an 8px viewport margin, and stays anchored during ancestor scrolling.
- `AgalaTooltip`: default slot trigger, `content`, `placement top|bottom|left|right`, `delay`, `block`.
- `AgalaNavbar`: slots `brand`, default nav content, `actions`.
- Layout primitives: `AgalaStack` supports `direction`, `gap`, `align`, `justify`, `wrap`, `as`; `AgalaHStack` and `AgalaVStack` omit `direction`; `AgalaSpacer` flexes; `AgalaCenter` centers; `AgalaDivider` supports `orientation`, `label`, `labelPosition`.
- `AgalaSkeleton`: `variant line|circle|rect`, `width`, `height`.
- `AgalaEmptyState`: required `title`, optional `description`, `size default|compact`; slots `icon`, `action`. Compact mode is intended for tables, drawers, split panes, and secondary panels.
- `AgalaDevEnvBanner`: dismissible warning banner with `text`.

## Icon System

`AgalaIcon` is the only supported icon rendering abstraction. Its private registry uses curated Lucide components plus Agala-owned product glyphs; consumers must never import Lucide directly. It accepts `name: IconName`, `size?: IconSize | number | string` (`xs|sm|md|lg|xl`), `strokeWidth?: number`, `motion?: none|hover|active`, and `active?: boolean`. Icons inherit `currentColor`, are `aria-hidden`, and respect reduced motion. Motion is off by default; opt in only for a familiar hover affordance or a real active state.

The registry includes the existing common names plus operational icons such as `user-plus`, `external-link`, `copy`, `move`, `save`, `print`, `upload`, `download`, `file`, `phone`, `map`, `map-pin`, `directions`, `store`, `package`, `boxes`, `warehouse`, `barcode`, `scan`, `scan-barcode`, `receipt-text`, `truck`, `tags`, `percent`, `wallet-cards`, `monitor-smartphone`, `database`, and `network`; healthcare icons such as `tooth`, `odontogram`, `diagnosis-link`, `health-coverage`, `stethoscope`, `clipboard-medical`, `heart-pulse`, `flask-conical`, and `shield-plus`; and Kervo glyphs `cash-register`, `stock-location`, and `price-compare`. Compatibility aliases include `chevron`, `edit`, `linked-diagnosis`, `receipt`, `wallet`, `terminal`, and `flask`.

Prefer existing icons and boolean/string icon props over adding icon slots unless the component already exposes one.

## Popover And Responsive Patterns

- Anchored overlays use `@floating-ui/vue` through internal `useFloatingOverlay`, with fixed coordinates, offset/flip/shift/size middleware, automatic scroll/resize updates, and an 8px viewport margin.
- Floating panels use `popover="manual"` so the browser top layer escapes overflow and stacking contexts without Vue Teleport. Open and close them through the shared composable; keep component-specific dismissal and focus behavior explicit.
- `usePopoverBehavior` centralizes outside-click and optional scroll-close behavior. Call it in `<script setup>`, not inside callbacks.
- Layout responsiveness should be CSS-first. Use `useMediaQuery` only for JS enhancements such as closing mobile drawers or scrolling active tabs.
- At 320px and wider, components must not create document-level horizontal overflow. Tables and long tab strips may scroll inside their own bounds; top-layer popovers must remain within an 8px viewport margin.

## Build And Verification

```bash
npm run lint
npm run build:lib
npm run dev
```

Library build runs `vue-tsc --noEmit`, Vite library build, copies `reset.css`, themes, and the bundled Lucide license, and creates `dist/agala-ui.browser.js` by removing the CSS import for import-map/browser usage.

## Companion Package

Charts live in the workspace package `packages/charts` and are covered by the `agala-charts` skill. Do not mix chart API details into this UI skill unless the task crosses packages.
