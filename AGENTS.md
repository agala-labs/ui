Agala UI - Agent Instructions

## Project Overview

**Agala UI** (`@el-agala/ui`) is a Vue 3 component library with scoped CSS, semantic HSL design tokens, accessible primitives, and a companion charts workspace package.

- **Tech stack:** Vue 3 + TypeScript + Vite + scoped CSS. No CSS Modules.
- **Runtime:** Vue peer dependency (`^3.3.0`); current source also uses `date-fns` for date/calendar utilities.
- **Style system:** Semantic CSS custom properties in HSL format with built-in dark mode and optional themes.
- **Current phase:** Active development; check source before assuming component APIs.

## Repository Structure

```
src/
├── lib/
│   ├── tokens.css
│   ├── reset.css
│   ├── index.ts
│   ├── plugin.ts
│   ├── themes/
│   │   └── forja.css
│   ├── composables/
│   └── components/
│       ├── AgalaIcon/
│       ├── Button/
│       ├── Input/
│       ├── Select/
│       ├── Modal/
│       ├── Toast/
│       ├── Sidebar/
│       └── ...
├── playground/
│   └── Playground.vue
├── main.ts
└── index.css

packages/
└── charts/

skills/
├── agala-ui/
└── agala-charts/
```

## Architecture & Conventions

### Component Structure

Every component is a `.vue` SFC with:

- Template: vanilla HTML with Vue directives.
- Script: `<script setup lang="ts">` with explicit imports.
- Style: `<style scoped>` with plain classes.

Component folders should expose local `index.ts` and `types.ts` when public types exist.

### Styling System

- Do not add Tailwind, UnoCSS, CSS Modules, or utility-class frameworks.
- Use scoped CSS in each component.
- Use HSL token values:
  ```css
  color: hsl(var(--agala-primary));
  background: hsl(var(--agala-primary) / 0.9);
  ```
- Import `tokens.css` once through `src/lib/index.ts`.
- Dark mode belongs in `tokens.css` via `@media (prefers-color-scheme: dark)`.
- Theme overrides use selectors such as `html[data-theme="forja"]`.
- Prefer component-level CSS custom properties with token fallbacks for themeable values.

### Icons

- `AgalaIcon` renders local inline SVGs and accepts an `IconName` string.
- Prefer existing icon props before adding new slots.
- SVG icons must be `aria-hidden="true"` unless they are intentionally interactive/labeled.

### Component API Patterns

- Props are interfaces/types with defaults via `withDefaults(defineProps(), {...})`.
- Emits are typed with `defineEmits()`.
- Public components are exported with the `Agala` prefix from `src/lib/index.ts`.
- The plugin registers the same prefixed component names in `src/lib/plugin.ts`.
- `class` props are accepted for consumer overrides where established.
- Vue-native patterns are preferred: `ref`, `computed`, `watch`, `Teleport`, `slots`, `provide/inject`.

## Current Public Surface

Public components include Button, Input, FormField, Select, CreatableSelect, DatePicker, Calendar, ColorPicker, Checkbox, RadioGroup, Textarea, Toggle, FileUpload, Alert, Badge, Drawer, Modal, ToastProvider, Tooltip, Progress, Skeleton, EmptyState, DevEnvBanner, Accordion, DropdownMenu, Navbar, Pagination, Sidebar, Table, Tabs, Avatar, Card, Center, Divider, Stack/HStack/VStack, Spacer, Stat, Tag, ListGroup, and AgalaIcon.

Public utilities currently exported from `src/lib/index.ts` are `useMediaQuery` and date helpers. Other composables in `src/lib/composables` are internal unless explicitly exported.

## Build & Publish

### Scripts

```bash
npm run dev
npm run build:lib
npm run preview
npm run lint
```

### Build Output

- `dist/agala-ui.es.js`
- `dist/index.d.ts`
- `dist/reset.css`
- `dist/agala-ui.browser.js` for browser import-map usage without CSS module import

### Package Config

- ESM package.
- Exported package root and `./reset.css`.
- `files` includes `dist`, `AI_CONTEXT.md`, and `skills`.
- Workspace package: `packages/charts`.

## Accessibility Standards

- Use focus rings with `box-shadow` and `--agala-ring`.
- Use ARIA attributes for stateful controls: `aria-invalid`, `role="combobox"`, `aria-expanded`, `aria-selected`, etc.
- Support keyboard navigation where applicable: Arrow keys, Enter, Space, Escape, Tab, Home/End.
- Disabled states should combine native `disabled`/`aria-disabled` with CSS opacity and pointer handling.
- Teleported overlays and drawers/modals should preserve focus, dismissal, and Escape behavior.

## Dev Environment Notes

- This is a Vite library-mode project.
- `Playground.vue` is a dev/demo surface and may use relative imports.
- `dist/` is generated output.
- Do not revert unrelated local changes; this repo is actively edited.

---
*Last updated: 2026-06-30*
