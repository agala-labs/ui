<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { BadgeVariant, BadgeSize } from './types'

const props = withDefaults(defineProps<{
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  color?: string
  class?: string
}>(), {
  variant: 'default',
  size: 'md',
  dot: false,
  color: '',
})

const variantMap: Record<BadgeVariant, string> = {
  default:   'badgeDefault',
  secondary: 'badgeSecondary',
  outline:   'badgeOutline',
  subtle:    'badgeSubtle',
  success:   'badgeSuccess',
  warning:   'badgeWarning',
  danger:    'badgeDanger',
}

const sizeMap: Record<BadgeSize, string> = {
  sm: 'badgeSm',
  md: 'badgeMd',
}

const colorStyle = computed(() => {
  if (!props.color) return undefined
  return {
    '--agala-badge-custom-color': props.color,
  } as CSSProperties
})

const cls = computed(() => [
  'badge',
  variantMap[props.variant],
  sizeMap[props.size],
  props.color && 'badgeCustom',
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <span :class="cls" :style="colorStyle">
    <span v-if="dot" class="dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  box-sizing: border-box;
  min-height: var(--agala-badge-height, 1.5rem);
  border-radius: var(--agala-badge-radius, 9999px);
  border: var(--agala-border-width) solid transparent;
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  white-space: nowrap;
  line-height: 1.2;
  padding: var(--agala-badge-padding, 0.1875rem 0.5rem);
  font-size: var(--agala-badge-font-size, 0.75rem);
  vertical-align: middle;
}

.badgeSm {
  min-height: var(--agala-badge-height-sm, 1.25rem);
  padding: var(--agala-badge-padding-sm, 0.125rem 0.375rem);
  font-size: var(--agala-badge-font-size-sm, 0.6875rem);
}

.badgeMd {
  min-height: var(--agala-badge-height, 1.5rem);
  padding: var(--agala-badge-padding, 0.1875rem 0.5rem);
  font-size: var(--agala-badge-font-size, 0.75rem);
}

/* Dot */
.dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background-color: var(--agala-badge-dot-color, currentColor);
  opacity: 0.8;
  flex-shrink: 0;
}

/* Variants */
.badgeDefault {
  background-color: hsl(var(--agala-muted));
  color: hsl(var(--agala-foreground));
}

.badgeSecondary {
  background-color: hsl(var(--agala-secondary));
  color: hsl(var(--agala-secondary-foreground));
}

.badgeOutline {
  background-color: transparent;
  border-color: hsl(var(--agala-border));
  color: hsl(var(--agala-foreground));
}

.badgeSuccess {
  --agala-badge-dot-color: hsl(var(--agala-success));
  background-color: hsl(var(--agala-success) / 0.12);
  color: hsl(var(--agala-foreground));
}

.badgeWarning {
  --agala-badge-dot-color: hsl(var(--agala-warning));
  background-color: hsl(var(--agala-warning) / 0.14);
  color: hsl(var(--agala-foreground));
}

.badgeDanger {
  --agala-badge-dot-color: hsl(var(--agala-danger));
  background-color: hsl(var(--agala-danger) / 0.11);
  color: hsl(var(--agala-foreground));
}

.badgeSubtle {
  --agala-badge-dot-color: hsl(var(--agala-primary));
  background-color: hsl(var(--agala-primary) / 0.08);
  color: hsl(var(--agala-foreground));
}

.badgeCustom {
  background-color: transparent;
  background-color: color-mix(in srgb, var(--agala-badge-custom-color) 12%, transparent);
  color: var(--agala-badge-custom-color);
}
</style>
