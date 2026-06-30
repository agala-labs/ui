---
name: agala-ui
description: >
  Expert knowledge for working on or consuming @el-agala/ui, the Agala Vue 3
  component library. Use when the user mentions Agala UI, @el-agala/ui,
  the UI package in this repo, its design tokens, or any Agala component.
---

# Agala UI

`@el-agala/ui` is a Vue 3 + TypeScript component library built with Vite, scoped CSS, HSL design tokens, and accessible primitives. Vue is the peer dependency (`^3.3.0`); current source also uses `date-fns` for date utilities and calendar/date components.

## First Checks

- Read local source before changing APIs; this library is active and component behavior can drift.
- Public entry point: `src/lib/index.ts`.
- Plugin registration: `src/lib/plugin.ts`.
- Global tokens: `src/lib/tokens.css`; optional reset export: `@el-agala/ui/reset.css`.
- Components live in `src/lib/components/<Component>/` with `<Component>.vue`, `types.ts`, and `index.ts`.
- Use `<script setup lang="ts">`, `withDefaults(defineProps<Props>(), ...)`, typed `defineEmits`, and scoped plain CSS.
- Do not introduce utility CSS frameworks, CSS Modules, or extra runtime dependencies without explicit approval.

## Styling Rules

- Use HSL tokens everywhere: `hsl(var(--agala-primary))`, `hsl(var(--agala-primary) / 0.9)`.
- Component CSS stays in `<style scoped>`.
- Prefer component-level CSS custom properties with token fallbacks, e.g. `--agala-btn-radius`, `--agala-input-bg`.
- Dark mode is handled in tokens via `@media (prefers-color-scheme: dark)`.
- Custom themes use attributes such as `html[data-theme="forja"]`; `src/lib/themes/forja.css` is the local theme example.
- Focus rings use `box-shadow` and `--agala-ring`; disabled states should combine native `disabled`/ARIA with `pointer-events: none` and reduced opacity.

## Imports

```ts
import { AgalaButton, AgalaCard, AgalaUI } from '@el-agala/ui'
import '@el-agala/ui/reset.css'

app.use(AgalaUI)
```

All public component names use the `Agala` prefix. Internal implementation files may use unprefixed local imports.

Provider components are exported as `AgalaModalProvider` and `AgalaToastProvider`; managers are `modalManager` and `toastManager`.

## Public Component Inventory

Currently exported and globally registered:

- Form/input: `AgalaButton`, `AgalaInput`, `AgalaFormField`, `AgalaSelect`, `AgalaCreatableSelect`, `AgalaDatePicker`, `AgalaColorPicker`, `AgalaCheckbox`, `AgalaRadioGroup`, `AgalaTextarea`, `AgalaToggle`, `AgalaFileUpload`
- Feedback/overlay: `AgalaAlert`, `AgalaBadge`, `AgalaDrawer`, `AgalaModal`, `AgalaModalProvider`, `AgalaToastProvider`, `AgalaTooltip`, `AgalaProgress`, `AgalaSkeleton`, `AgalaEmptyState`, `AgalaDevEnvBanner`
- Navigation/data: `AgalaAccordion`, `AgalaAccordionItem`, `AgalaDropdownMenu`, `AgalaNavbar`, `AgalaPagination`, `AgalaSidebar`, `AgalaSidebarGroup`, `AgalaSidebarItem`, `AgalaSidebarToggle`, `AgalaTable`, `AgalaTabs`
- Layout/display: `AgalaAvatar`, `AgalaCard`, `AgalaCenter`, `AgalaDivider`, `AgalaHStack`, `AgalaListGroup`, `AgalaListGroupItem`, `AgalaSpacer`, `AgalaStack`, `AgalaStat`, `AgalaTag`, `AgalaVStack`
- Internal but exported: `AgalaIcon` and `IconName`

## Public Utilities

Exported from `@el-agala/ui`:

- `useMediaQuery`
- Date helpers: `parseDate`, `formatISODate`, `formatISODateTime`, `formatTime`, `formatTime24`, `formatDateLabel`, `formatMonthYear`, `formatFullDate`, `isSameDay`, `isToday`, `startOfWeek`, `addDays`, `getMonthGrid`, `getWeekDays`

Internal source composables include `useSelectFilter`, `useChipDisplay`, `useKeyboardNav`, `useDropdownPosition`, `usePopoverBehavior`, and `useGridSelection`. Do not document them as package imports unless `src/lib/index.ts` exports them.

## Component API Notes

- `AgalaButton`: `variant` `default|secondary|outline|ghost|danger|link`; `size` `sm|md|lg|icon`; `type`, `loading`, `block`, `icon?: IconName|string`, `disabled`.
- `AgalaInput`: `v-model`, `size`, `variant` `default|ghost`, `error`, `errorMessage`, `disabled`, `readonly`, `iconStart`, `iconEnd`, `iconEndActionable`, `type`, `placeholder`, `wrapperClass`; password inputs use an eye toggle.
- `AgalaFormField`: `label`, `helper`, `error`, `disabled`, `htmlFor`, `required`; default slot for the control.
- `AgalaSelect`: `options`, `v-model`, `multiple`, `searchable`, `clearable`, `loading`, `onSearch`, `maxDisplayed`, `maxSelections`; teleports the popover and supports grouped/subtitled disabled options.
- `AgalaCreatableSelect`: multi-select chips with `options`, `v-model`, `creatable`, `labelKey`, `idKey`, `maxDisplayed`, `debounce`; emits `create` and `search`.
- `AgalaDatePicker`: `v-model`, `size`, `min`, `max`, `clearable`, `inline`, `highlightDates`, `displayMonth`; emits `update:displayMonth`.
- `AgalaColorPicker`: `v-model` hex string, `size`, `clearable`, `error`, `errorMessage`, visual square/hue controls, presets, manual hex input.
- `AgalaCalendar`: `events`, `v-model:view`, `v-model:currentDate`, `availableViews`, `hideHeader`, `dayStart`, `dayEnd`, `snapMinutes`; views `month|week|day|list`; emits `select`, `day-click`, `slot-select`; slots `header`, `event`, `empty-day`.
- `AgalaTable`: `columns`, `rows`, `selectable`, `v-model:selectedRows`, `v-model:sortKey`, `v-model:sortDir`, `loading`, `emptyMessage`, `rowKey`, `variant default|clean|minimal`; slots `cell-<key>`, `empty`, `footer`; emits `row-click`.
- `AgalaTabs`: `tabs`, `v-model`, `variant underline|pills`; panel slots are named `panel-<value>`.
- `AgalaPagination`: `v-model`, `total`, `pageSize`, `siblingCount`, `showEdges`; compact mobile layout.
- `AgalaModal`: `v-model:open`, `title`, `size sm|md|lg|xl|full`, `dismissible`, `escapeCloses`, `hideHeader`; footer slot receives `{ close }`.
- `modalManager.open(component, options)`: requires one root `AgalaModalProvider`.
- `toastManager.show(options)`: requires one root `AgalaToastProvider`; variants `default|success|warning|danger`, `duration: 0` means persistent.
- `AgalaDrawer`: controlled with `:open` and `@close`; `placement left|right|top|bottom`, `size`, `title`, `dismissible`, `escapeCloses`; slots `header`, default, `footer` with `{ close }`.
- `AgalaFileUpload`: `v-model` `FileItem[]`, `variant dropzone|inline`, `accept`, `multiple`, `maxSize`, `maxFiles`, labels/text props; emits `change`, `remove`, `error`.
- `AgalaSidebar`: either pass structured `items` or use slots. Supports `v-model:collapsed`, `v-model:open`, `v-model:activeValue`, `v-model:expanded`, `defaultExpanded`, `indent compact|comfortable`, `responsive`, `width`, `collapsedWidth`; emits `select`. Tree items support `children`, badges, dots, icons, hrefs, disabled state.
- `AgalaSidebarItem`: `icon`, `label`, `active`, `badge`, `badgeVariant`, `dot`, `dotVariant`, `disabled`; slots `icon` and default.
- `AgalaSidebarToggle`: emits `click`; props `ariaExpanded`, `ariaControls`, `ariaLabel`.
- `AgalaListGroup`: `variant divided|cards`, `gap`, `borderless`, `dividers`; `AgalaListGroupItem` has label/subtitle/icon/badge/actionIcon/radius and `leading`, default, `trailing`, `badge` slots.
- `AgalaCard`: `padding none|sm|md|lg`, `headerVariant default|compact`, `accent top|left|right|bottom`, `accentColor`; slots `header`, default, `footer`.
- `AgalaStat`: `label`, `value`, `trend`, `trendLabel`, `icon`, `iconBg`, `layout vertical|row|inline`, `bordered`, `labelTransform`.
- `AgalaBadge`: `variant default|secondary|outline|subtle|success|warning|danger`, `size sm|md`, `dot`, `color`.
- `AgalaTag`: `label`, `variant default|primary|secondary|success|warning|danger|outline`, `size sm|md`, `removable`, `disabled`, `color`; emits `remove` and `click`.
- `AgalaAlert`: `variant info|success|warning|danger`, `title`, `dismissible`, `flat`, `icon?: string|false`; default slot for body. Dismissal is internal and does not emit.
- `AgalaProgress`: `variant linear|circular`, `value`, `size sm|md|lg`, `color primary|success|warning|danger`, `indeterminate`.
- `AgalaAvatar`: `src`, `alt`, `fallback`, `size xs|sm|md|lg|xl`, `shape circle|rounded|square`.
- `AgalaAccordion`/`AgalaAccordionItem`: `multiple`; items use `value`, `title`, `disabled`.
- `AgalaDropdownMenu`: trigger slot; items have `label`, `icon`, `variant default|danger`, `disabled`, `separator`, `onClick`; placement `bottom-start|bottom-end`.
- `AgalaTooltip`: default slot trigger, `content`, `placement top|bottom|left|right`, `delay`, `block`.
- `AgalaNavbar`: slots `brand`, default nav content, `actions`.
- Layout primitives: `AgalaStack` supports `direction`, `gap`, `align`, `justify`, `wrap`, `as`; `AgalaHStack` and `AgalaVStack` omit `direction`; `AgalaSpacer` flexes; `AgalaCenter` centers; `AgalaDivider` supports `orientation`, `label`, `labelPosition`.
- `AgalaSkeleton`: `variant line|circle|rect`, `width`, `height`.
- `AgalaEmptyState`: required `title`, optional `description`; slots `icon`, `action`.
- `AgalaDevEnvBanner`: dismissible warning banner with `text`.

## Icon System

`AgalaIcon` renders local inline SVGs using an `IconName` string. Common icons include `search`, `mail`, `eye`, `eye-off`, `user`, `users`, `chevron*`, `check`, `x`, `calendar`, `clock`, `spinner`, `info`, `alert-*`, `more-*`, `arrow-*`, `trending-*`, `home`, `bell`, `settings`, `menu`, `panel-left`, `pencil`, `trash`, `plus`, `filter`, `building`, `document`, `credit-card`, `lock`, `sign-out`, `chart-bar`, `archive`, `inbox`, `key`, `grid`, `columns`, and `list`.

Prefer existing icons and boolean/string icon props over adding icon slots unless the component already exposes one.

## Popover And Responsive Patterns

- Dropdown-like components generally teleport/fix-position floating panels to escape overflow and modal stacking contexts.
- When using `useDropdownPosition`, recompute after `nextTick()` and `requestAnimationFrame()` on open, and pass a floating ref for second-pass collision handling.
- `usePopoverBehavior` centralizes outside-click, scroll-close, and resize-reposition behavior. Call it in `<script setup>`, not inside callbacks.
- Layout responsiveness should be CSS-first. Use `useMediaQuery` only for JS enhancements such as closing mobile drawers or scrolling active tabs.

## Build And Verification

```bash
npm run lint
npm run build:lib
npm run dev
```

Library build runs `vue-tsc --noEmit`, Vite library build, copies `reset.css`, and creates `dist/agala-ui.browser.js` by removing the CSS import for import-map/browser usage.

## Companion Package

Charts live in the workspace package `packages/charts` and are covered by the `agala-charts` skill. Do not mix chart API details into this UI skill unless the task crosses packages.
