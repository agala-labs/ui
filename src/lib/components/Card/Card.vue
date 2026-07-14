<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { CardProps, CardPadding } from './types'

const props = withDefaults(defineProps<CardProps>(), {
  padding: 'md',
  headerVariant: 'default',
})
const slots = useSlots()

const paddingMap: Record<CardPadding, string> = {
  none: 'padNone',
  sm:   'padSm',
  md:   'padMd',
  lg:   'padLg',
}

const semanticTokens = ['primary', 'secondary', 'muted', 'danger', 'warning', 'success'] as const

const resolvedAccentColor = computed(() => {
  if (!props.accent) return undefined
  const color = props.accentColor ?? 'primary'
  if ((semanticTokens as readonly string[]).includes(color)) {
    return `hsl(var(--agala-${color}))`
  }
  return color
})

const cls = computed(() => [
  'card',
  slots.header ? 'card--has-header' : undefined,
  slots.footer ? 'card--has-footer' : undefined,
  props.accent ? `card--accent-${props.accent}` : undefined,
  props.class,
].filter(Boolean).join(' '))

const headerCls = computed(() => [
  'cardHeader',
  props.headerVariant === 'compact' ? 'cardHeaderCompact' : undefined,
].filter(Boolean).join(' '))

const bodyCls = computed(() => [
  'cardBody',
  paddingMap[props.padding],
].join(' '))

const cardStyle = computed(() => {
  if (!props.accent || !resolvedAccentColor.value) {
    return {}
  }

  return { '--agala-card-accent-color': resolvedAccentColor.value }
})
</script>

<template>
  <div
    :class="cls"
    :style="cardStyle"
  >
    <div
      v-if="$slots.header"
      :class="headerCls"
    >
      <slot name="header" />
    </div>

    <div :class="bodyCls">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="cardFooter"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--agala-card-bg, hsl(var(--agala-card)));
  color: hsl(var(--agala-card-foreground));
  border: var(--agala-card-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  border-radius: var(--agala-card-radius, var(--agala-radius-lg));
  box-shadow: var(--agala-card-shadow, none);
  display: flex;
  flex-direction: column;
  padding: var(--agala-card-padding, 0);
}

.card::before {
  content: '';
  position: absolute;
  z-index: 1;
  display: none;
  border-radius: 999px;
  background: var(--agala-card-accent-color, hsl(var(--agala-primary)));
  pointer-events: none;
}

.card--accent-top::before,
.card--accent-bottom::before {
  display: block;
  left: var(--agala-card-accent-offset, 1.25rem);
  width: var(--agala-card-accent-length, 2.5rem);
  height: var(--agala-card-accent-width, 3px);
}

.card--accent-top::before { top: 0; }
.card--accent-bottom::before { bottom: 0; }

.card--accent-left::before,
.card--accent-right::before {
  display: block;
  top: var(--agala-card-accent-offset, 1.25rem);
  width: var(--agala-card-accent-width, 3px);
  height: var(--agala-card-accent-length, 2.5rem);
}

.card--accent-left::before { left: 0; }
.card--accent-right::before { right: 0; }

.cardHeader {
  padding: var(--agala-card-header-padding, 1.125rem 1.25rem 0);
  border-bottom: var(--agala-card-header-border, 0);
  font-weight: var(--agala-card-header-weight, var(--agala-font-weight-semibold));
  font-size: var(--agala-card-header-size, var(--agala-font-size-base));
  line-height: var(--agala-line-height-normal);
  color: hsl(var(--agala-card-foreground));
}

.cardFooter {
  padding: var(--agala-card-footer-padding, 0 1.25rem 1.25rem);
  border-top: var(--agala-card-footer-border, 0);
  display: flex;
  align-items: center;
  justify-content: var(--agala-card-footer-justify, flex-end);
  gap: 0.75rem;
}

.cardBody {
  padding: var(--agala-card-body-padding, 0);
}

/* Padding variants applied to body */
.padNone { padding: 0; }
.padSm   { padding: 0.75rem; }
.padMd   { padding: 1.25rem; }
.padLg   { padding: 1.75rem; }

.card--has-header .padSm { padding-top: 0.5rem; }
.card--has-header .padMd { padding-top: 0.75rem; }
.card--has-header .padLg { padding-top: 1rem; }

.card--has-footer .padSm { padding-bottom: 0.625rem; }
.card--has-footer .padMd { padding-bottom: 0.75rem; }
.card--has-footer .padLg { padding-bottom: 1rem; }

.cardHeaderCompact {
  padding: var(--agala-card-compact-header-padding, 0.875rem 1rem 0);
  font-size: var(--agala-card-compact-header-size, var(--agala-font-size-sm));
  font-weight: var(--agala-font-weight-semibold);
  letter-spacing: normal;
  color: hsl(var(--agala-muted-foreground));
}
</style>
