---
outline: deep
---

# Agala Charts

`@agala-labs/charts` is the ECharts-powered companion to Agala UI. It ships separately so applications that do not visualize data avoid the chart runtime.

```bash
npm install @agala-labs/charts echarts vue-echarts
```

```vue
<script setup lang="ts">
import { BaseChart } from '@agala-labs/charts'
</script>

<template>
  <BaseChart
    type="line"
    :labels="['Jan', 'Feb', 'Mar', 'Apr']"
    :datasets="[{ name: 'Revenue', data: [120, 190, 165, 240] }]"
    :height="300"
  />
</template>
```

<ThemeControls />

## Gallery

The same `BaseChart` component renders all supported chart families. Colors and supporting surfaces are read from Agala tokens.

<ClientOnly>
  <ChartGallery />
</ClientOnly>

## Supported visualizations

| Visualization | Configuration |
| --- | --- |
| Line | `type="line"` |
| Bar | `type="bar"` |
| Pie | `type="pie"` with one dataset |
| Scatter | `type="scatter"` with `[x, y]` pairs |
| Radar | `type="radar"` with indicators |
| Gauge | `type="gauge"` with one value and optional maximum |
| Stacked bar | `type="bar" stacked` |
| Stacked area | `type="line" stacked` with `areaStyle` datasets |

See the [BaseChart API](/charts/base-chart) for the precise runtime contract and known limitations.
