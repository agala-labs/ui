import { defineComponent, h, mergeProps } from 'vue'

type SvgChild = readonly [tag: 'path' | 'circle' | 'rect' | 'line', attributes: Record<string, string | number>]

function createIcon(displayName: string, children: readonly SvgChild[]) {
  return defineComponent({
    name: displayName,
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () => h('svg', mergeProps({
        xmlns: 'http://www.w3.org/2000/svg',
        width: 24,
        height: 24,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }, attrs), children.map(([tag, attributes]) => h(tag, attributes)))
    },
  })
}

export const ToothIcon = createIcon('AgalaToothIcon', [
  ['path', { d: 'M12 4.2c-2-1.8-5.8-1.6-7.1.8-1.6 3 .6 6.1 1.5 8.5.8 2.1.7 6.3 2.8 6.3 1.6 0 1.3-4.7 2.8-4.7s1.2 4.7 2.8 4.7c2.1 0 2-4.2 2.8-6.3.9-2.4 3.1-5.5 1.5-8.5C17.8 2.6 14 2.4 12 4.2Z' }],
  ['path', { d: 'M9.5 5.3c1.5.7 3.5.7 5 0' }],
])

export const OdontogramIcon = createIcon('AgalaOdontogramIcon', [
  ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 4 }],
  ['path', { d: 'M12 7.2c-1.1-1-3.2-.9-3.9.4-.8 1.7.4 3.4.9 4.7.4 1.2.4 3.5 1.5 3.5.9 0 .7-2.6 1.5-2.6s.6 2.6 1.5 2.6c1.1 0 1.1-2.3 1.5-3.5.5-1.3 1.7-3 0.9-4.7-.7-1.3-2.8-1.4-3.9-.4Z' }],
])

export const DiagnosisLinkIcon = createIcon('AgalaDiagnosisLinkIcon', [
  ['path', { d: 'M9.5 14.5 8 16a3.5 3.5 0 0 1-5-5l2-2a3.5 3.5 0 0 1 5 0' }],
  ['path', { d: 'm14.5 9.5 1.5-1.5a3.5 3.5 0 0 1 5 5l-2 2a3.5 3.5 0 0 1-5 0' }],
  ['path', { d: 'm8.5 15.5 7-7' }],
  ['path', { d: 'M12 3v3M10.5 4.5h3' }],
])

export const HealthCoverageIcon = createIcon('AgalaHealthCoverageIcon', [
  ['path', { d: 'M12 3 5 6v5c0 4.6 2.8 7.8 7 10 4.2-2.2 7-5.4 7-10V6l-7-3Z' }],
  ['path', { d: 'M12 8v6M9 11h6' }],
])

export const CashRegisterIcon = createIcon('AgalaCashRegisterIcon', [
  ['path', { d: 'M6 8V4h8l3 4' }],
  ['rect', { x: 3, y: 8, width: 18, height: 12, rx: 2 }],
  ['path', { d: 'M7 12h4M7 16h2M13 12h4M13 16h4' }],
])

export const StockLocationIcon = createIcon('AgalaStockLocationIcon', [
  ['path', { d: 'm4 7 8-4 8 4-8 4-8-4Z' }],
  ['path', { d: 'M4 7v8l8 4 2.5-1.3M12 11v4' }],
  ['path', { d: 'M20 13.5c0 2.6-3.5 5.5-3.5 5.5S13 16.1 13 13.5a3.5 3.5 0 1 1 7 0Z' }],
  ['circle', { cx: 16.5, cy: 13.5, r: 1 }],
])

export const PriceCompareIcon = createIcon('AgalaPriceCompareIcon', [
  ['path', { d: 'M4 7h13M14 4l3 3-3 3' }],
  ['path', { d: 'M20 17H7M10 14l-3 3 3 3' }],
  ['circle', { cx: 6.5, cy: 11.5, r: 2.5 }],
  ['path', { d: 'M6.5 10v3M5.6 10.7h1.2a.7.7 0 0 1 0 1.4H6.2a.7.7 0 0 0 0 1.4h1.2' }],
])
