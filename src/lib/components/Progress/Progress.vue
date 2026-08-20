<script setup lang="ts">
import { computed } from 'vue'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import type { ProgressProps, ProgressSize, ProgressColor } from './types'

const props = withDefaults(defineProps<ProgressProps>(), {
  value: 0,
  variant: 'linear',
  size: 'md',
  color: 'primary',
  indeterminate: false,
})
const linearHeights: Record<ProgressSize, string> = {
  sm: 'var(--agala-progress-linear-height-sm, 0.25rem)',
  md: 'var(--agala-progress-linear-height, 0.5rem)',
  lg: 'var(--agala-progress-linear-height-lg, 0.75rem)',
}
const linearHeight = computed(() => linearHeights[props.size])
const clampedValue = computed(() => Math.min(100, Math.max(0, props.value ?? 0)))
const circularSizes: Record<ProgressSize, number> = { sm: 32, md: 48, lg: 64 }
const circleSize = computed(() => circularSizes[props.size])
const radius = computed(() => (circleSize.value - 4) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const strokeDashoffset = computed(() => props.indeterminate ? 0 : circumference.value * (1 - clampedValue.value / 100))
const colorVar: Record<ProgressColor, string> = {
  primary: 'var(--agala-primary)',
  success: 'var(--agala-success)',
  warning: 'var(--agala-warning)',
  danger: 'var(--agala-danger)',
}
const trackColor = computed(() => `hsl(${colorVar[props.color]})`)
const rekaValue = computed<number | null>(() => props.indeterminate ? null : clampedValue.value)
</script>

<template>
  <ProgressRoot
    v-if="variant === 'linear'"
    :model-value="rekaValue"
    :class="['progressLinear', props.class].filter(Boolean).join(' ')"
    :style="{ height: linearHeight }"
  >
    <ProgressIndicator
      class="progressBar"
      :class="{ progressIndeterminate: indeterminate }"
      :style="{ width: indeterminate ? '40%' : `${clampedValue}%`, backgroundColor: trackColor }"
    />
  </ProgressRoot>

  <ProgressRoot
    v-else
    :model-value="rekaValue"
    as="svg"
    :class="['progressCircular', indeterminate ? 'progressCircularIndeterminate' : undefined, props.class].filter(Boolean).join(' ')"
    :width="circleSize"
    :height="circleSize"
    :viewBox="`0 0 ${circleSize} ${circleSize}`"
  >
    <circle
      class="circleTrack"
      :cx="circleSize / 2"
      :cy="circleSize / 2"
      :r="radius"
      fill="none"
      stroke-width="4"
    />
    <ProgressIndicator
      as="circle"
      class="circleFill"
      :cx="circleSize / 2"
      :cy="circleSize / 2"
      :r="radius"
      fill="none"
      stroke-width="4"
      :stroke="trackColor"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="strokeDashoffset"
      stroke-linecap="round"
    />
  </ProgressRoot>
</template>

<style scoped>
.progressLinear { width: 100%; border-radius: var(--agala-progress-bar-radius, 9999px); background: var(--agala-progress-track-bg, hsl(var(--agala-muted))); overflow: hidden; }
.progressBar { display: block; height: 100%; border-radius: var(--agala-progress-bar-radius, 9999px); transition: width var(--agala-transition-base); }
@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
.progressIndeterminate { animation: indeterminate 1.4s infinite ease-in-out; }
.progressCircular { display: block; transform: rotate(-90deg); }
.circleTrack { stroke: hsl(var(--agala-muted)); }
.circleFill { transition: stroke-dashoffset var(--agala-transition-base); }
@keyframes spin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
.progressCircularIndeterminate { animation: spin 1.2s linear infinite; transform-origin: center; }
@media (prefers-reduced-motion: reduce) { .progressBar, .circleFill, .progressCircularIndeterminate { animation: none; transition: none; } }
</style>
