---
outline: deep
---

# useChartTheme

`useChartTheme` is exported for custom ECharts visualizations that should match Agala without using `BaseChart`.

```ts
import { useChartTheme } from '@el-agala/charts'

const { getBaseOption, getColorPalette } = useChartTheme()

const option = {
  ...getBaseOption('bar'),
  color: getColorPalette(),
  series: [
    { type: 'bar', data: [12, 18, 15, 24] },
  ],
}
```

## Return values

- `getBaseOption(type)` reads current tokens and returns shared text, animation, tooltip, grid, axis, legend, or gauge defaults appropriate to the requested supported family.
- `getColorPalette()` returns the current semantic series palette.

Both functions read tokens when called rather than caching them. Rebuild the custom option after a named-theme or color-scheme change if the custom chart must react live.
