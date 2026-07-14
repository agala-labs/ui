---
name: agala-charts
description: >
  Expert knowledge of @el-agala/charts — an ECharts-based chart component
  library for Vue 3, sibling to @el-agala/ui. Powered by Apache ECharts 5
  + vue-echarts 7. Exposes 8 chart types with HSL theme integration.
  Auto-triggered when the user mentions "el-agala/charts", "agala charts",
  "BaseChart", or "charts library".
---

# @el-agala/charts — Chart Components

> Copy-paste this entire block into any AI assistant to teach it how to use `@el-agala/charts`.

---

## Overview

`@el-agala/charts` is a Vue 3 chart component library built on Apache ECharts 5 + vue-echarts 7. It lives in the same monorepo as `@el-agala/ui` but ships as a separate npm package to keep the UI library zero-dep.

**Key principles:**
- 8 chart types: line, bar, pie, scatter, radar, gauge, stacked area, stacked bar
- Automatic theme integration — reads `--agala-*` HSL tokens at runtime
- Reactive theme: responds to `data-theme` changes and `prefers-color-scheme` media query
- Single `BaseChart` component with a `type` prop
- ECharts emphasis config preserves colors on hover (no white/black flash)
- TypeScript, ESM-only build

---

## Installation

```bash
npm install @el-agala/charts echarts vue
```

No providers or wrappers needed — just import and use.

---

## Quick Start

```vue
<script setup lang="ts">
import { BaseChart } from '@el-agala/charts'
</script>

<template>
  <BaseChart
    type="line"
    :labels="['Jan','Feb','Mar','Apr','May','Jun']"
    :datasets="[{ name: 'Revenue', data: [1200, 1900, 1500, 2100, 1800, 2400] }]"
    :height="300"
  />
</template>
```

---

## Component API

### BaseChart

```vue
<BaseChart
  type="line"                          // required
  :datasets="[{ name: '', data: [] }]" // required
  :labels="[]"                         // optional — category labels
  :indicators="[]"                     // required for radar — [{ name, max }]
  :max="100"                           // required for gauge
  :height="300"                        // default 300
  :stacked="false"                     // bar/line only — stacks datasets
  :smooth="false"                      // line only — curved lines
/>
```

#### Chart types

| `type` | Description | Required props |
|---|---|---|
| `line` | Line chart | `labels`, `datasets` |
| `bar` | Bar chart | `labels`, `datasets` |
| `pie` | Pie chart (single dataset) | `labels`, `datasets[{ data }]` |
| `scatter` | Scatter plot | `datasets[{ data: [[x,y],...] }]` |
| `radar` | Radar chart | `indicators`, `datasets` |
| `gauge` | Gauge (single value) | `datasets[{ data: [n] }]`, `max` |

#### Stacked variants

`stacked` works with `type="line"` and `type="bar"`:

```vue
<BaseChart
  type="bar"
  stacked
  :labels="['Jan','Feb','Mar']"
  :datasets="[
    { name: 'Basic', data: [30, 40, 35] },
    { name: 'Pro', data: [20, 25, 30] }
  ]"
/>
```

For stacked area, use `type="line"` + `stacked` + `smooth` + `areaStyle` per dataset:

```vue
:datasets="[
  { name: 'New', data: [20, 28, 35], areaStyle: true },
  { name: 'Renewed', data: [80, 82, 85], areaStyle: true }
]"
```

#### Dataset format

```ts
interface ChartDataset {
  name: string
  data: number[] | [number, number][]  // scatter uses [x,y] pairs
  smooth?: boolean                      // line only
  areaStyle?: boolean                   // line only — fills area under line
}
```

---

## Theming

Themes are automatic. `useChartTheme` reads `--agala-*` HSL tokens from `document.documentElement` at runtime and passes them to ECharts.

- Responds to supported `data-theme` changes such as `main`, `smaltt`, and `kervo`
- Responds to `prefers-color-scheme: dark` media query
- Uses `MutationObserver` + `matchMedia` for reactivity
- Colors are read fresh on each chart render — no caching

**To customize:** Set CSS custom properties on `:root` or `html[data-theme="..."]`:

```css
:root {
  --agala-primary: 25 95% 53%;
  --agala-background: 0 0% 100%;
  --agala-card: 0 0% 100%;
}
```

Chart series colors are derived from theme tokens automatically. No manual color config needed.

---

## Composables

### useChartTheme

```ts
import { useChartTheme } from '@el-agala/charts'

const { getBaseOption } = useChartTheme()
const option = getBaseOption('line')
// { color: [...], tooltip: {...}, legend: {...}, grid: {...}, ... }
```

Used internally by BaseChart. Returns a base ECharts option object pre-configured with the current theme colors. You can spread it into custom options:

```ts
const myOption = {
  ...getBaseOption('bar'),
  series: [{ type: 'heatmap', data: [...], ... }]
}
```

This lets you build custom chart types not covered by BaseChart while still getting theme integration.

---

## Versioning (Makefile)

A `Makefile` at the repo root provides bump + publish targets:

```bash
# Patch bump (default)
make bump-charts
# → chore(charts): release v0.1.2
# → tag charts-v0.1.2

# Minor / major
make bump-charts BUMP=minor
make bump-charts BUMP=major

# Build + publish (auth handled by user)
make publish-charts

# One-shot: bump + publish
make release-charts
```

---

## File Structure

```
@el-agala/charts/
  dist/
    agala-charts.es.js     ← ESM bundle
    index.d.ts             ← TypeScript declarations
  src/
    components/
      BaseChart/
        BaseChart.vue       ← Main chart component
    composables/
      useChartTheme.ts      ← HSL token reader + ECharts option builder
    index.ts                ← Public API
```

```ts
// Recommended import style
import { BaseChart, useChartTheme } from '@el-agala/charts'
import type { ChartDataset } from '@el-agala/charts'
```

---

## Known Limitations

- No animation control props (uses ECharts defaults)
- No responsive height (use CSS or wrapper)
- No built-in loading skeleton (wrap in a container with Skeleton from `@el-agala/ui`)
- No multi-axis support in v1
- Gauge tooltip is intentionally disabled (detail already shows the value)
