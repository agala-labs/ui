# Agala Labs UI

Agala Labs UI is a Vue 3 component system with scoped CSS, semantic HSL design tokens, accessible interaction patterns, and an optional ECharts companion package.

## Packages

- `@agala-labs/ui` — forms, navigation, overlays, data display, layout primitives, tokens, themes, and date utilities.
- `@agala-labs/charts` — line, bar, pie, scatter, radar, gauge, and stacked charts powered by Apache ECharts.

## Local documentation

```bash
npm install
npm run dev
```

The VitePress site includes getting-started guidance, theming, accessibility, the complete component API catalog, live examples, and the charts gallery.

```bash
npm run docs:build
npm run docs:preview
```

## Library development

```bash
npm run lint
npm run build:lib
npm run build --workspace @agala-labs/charts
```

The UI package is ESM and requires Vue `^3.3.0` as a peer dependency. Charts are published separately and depend on `echarts` and `vue-echarts`.

Release tags publish one package at a time: `v0.32.0` publishes UI and
`charts-v0.1.3` publishes charts. Once both versions exist on npm, the release
pipeline publishes `ghcr.io/agala-labs/ui-docs:<commit-sha>` and deploys it to
`ui.agala.com.ar`. A manual rerun of the docs deployment at an earlier commit
is deploy-only and rolls the site back to that already-built immutable image.

## Usage

```ts
import { createApp } from 'vue'
import { AgalaUI } from '@agala-labs/ui'
import '@agala-labs/ui/reset.css'
import App from './App.vue'

createApp(App).use(AgalaUI).mount('#app')
```

Optional product themes are shipped as CSS subpaths:

```ts
import '@agala-labs/ui/themes/main.css'

document.documentElement.dataset.theme = 'main'
```

Available selectors are `main`, `smaltt` (also `esmaltt`), and `kervo`.

```vue
<script setup lang="ts">
import { BaseChart } from '@agala-labs/charts'
</script>

<template>
  <BaseChart
    type="line"
    :labels="['Jan', 'Feb', 'Mar']"
    :datasets="[{ name: 'Revenue', data: [120, 180, 240] }]"
  />
</template>
```

## License

MIT
