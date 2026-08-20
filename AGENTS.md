Agala Labs UI - Agent Instructions

## Project Overview

**Agala Labs UI** (`@agala-labs/ui`) is a Vue 3 component library with scoped CSS, semantic HSL design tokens, accessible primitives, and a companion charts workspace package.

- **Tech stack:** Vue 3 + TypeScript + Vite + scoped CSS. No CSS Modules.
- **Runtime:** Vue peer dependency (`>=3.5.0 <4`); components use `reka-ui` as headless behavior primitives internally, plus `date-fns` for date/calendar utilities.
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
│   │   ├── main.css
│   │   ├── smaltt.css
│   │   └── kervo.css
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
- Shipped theme overrides use `html[data-theme="main|smaltt|kervo"]`.
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

## AI Skill & Documentation Maintenance

The versioned consumer guidance shipped with this repository lives in:

- `skills/agala-ui/SKILL.md` for `@agala-labs/ui`.
- `skills/agala-charts/SKILL.md` for `@agala-labs/charts`.

Whenever consumer-visible behavior changes, update **both** the affected skill **and** the matching VitePress documentation in the same change — updating the skill alone is not sufficient. This includes adding, removing, or renaming components; changing props, defaults, emits, slots, `v-model` contracts, exports, plugin registration, icons, tokens, themes, public utilities, chart inputs, accessibility behavior, responsive behavior, or documented limitations.

The component/chart documentation content is **not** the `docs/components/*.md` files directly — those are thin `<ComponentDoc slug="..." />` wrappers. The actual props, slots, events, accessibility notes, and snippets live in `docs/data/components.ts`, keyed by `slug`. Edit the matching entry there.

Keep skill content aligned with the current source and public docs:

- Add new public APIs and examples when they become available.
- Remove or correct renamed, deleted, or changed APIs immediately.
- Do not describe internal composables or types as package imports unless the package entry point exports them.
- Internal refactors that do not affect consumers do not require a skill or docs update — but if the refactor fixes a bug so the component now matches what the docs already promised (e.g. a restored keyboard behavior), no doc change is needed either; only update docs when the true consumer-facing contract itself changes.

## Build & Publish

### Version Ownership

- Do not edit the `version` field in `package.json` or `package-lock.json` as part of feature, fix, or release implementation work.
- Package version bumps are maintainer-owned. The maintainer runs `npm version <version>` manually when the release is ready.
- Leave package metadata at its current version unless the maintainer explicitly asks for the version command to be run.

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
- `dist/themes/{main,smaltt,kervo}.css`
- `dist/agala-ui.browser.js` for browser import-map usage without CSS module import

### Package Config

- ESM package.
- Exported package root and `./reset.css`.
- `files` includes `dist` and the maintained `skills` directory.
- Workspace package: `packages/charts`.

## Accessibility Standards

- Use focus rings with `box-shadow` and `--agala-ring`.
- Use ARIA attributes for stateful controls: `aria-invalid`, `role="combobox"`, `aria-expanded`, `aria-selected`, etc.
- Support keyboard navigation where applicable: Arrow keys, Enter, Space, Escape, Tab, Home/End.
- Disabled states should combine native `disabled`/`aria-disabled` with CSS opacity and pointer handling.
- Teleported overlays and drawers/modals should preserve focus, dismissal, and Escape behavior.

## Dev Environment Notes

- This is a Vite library-mode project.
- `dist/` is generated output.
- Do not revert unrelated local changes; this repo is actively edited.

---
*Last updated: 2026-08-19*
