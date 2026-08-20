---
outline: deep
---

# Getting started

Agala Labs UI is a Vue 3 component library built with scoped CSS and semantic HSL design tokens. Components can be imported individually or registered through the plugin.

## Install

```bash
npm install @agala-labs/ui
```

Vue `>=3.5.0 <4` is a peer dependency. If the application does not already provide it, install Vue alongside the package.

## Register the plugin

```ts
import { createApp } from 'vue'
import { AgalaUI } from '@agala-labs/ui'
import '@agala-labs/ui/reset.css'
import App from './App.vue'

createApp(App).use(AgalaUI).mount('#app')
```

The optional reset normalizes browser defaults. Import it once from the application entry point, not from individual components.

## Import individual components

```vue
<script setup lang="ts">
import { AgalaButton, AgalaFormField, AgalaInput } from '@agala-labs/ui'
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <AgalaFormField label="Email" html-for="email" required>
    <AgalaInput id="email" v-model="email" type="email" icon-start="mail" />
  </AgalaFormField>
  <AgalaButton type="submit">Continue</AgalaButton>
</template>
```

## Providers

Apps using `modalManager` or `toastManager` must mount one provider of each kind near the root:

```vue
<template>
  <RouterView />
  <AgalaModalProvider />
  <AgalaToastProvider />
</template>
```

Declarative `AgalaModal` usage does not require `AgalaModalProvider`.

## Add charts

Charts are intentionally distributed separately because they depend on ECharts:

```bash
npm install @agala-labs/charts echarts vue-echarts
```

Continue to the [charts overview](/charts/) for live examples.
