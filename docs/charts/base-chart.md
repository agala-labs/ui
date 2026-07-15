---
outline: deep
---

# BaseChart API

`BaseChart` is the only chart component currently exported from `@agala-labs/charts`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'line' \| 'bar' \| 'pie' \| 'scatter' \| 'radar' \| 'gauge'` | required | Chart family. |
| `datasets` | `Dataset[]` | required | Series and values. |
| `labels` | `string[]` | `[]` | Category labels for line, bar, and pie. |
| `height` | `number` | `280` | Chart height in pixels. |
| `stacked` | `boolean` | `false` | Stacks line or bar series. |
| `indicators` | `Indicator[]` | `[]` | Radar axes. Falls back to labels with a maximum of 100. |
| `max` | `number` | `100` | Gauge maximum. |

The dataset and indicator shapes are accepted by the component but are not currently exported as package types:

```ts
interface Dataset {
  name?: string
  data: number[] | number[][]
  color?: string
  areaStyle?: boolean
  smooth?: boolean
}

interface Indicator {
  name: string
  max: number
}
```

## Stacking

`stacked` applies one shared stack to all line or bar datasets. A stacked line automatically receives a low-opacity area fill; set `areaStyle: true` explicitly when the intent should be visible in the dataset definition.

## Sizing

The component accepts a numeric height and fills its available width. Give the containing layout a stable, non-zero width and avoid placing a chart in a permanently hidden region.

## Current limitations

- No multi-axis configuration.
- No animation-control props.
- No responsive-height prop; control height at the application layer.
- No built-in loading or empty state. Compose `AgalaSkeleton` or `AgalaEmptyState` around the chart.
- Gauge tooltips are intentionally disabled because the value is already visible.
