---
outline: deep
---

# Chart theming

Charts read Agala HSL tokens from `document.documentElement` and convert them to ECharts colors at runtime. No ECharts theme registration is required.

<ThemeControls />

## Tokens used

Series colors begin with `--agala-primary`, `--agala-success`, `--agala-warning`, and `--agala-danger`. Chart text, grid, tooltip, and background styling use foreground, muted foreground, border, and card tokens.

```css
:root {
  --agala-primary: 25 95% 53%;
  --agala-success: 142 71% 45%;
  --agala-warning: 43 96% 50%;
  --agala-danger: 0 84% 60%;
  --agala-card: 0 0% 100%;
  --agala-foreground: 240 10% 4%;
  --agala-muted-foreground: 240 4% 46%;
  --agala-border: 240 6% 90%;
}
```

`BaseChart` reacts to `data-theme` changes and `prefers-color-scheme` changes. Named themes such as Forja therefore update UI and chart components together.

## Per-series color

Pass a CSS color through the dataset when one series must have a fixed semantic meaning:

```ts
const datasets = [
  { name: 'Failures', data: [4, 8, 3], color: 'hsl(0 84% 60%)' },
]
```

Prefer shared tokens for product-wide palette choices; fixed series colors are best reserved for meanings that must remain stable across views.
