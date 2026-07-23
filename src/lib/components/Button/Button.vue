<script setup lang="ts">
import { computed } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import type { ButtonVariant, ButtonSize, ButtonType } from './types'
import type { IconName } from '../AgalaIcon/types'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  loading?: boolean
  block?: boolean
  icon?: string
  disabled?: boolean
  class?: string
}>(), {
  variant: 'default',
  size: 'md',
  type: 'button',
  loading: false,
  block: false,
  icon: '',
  disabled: false,
  class: '',
})

const variantMap: Record<ButtonVariant, string> = {
  default: 'btnDefault',
  secondary: 'btnSecondary',
  outline: 'btnOutline',
  ghost: 'btnGhost',
  danger: 'btnDanger',
  link: 'btnLink',
}

const sizeMap: Record<ButtonSize, string> = {
  sm: 'btnSm',
  md: 'btnMd',
  lg: 'btnLg',
  icon: 'btnIcon',
}

const cls = computed(() => [
  'btn',
  variantMap[props.variant],
  sizeMap[props.size],
  props.block ? 'btnBlock' : undefined,
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <button
    :type="type"
    :class="cls"
    :disabled="disabled || loading"
    :data-loading="loading"
  >
    <AgalaIcon v-if="loading" name="spinner" size="sm" />
    <AgalaIcon
      v-else-if="icon"
      :name="icon as IconName"
      size="sm"
    />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--agala-btn-gap, 0.5rem);
  white-space: nowrap;
  border: var(--agala-border-width) solid transparent;
  border-radius: var(--agala-btn-radius, calc(var(--agala-radius) - 2px));
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  font-size: var(--agala-btn-font-size, var(--agala-font-size-base));
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--agala-transition-fast),
    border-color var(--agala-transition-fast),
    color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
  user-select: none;
}

.btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.btn:disabled,
.btn[data-loading='true'] {
  pointer-events: none;
  opacity: var(--agala-opacity-disabled);
}

/* Sizes */
.btnSm {
  height: var(--agala-btn-height, 2rem);
  padding: var(--agala-btn-padding-sm, 0 0.75rem);
  font-size: var(--agala-font-size-sm);
  border-radius: var(--agala-radius-sm);
}

.btnMd {
  height: var(--agala-btn-height, 2.25rem);
  padding: var(--agala-btn-padding-md, 0 1rem);
}

.btnLg {
  height: var(--agala-btn-height, 2.5rem);
  padding: var(--agala-btn-padding-lg, 0 1.5rem);
  font-size: var(--agala-font-size-lg);
}

.btnIcon {
  height: 2.25rem;
  width: 2.25rem;
  padding: 0;
}

.btnBlock {
  width: 100%;
}

/* Variants */
.btnDefault {
  background-color: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
}
.btnDefault:hover:not(:disabled):not([data-loading='true']) {
  background-color: hsl(var(--agala-primary) / 0.9);
}

.btnSecondary {
  background-color: hsl(var(--agala-secondary));
  color: hsl(var(--agala-secondary-foreground));
}
.btnSecondary:hover:not(:disabled):not([data-loading='true']) {
  background-color: hsl(var(--agala-secondary) / 0.8);
}

.btnOutline {
  background-color: transparent;
  border-color: hsl(var(--agala-input));
  color: hsl(var(--agala-foreground));
}
.btnOutline:hover:not(:disabled):not([data-loading='true']) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.btnGhost {
  background-color: transparent;
  border-color: transparent;
  color: hsl(var(--agala-foreground));
}
.btnGhost:hover:not(:disabled):not([data-loading='true']) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.btnDanger {
  background-color: hsl(var(--agala-danger));
  color: hsl(var(--agala-danger-foreground));
}
.btnDanger:hover:not(:disabled):not([data-loading='true']) {
  background-color: hsl(var(--agala-danger) / 0.9);
}

.btnLink {
  background-color: transparent;
  border-color: transparent;
  color: hsl(var(--agala-primary));
  text-decoration: underline;
  text-underline-offset: 4px;
  padding-left: 0;
  padding-right: 0;
  height: auto;
}
.btnLink:hover:not(:disabled):not([data-loading='true']) {
  text-decoration: none;
}
</style>
