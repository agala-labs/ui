<script setup lang="ts">
import { ref, computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { IconName } from '../AgalaIcon/types'
import type { AlertProps, AlertVariant } from './types'

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'info',
  dismissible: false,
  flat: false,
  icon: undefined,
})

const dismissed = ref(false)

const iconMap: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
}

const cls = computed(() => [
  'alert',
  `alert--${props.variant}`,
  props.title && !props.flat ? 'alert--has-title' : '',
  props.flat ? 'alert--flat' : '',
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div
    v-if="!dismissed"
    role="alert"
    aria-atomic="true"
    :class="cls"
  >
    <span
      v-if="props.icon !== false"
      class="alert__icon"
      aria-hidden="true"
    >
      <AgalaIcon
        :name="(props.icon as IconName) || iconMap[props.variant]"
        :size="16"
      />
    </span>
    <div class="alert__content">
      <h4
        v-if="props.title && !props.flat"
        class="alert__title"
      >
        {{ props.title }}
      </h4>
      <div
        v-if="$slots.default"
        class="alert__body"
      >
        <slot />
      </div>
    </div>
    <button
      v-if="props.dismissible"
      type="button"
      class="alert__dismiss"
      aria-label="Dismiss alert"
      @click="dismissed = true"
    >
      <AgalaIcon
        name="x"
        :size="16"
      />
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--agala-alert-gap, 0.75rem);
  padding: var(--agala-alert-padding, 0.875rem 1rem);
  border: var(--agala-alert-border-width, var(--agala-border-width)) solid var(--agala-alert-border-color, hsl(var(--alert-accent) / 0.28));
  border-radius: var(--agala-alert-radius, var(--agala-radius-md));
  background: var(--agala-alert-bg, hsl(var(--agala-card)));
  box-shadow: var(--agala-alert-shadow, none);
  font-family: var(--agala-font-sans);
}

/* Variants set a semantic pair for the compact status tile. */
.alert--info {
  --alert-accent: var(--agala-primary);
  --alert-accent-foreground: var(--agala-primary-foreground);
}
.alert--success {
  --alert-accent: var(--agala-success);
  --alert-accent-foreground: var(--agala-success-foreground);
}
.alert--warning {
  --alert-accent: var(--agala-warning);
  --alert-accent-foreground: var(--agala-warning-foreground);
}
.alert--danger {
  --alert-accent: var(--agala-danger);
  --alert-accent-foreground: var(--agala-danger-foreground);
}

/* Flat variant — no surface, just a compact status cue and message. */
.alert--flat {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: var(--agala-alert-flat-padding, 0.25rem 0);
  gap: var(--agala-alert-flat-gap, 0.5rem);
}
.alert--flat .alert__icon {
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: hsl(var(--alert-accent));
}
.alert--flat .alert__body {
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
}

.alert__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--agala-alert-icon-size, 1.75rem);
  height: var(--agala-alert-icon-size, 1.75rem);
  margin-top: 0;
  border: 0;
  border-radius: var(--agala-alert-icon-radius, var(--agala-radius-md));
  background: hsl(var(--alert-accent));
  color: hsl(var(--alert-accent-foreground));
}

.alert__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.alert__title {
  margin: 0;
  font-weight: var(--agala-alert-title-weight, var(--agala-font-weight-semibold));
  font-size: var(--agala-alert-title-size, var(--agala-font-size-base));
  line-height: var(--agala-line-height-normal);
  color: hsl(var(--agala-foreground));
  overflow-wrap: break-word;
}

.alert__body {
  font-size: var(--agala-alert-body-size, var(--agala-font-size-sm));
  line-height: var(--agala-line-height-relaxed);
  color: hsl(var(--agala-foreground));
  overflow-wrap: break-word;
}

.alert--has-title .alert__body {
  color: hsl(var(--agala-muted-foreground));
}

.alert__dismiss {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0.125rem -0.25rem 0 0;
  padding: 0;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  opacity: 0.72;
  transition: opacity var(--agala-transition-fast), background var(--agala-transition-fast), color var(--agala-transition-fast);
}

.alert__dismiss:hover {
  opacity: 1;
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-foreground));
}

.alert__dismiss:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}
</style>
