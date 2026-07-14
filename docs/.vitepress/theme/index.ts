import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { defineClientComponent } from 'vitepress'
import { AgalaUI } from '@ui'
import DemoFrame from '../../components/DemoFrame.vue'
import ComponentDoc from '../../components/ComponentDoc.vue'
import ChartGallery from '../../components/ChartGallery.vue'
import ThemeControls from '../../components/ThemeControls.vue'
import DocsLayout from '../../components/DocsLayout.vue'
import '../../../src/lib/themes/main.css'
import '../../../src/lib/themes/smaltt.css'
import '../../../src/lib/themes/kervo.css'
import './custom.css'

const BaseChart = defineClientComponent(() =>
  import('@charts').then(module => module.BaseChart),
)

export default {
  extends: DefaultTheme,
  Layout: DocsLayout,
  enhanceApp({ app }) {
    app.use(AgalaUI)
    app.component('BaseChart', BaseChart)
    app.component('DemoFrame', DemoFrame)
    app.component('ComponentDoc', ComponentDoc)
    app.component('ChartGallery', ChartGallery)
    app.component('ThemeControls', ThemeControls)
  },
} satisfies Theme
