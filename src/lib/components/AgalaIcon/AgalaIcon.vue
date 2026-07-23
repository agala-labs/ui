<script setup lang="ts">
import { computed } from 'vue'
import { resolveIcon, resolveIconName, warnUnknownIcon } from './registry'
import type { AgalaIconProps, IconSize } from './types'

const props = withDefaults(defineProps<AgalaIconProps>(), {
  size: 'md',
  strokeWidth: undefined,
  motion: 'none',
  active: false,
})

const resolvedIcon = computed(() => {
  const icon = resolveIcon(props.name)
  if (!icon && import.meta.env.DEV) warnUnknownIcon(props.name)
  return icon
})
const resolvedName = computed(() => resolveIconName(props.name))

const namedSizes: Record<IconSize, string> = {
  xs: 'var(--agala-icon-size-xs, 0.75rem)',
  sm: 'var(--agala-icon-size-sm, 0.875rem)',
  md: 'var(--agala-icon-size-md, 1rem)',
  lg: 'var(--agala-icon-size-lg, 1.25rem)',
  xl: 'var(--agala-icon-size-xl, 1.5rem)',
}

const iconSize = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return namedSizes[props.size as IconSize] ?? props.size
})

const iconStyle = computed(() => ({
  '--agala-icon-render-size': iconSize.value,
  '--agala-icon-render-stroke': props.strokeWidth ?? 'var(--agala-icon-stroke-width, 2)',
}))
</script>

<template>
  <component
    :is="resolvedIcon"
    v-if="resolvedIcon"
    class="agala-icon"
    :class="{ 'agala-icon--active': active }"
    :data-icon="resolvedName"
    :data-motion="motion"
    :style="iconStyle"
    aria-hidden="true"
    focusable="false"
  />
</template>

<style scoped>
.agala-icon {
  display: inline-block;
  width: var(--agala-icon-render-size);
  height: var(--agala-icon-render-size);
  flex: 0 0 auto;
  stroke-width: var(--agala-icon-render-stroke);
  transform-origin: center;
  transition:
    transform var(--agala-motion-duration-fast, 120ms) var(--agala-motion-easing-out, ease-out),
    opacity var(--agala-motion-duration-fast, 120ms) var(--agala-motion-easing-out);
}

.agala-icon[data-icon='spinner'],
.agala-icon--active[data-motion='active'][data-icon='refresh'] {
  animation: agala-icon-spin var(--agala-icon-motion-spin-duration, 800ms) linear infinite;
}

.agala-icon--active[data-motion='active'][data-icon='chevron-down'],
.agala-icon--active[data-motion='active'][data-icon='chevron-up'] {
  transform: rotate(var(--agala-icon-motion-rotation, 180deg));
}

.agala-icon--active[data-motion='active'][data-icon='chevron-right'] {
  transform: rotate(90deg);
}

.agala-icon--active[data-motion='active'][data-icon='chevron-left'] {
  transform: rotate(-90deg);
}

@media (hover: hover) and (pointer: fine) {
  :is(button, a, [role='button']):hover .agala-icon[data-motion='hover'][data-icon='bell'] {
    animation: agala-icon-ring 420ms var(--agala-motion-easing-standard, ease-in-out);
  }

  :is(button, a, [role='button']):hover .agala-icon[data-motion='hover'][data-icon='external-link'] {
    transform: translate(var(--agala-icon-motion-distance, 1px), calc(var(--agala-icon-motion-distance, 1px) * -1));
  }

  :is(button, a, [role='button']):hover .agala-icon[data-motion='hover'][data-icon='trash'] {
    transform: translateY(calc(var(--agala-icon-motion-distance, 1px) * -1));
  }
}

@keyframes agala-icon-spin {
  to { transform: rotate(360deg); }
}

@keyframes agala-icon-ring {
  25% { transform: rotate(-10deg); }
  55% { transform: rotate(8deg); }
  80% { transform: rotate(-4deg); }
}

@media (prefers-reduced-motion: reduce) {
  .agala-icon {
    transition-duration: 0.01ms;
  }

  .agala-icon[data-icon='spinner'],
  .agala-icon--active[data-motion='active'],
  :is(button, a, [role='button']):hover .agala-icon[data-motion='hover'] {
    animation: none !important;
    transform: none !important;
  }
}
</style>
