import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

const componentGroups = [
  {
    text: 'Forms',
    items: [
      ['Button', 'button'], ['Input', 'input'], ['Form Field', 'form-field'],
      ['Select', 'select'], ['Creatable Select', 'creatable-select'], ['Date Picker', 'date-picker'],
      ['Color Picker', 'color-picker'], ['Checkbox', 'checkbox'], ['Radio Group', 'radio-group'],
      ['Textarea', 'textarea'], ['Markdown Editor', 'markdown-editor'], ['Toggle', 'toggle'],
      ['File Upload', 'file-upload'], ['Segmented Control', 'segmented-control'],
    ],
  },
  {
    text: 'Feedback & overlays',
    items: [
      ['Alert', 'alert'], ['Badge', 'badge'], ['Drawer', 'drawer'], ['Modal', 'modal'],
      ['Toast', 'toast'], ['Tooltip', 'tooltip'], ['Progress', 'progress'],
      ['Skeleton', 'skeleton'], ['Empty State', 'empty-state'], ['Dev Environment Banner', 'dev-env-banner'],
    ],
  },
  {
    text: 'Navigation & data',
    items: [
      ['Accordion', 'accordion'], ['Dropdown Menu', 'dropdown-menu'], ['Navbar', 'navbar'],
      ['Pagination', 'pagination'], ['Sidebar', 'sidebar'], ['Table', 'table'],
      ['Tabs', 'tabs'], ['Calendar', 'calendar'], ['List Group', 'list-group'],
    ],
  },
  {
    text: 'Layout & display',
    items: [
      ['Avatar', 'avatar'], ['Card', 'card'], ['Center', 'center'], ['Divider', 'divider'],
      ['Stack', 'stack'], ['Spacer', 'spacer'], ['Stat', 'stat'], ['Tag', 'tag'], ['Icon', 'icon'],
    ],
  },
].map(group => ({
  ...group,
  collapsed: true,
  items: group.items.map(([text, slug]) => ({ text, link: `/components/${slug}` })),
}))

export default defineConfig({
  title: 'Agala Labs UI',
  description: 'Accessible Vue 3 components and charts from Agala Labs, built on semantic design tokens.',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/brand/agala-labs-icon.png' }],
    ['script', {}, "try{const theme=localStorage.getItem('agala-docs-theme')||'main';if(theme==='default')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=theme}catch{document.documentElement.dataset.theme='main'}"],
  ],
  themeConfig: {
    appearance: false,
    logo: '/brand/agala-labs-icon.png',
    search: { provider: 'local' },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'Charts', link: '/charts/' },
      { text: 'Playground', link: '/playground' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/el-agala/ui' }],
    sidebar: {
      '/guide/': [
        { text: 'Introduction', items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Accessibility', link: '/guide/accessibility' },
          { text: 'Utilities', link: '/guide/utilities' },
        ] },
      ],
      '/components/': [
        { text: 'Overview', link: '/components/' },
        ...componentGroups,
      ],
      '/charts/': [
        { text: 'Charts', items: [
          { text: 'Overview & gallery', link: '/charts/' },
          { text: 'BaseChart API', link: '/charts/base-chart' },
          { text: 'Theming', link: '/charts/theming' },
          { text: 'useChartTheme', link: '/charts/use-chart-theme' },
        ] },
      ],
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Agala Labs UI',
    },
  },
  vite: {
    publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
    resolve: {
      alias: {
        '@ui': fileURLToPath(new URL('../../src/lib/index.ts', import.meta.url)),
        '@charts': fileURLToPath(new URL('../../packages/charts/src/index.ts', import.meta.url)),
      },
    },
  },
})
