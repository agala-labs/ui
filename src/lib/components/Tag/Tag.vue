<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { CSSProperties } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { TagProps } from './types'

const props = withDefaults(defineProps<TagProps>(), {
  variant: 'default',
  size: 'md',
  removable: false,
  interactive: false,
  color: '',
})

const emit = defineEmits<{
  remove: []
  click: []
}>()

const colorStyle = computed(() => {
  if (!props.color) return undefined
  return {
    '--agala-tag-custom-color': props.color,
  } as CSSProperties
})

const isInteractive = computed(() => props.interactive && !props.removable)
const rootElement = computed(() => isInteractive.value ? 'button' : 'span')

const cls = computed(() => [
  'tag',
  `tag--${props.variant}`,
  `tag--${props.size}`,
  props.removable && 'tag--removable',
  isInteractive.value && 'tag--interactive',
  props.color && 'tag--custom',
  props.disabled && 'tag--disabled',
  props.class,
].filter(Boolean).join(' '))

function onRemove(e: MouseEvent) {
  e.stopPropagation()
  if (!props.disabled) emit('remove')
}

function onClick() {
  if (isInteractive.value && !props.disabled) emit('click')
}

if (import.meta.env.DEV) {
  watchEffect(() => {
    if (props.interactive && props.removable) {
      console.warn('[AgalaTag] `interactive` is ignored when `removable` is true. The remove button remains the only action.')
    }
  })
}
</script>

<template>
  <component
    :is="rootElement"
    :class="cls"
    :style="colorStyle"
    :type="isInteractive ? 'button' : undefined"
    :disabled="isInteractive ? disabled : undefined"
    :aria-disabled="!isInteractive && disabled ? 'true' : undefined"
    @click="onClick"
  >
    <slot>
      <span class="tag__label">{{ label }}</span>
    </slot>

    <button
      v-if="removable"
      type="button"
      class="tag__remove"
      :disabled="disabled"
      :aria-label="`Remove ${label || 'tag'}`"
      @click="onRemove"
    >
      <AgalaIcon name="x" size="xs" />
    </button>
  </component>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--agala-tag-gap, 0.375rem);
  max-width: 100%;
  padding: var(--agala-tag-padding, 0.1875rem 0.5rem);
  border: 0;
  appearance: none;
  border-radius: var(--agala-tag-radius, 99px);
  font-size: var(--agala-tag-font-size, 0.6875rem);
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  cursor: default;
  transition: background var(--agala-transition-fast), color var(--agala-transition-fast), box-shadow var(--agala-transition-fast);
  user-select: none;
  vertical-align: middle;
}

.tag--sm {
  height: var(--agala-tag-height, 1.375rem);
  padding: 0 0.5rem;
  font-size: var(--agala-tag-font-size-sm, 0.6875rem);
  gap: 0.25rem;
}

.tag--md {
  height: var(--agala-tag-height, 1.625rem);
  padding: 0 0.625rem;
  font-size: var(--agala-tag-font-size, 0.75rem);
  gap: 0.375rem;
}

.tag--default {
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-muted-foreground));
}

.tag--primary {
  background: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
}

.tag--secondary {
  background: hsl(var(--agala-secondary));
  color: hsl(var(--agala-secondary-foreground));
}

.tag--success {
  background: hsl(var(--agala-success));
  color: hsl(var(--agala-success-foreground));
}

.tag--warning {
  background: hsl(var(--agala-warning));
  color: hsl(var(--agala-warning-foreground));
}

.tag--danger {
  background: hsl(var(--agala-danger));
  color: hsl(var(--agala-danger-foreground));
}

.tag--outline {
  background: transparent;
  color: hsl(var(--agala-foreground));
  box-shadow: inset 0 0 0 1px hsl(var(--agala-border));
}

.tag--interactive {
  cursor: pointer;
}

.tag--interactive:hover:not(.tag--disabled) {
  opacity: 0.86;
}

.tag--interactive:focus-visible,
.tag__remove:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}

.tag--interactive.tag--outline:hover:not(.tag--disabled) {
  background: hsl(var(--agala-accent));
}

.tag--custom {
  background-color: transparent;
  background-color: color-mix(in srgb, var(--agala-tag-custom-color) 12%, transparent);
  color: var(--agala-tag-custom-color);
}

.tag__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag--removable {
  padding-right: 0.25rem;
}

.tag--removable.tag--sm {
  padding-right: 0.125rem;
}

.tag__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: currentColor;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--agala-transition-fast), background var(--agala-transition-fast);
}

.tag__remove:hover {
  opacity: 1;
  background: rgb(0 0 0 / 0.1);
}

.tag--disabled {
  opacity: var(--agala-opacity-disabled);
  cursor: not-allowed;
}

.tag--disabled:not(button) {
  pointer-events: none;
}
</style>
