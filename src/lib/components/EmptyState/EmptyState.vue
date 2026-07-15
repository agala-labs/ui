<script setup lang="ts">
import type { EmptyStateProps } from './types'

const props = withDefaults(defineProps<EmptyStateProps>(), {
  size: 'default',
})
</script>

<template>
  <div
    :class="['emptyState', `emptyState${props.size === 'compact' ? 'Compact' : 'Default'}`, props.class].filter(Boolean).join(' ')"
  >
    <div v-if="$slots.icon" class="emptyIcon">
      <slot name="icon" />
    </div>
    <div v-else class="emptyIcon emptyIconDefault" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>

    <p class="emptyTitle">{{ title }}</p>
    <p v-if="description" class="emptyDescription">{{ description }}</p>

    <div v-if="$slots.action" class="emptyAction">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--agala-empty-padding, 3rem 1.5rem);
  gap: var(--agala-empty-gap, 0.5rem);
}

.emptyIcon {
  margin-bottom: 0.5rem;
  font-size: var(--agala-empty-icon-size, 2.5rem);
  color: var(--agala-empty-icon-color, hsl(var(--agala-muted-foreground)));
}

.emptyIconDefault {
  opacity: 0.5;
}

.emptyTitle {
  margin: 0;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-empty-title-size, var(--agala-font-size-lg));
  font-weight: var(--agala-empty-title-weight, var(--agala-font-weight-semibold));
  color: hsl(var(--agala-foreground));
}

.emptyDescription {
  margin: 0;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-empty-description-size, var(--agala-font-size-base));
  color: hsl(var(--agala-muted-foreground));
  max-width: min(100%, var(--agala-empty-description-max-width, 36ch));
  line-height: var(--agala-line-height-relaxed);
  overflow-wrap: anywhere;
}

.emptyAction {
  margin-top: 0.75rem;
  max-width: 100%;
}

.emptyStateCompact {
  padding: var(--agala-empty-padding, 1rem);
  gap: var(--agala-empty-gap, 0.5rem);
}

.emptyStateCompact .emptyIcon {
  margin-bottom: 0;
  font-size: var(--agala-empty-icon-size, 1.75rem);
}

.emptyStateCompact .emptyIconDefault svg {
  display: block;
  width: 1em;
  height: 1em;
}

.emptyStateCompact .emptyTitle {
  font-size: var(--agala-empty-title-size, var(--agala-font-size-base));
}

.emptyStateCompact .emptyDescription {
  font-size: var(--agala-empty-description-size, var(--agala-font-size-sm));
}

.emptyStateCompact .emptyAction {
  margin-top: 0.25rem;
}
</style>
