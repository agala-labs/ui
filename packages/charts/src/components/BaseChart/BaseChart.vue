<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import { useChartTheme } from '../../composables/useChartTheme'

// Register once at module level
use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  CanvasRenderer,
])

type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'gauge'

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

interface Props {
  type: ChartType
  labels?: string[]
  datasets: Dataset[]
  height?: number
  stacked?: boolean
  indicators?: Indicator[]
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 280,
  stacked: false,
  max: 100,
  labels: () => [],
  indicators: () => [],
})

const { getBaseOption, getColorPalette } = useChartTheme()
const option = shallowRef<Record<string, unknown>>({})
const rootRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

function buildOption() {
  const palette = getColorPalette()
  const compact = containerWidth.value > 0 && containerWidth.value <= 480

  if (props.type === 'pie') {
    const base = getBaseOption(props.type) as Record<string, unknown>
    const data = (props.datasets[0]?.data as number[]).map((value, i) => ({
      value,
      name: props.labels[i] || `Item ${i + 1}`,
      itemStyle: { color: palette[i % palette.length] },
    })) || []
    option.value = {
      ...base,
      series: [
        {
          type: 'pie',
          radius: compact ? ['30%', '52%'] : ['35%', '60%'],
          center: compact ? ['50%', '45%'] : ['50%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderWidth: 2 },
          label: {
            show: !compact,
            formatter: '{b}: {d}%',
            overflow: 'truncate',
          },
          emphasis: {
            scale: false,
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
          },
          data: data.map(d => ({
            ...d,
            emphasis: { itemStyle: { color: d.itemStyle.color } },
          })),
        },
      ],
    }
    return
  }

  if (props.type === 'scatter') {
    const base = getBaseOption(props.type) as Record<string, unknown>
    option.value = {
      ...base,
      series: props.datasets.map((ds, i) => {
        const color = ds.color || palette[i % palette.length]
        return {
          type: 'scatter',
          name: ds.name,
          data: ds.data as number[][],
          symbolSize: 10,
          color,
          itemStyle: { color },
          emphasis: {
            itemStyle: { color },
            label: {
              show: true,
              formatter: (p: { data: number[] }) => `(${p.data[0]}, ${p.data[1]})`,
              position: 'top' as const,
            },
          },
        }
      }),
    }
    return
  }

  if (props.type === 'radar') {
    const base = getBaseOption(props.type) as Record<string, unknown>
    const indicators = props.indicators.length
      ? props.indicators
      : props.labels.map(l => ({ name: l, max: 100 }))

    option.value = {
      ...base,
      radar: {
        indicator: indicators,
        shape: 'polygon' as const,
        radius: compact ? '52%' : '65%',
        splitNumber: 4,
        axisName: {
          color: (base.textStyle as Record<string, string>)?.color,
          fontSize: compact ? 10 : 12,
        },
        splitLine: {
          lineStyle: { color: (base as Record<string, unknown>).splitLineColor as string || 'rgba(0,0,0,0.1)' },
        },
        splitArea: {
          areaStyle: { color: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.04)'] },
        },
        axisLine: {
          lineStyle: { color: (base as Record<string, unknown>).axisLineColor as string || 'rgba(0,0,0,0.1)' },
        },
      },
      series: props.datasets.map((ds, i) => {
        const color = ds.color || palette[i % palette.length]
        return {
          type: 'radar',
          name: ds.name,
          data: [ds.data as number[]],
          symbol: 'circle' as const,
          symbolSize: 6,
          color,
          lineStyle: { width: 2, color },
          areaStyle: { color, opacity: 0.12 },
          itemStyle: { color },
          emphasis: {
            lineStyle: { width: 2, color },
            itemStyle: { color },
            areaStyle: { color, opacity: 0.12 },
          },
        }
      }),
    }
    return
  }

  if (props.type === 'gauge') {
    const base = getBaseOption(props.type) as Record<string, unknown>
    const val = (props.datasets[0]?.data as number[])[0] || 0

    option.value = {
      ...base,
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          radius: compact ? '70%' : '80%',
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: props.max,
          progress: { show: true, width: 12 },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.5, palette[1] || '#22c55e'],
                [0.8, palette[2] || '#f59e0b'],
                [1, palette[3] || '#ef4444'],
              ],
            },
          },
          axisTick: { show: false },
          splitLine: { length: 8, lineStyle: { width: 2 } },
          axisLabel: { distance: compact ? 10 : 16, fontSize: compact ? 10 : 12 },
          pointer: { width: 4 },
          detail: {
            valueAnimation: true,
            formatter: `{value}`,
            fontSize: compact ? 20 : 24,
            color: (base.textStyle as Record<string, string>)?.color,
            offsetCenter: ['0%', '40%'],
          },
          title: {
            show: true,
            offsetCenter: ['0%', '70%'],
            fontSize: compact ? 12 : 14,
            color: (base.textStyle as Record<string, string>)?.color,
          },
          data: [{ value: val, name: props.datasets[0]?.name || '' }],
        },
      ],
    }
    return
  }

  /* ─── Line / Bar (including stacked variants) ─── */
  const base = getBaseOption(props.type) as Record<string, unknown>
  option.value = {
    ...base,
    xAxis: {
      ...((base.xAxis as Record<string, unknown>) || {}),
      data: props.labels,
      axisLabel: {
        ...((((base.xAxis as Record<string, unknown>)?.axisLabel as Record<string, unknown>) || {})),
        hideOverlap: true,
        fontSize: compact ? 10 : 12,
      },
    },
    grid: {
      ...((base.grid as Record<string, unknown>) || {}),
      left: compact ? 8 : '3%',
      right: compact ? 8 : '4%',
      bottom: compact ? 8 : '3%',
      containLabel: true,
    },
    series: props.datasets.map((ds, i) => {
      const color = ds.color || palette[i % palette.length]
      const isStacked = props.stacked
      const hasArea = ds.areaStyle || (isStacked && props.type === 'line')
      const baseSeries: Record<string, unknown> = {
        type: props.type,
        name: ds.name,
        data: ds.data,
        color,
        itemStyle: { color },
      }

      if (props.type === 'line') {
        baseSeries.smooth = ds.smooth ?? true
        baseSeries.symbol = 'circle'
        baseSeries.symbolSize = 6
        baseSeries.lineStyle = { width: 2, color }
        if (hasArea) {
          baseSeries.areaStyle = { color, opacity: 0.12 }
        }
        baseSeries.emphasis = {
          lineStyle: { width: 2, color },
          itemStyle: { color },
          ...(hasArea ? { areaStyle: { color, opacity: 0.12 } } : {}),
        }
      }

      if (props.type === 'bar') {
        baseSeries.barWidth = '60%'
        baseSeries.emphasis = { itemStyle: { color } }
      }

      if (isStacked) {
        baseSeries.stack = 'total'
      }

      return baseSeries
    }),
  }
}

buildOption()

watch(() => props, buildOption, { deep: true })

/* ─── Theme reactivity ─── */
let mo: MutationObserver | null = null
let mq: MediaQueryList | null = null

function onThemeChange() {
  buildOption()
}

onMounted(() => {
  if (rootRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width || 0)
      if (width === containerWidth.value) return
      containerWidth.value = width
      buildOption()
    })
    resizeObserver.observe(rootRef.value)
  }

  mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        onThemeChange()
        break
      }
      if (m.type === 'childList' || m.type === 'attributes') {
        onThemeChange()
        break
      }
    }
  })
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'style', 'class'],
    subtree: false,
  })

  mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', onThemeChange)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  mo?.disconnect()
  mq?.removeEventListener('change', onThemeChange)
})
</script>

<template>
  <div
    ref="rootRef"
    class="base-chart"
    :style="{ height: `${props.height}px` }"
  >
    <VChart
      :option="option"
      autoresize
      style="width: 100%; height: 100%"
    />
  </div>
</template>

<style scoped>
.base-chart {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
</style>
