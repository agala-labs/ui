# Agala UI

Agala is a Vue 3 component system with scoped CSS, semantic HSL design tokens, accessible interaction patterns, and an optional ECharts companion package.

## Packages

- `@el-agala/ui` — forms, navigation, overlays, data display, layout primitives, tokens, themes, and date utilities.
- `@el-agala/charts` — line, bar, pie, scatter, radar, gauge, and stacked charts powered by Apache ECharts.

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

The original all-components stress-test surface remains available to maintainers:

```bash
npm run playground:dev
```

## Library development

```bash
npm run lint
npm run build:lib
npm run build --workspace @el-agala/charts
```

The UI package is ESM and requires Vue `^3.3.0` as a peer dependency. Charts are published separately and depend on `echarts` and `vue-echarts`.

## Usage

```ts
import { createApp } from 'vue'
import { AgalaUI } from '@el-agala/ui'
import '@el-agala/ui/reset.css'
import App from './App.vue'

createApp(App).use(AgalaUI).mount('#app')
```

```vue
<script setup lang="ts">
import { BaseChart } from '@el-agala/charts'
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
