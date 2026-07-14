---
layout: home

hero:
  name: Agala Labs UI
  text: Components and charts for Vue 3
  tagline: Accessible product primitives that share one semantic token system.
  image:
    src: /brand/agala-labs-wordmark.png
    alt: Agala Labs
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Browse components
      link: /components/
    - theme: alt
      text: Explore charts
      link: /charts/

features:
  - icon: ◫
    title: UI components
    details: Forms, navigation, overlays, data display, and layout primitives for production Vue applications.
    link: /components/
    linkText: View the catalog
  - icon: ◒
    title: Charts
    details: An ECharts-powered companion package with eight common visualizations and automatic token theming.
    link: /charts/
    linkText: Open the gallery
  - icon: ◐
    title: Semantic theming
    details: Raw HSL custom properties, automatic dark mode, and supported Main, Smaltt, and Kervo themes.
    link: /guide/theming
    linkText: Learn theming
---

## Two packages, one visual language

Install only what your product needs. `@el-agala/ui` remains a focused Vue component library, while `@el-agala/charts` ships separately with its ECharts runtime.

> **Package naming:** Agala Labs UI is intended to move to `@agala-labs/ui`. Until that migration happens, install and import the currently published `@el-agala/ui` package shown below.

```bash
npm install @el-agala/ui
npm install @el-agala/charts echarts vue-echarts
```

<ThemeControls />
