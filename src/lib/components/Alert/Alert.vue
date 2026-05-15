<script setup lang="ts">
import { ref, computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { IconName } from '../AgalaIcon/types'
import type { AlertProps, AlertVariant } from './types'

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'info',
  dismissible: false,
  flat: false,
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
  <div v-if="!dismissed" role="alert" aria-atomic="true" :class="cls">
    <span v-if="icon !== false" class="alert__icon" aria-hidden="true">
      <AgalaIcon :name="(icon as IconName) || iconMap[props.variant]" :size="16" />
    </span>
    <div class="alert__content">
      <h4 v-if="props.title && !props.flat" class="alert__title">{{ props.title }}</h4>
      <div v-if="$slots.default" class="alert__body">
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
      <AgalaIcon name="x" :size="16" />
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--agala-alert-gap, 0.75rem);
  padding: var(--agala-alert-padding, 0.75rem 1rem);
  border-radius: var(--agala-alert-radius, calc(var(--agala-radius) - 2px));
  border-left: var(--agala-alert-border-width, 4px) solid hsl(var(--alert-accent));
  background: hsl(var(--alert-accent) / 0.1);
  font-family: var(--agala-font-sans);
}

/* Variants — only set the accent variable */
.alert--info     { --alert-accent: var(--agala-primary); }
.alert--success  { --alert-accent: var(--agala-success); }
.alert--warning  { --alert-accent: var(--agala-warning); }
.alert--danger   { --alert-accent: var(--agala-danger); }

/* When title is present, align items to top */
.alert--has-title {
  align-items: flex-start;
}

/* Flat variant — no background, no border, minimal icon+text */
.alert--flat {
  background: transparent;
  border-left: none;
  padding: var(--agala-alert-flat-padding, 0.25rem 0);
  gap: var(--agala-alert-flat-gap, 0.5rem);
}
.alert--flat .alert__icon {
  margin-top: 0;
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
  width: var(--agala-alert-icon-size, 1rem);
  height: var(--agala-alert-icon-size, 1rem);
  margin-top: 0.125rem;
  color: hsl(var(--alert-accent));
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
  color: hsl(var(--alert-accent));
  overflow-wrap: break-word;
}

.alert__body {
  font-size: var(--agala-alert-body-size, var(--agala-font-size-sm));
  line-height: var(--agala-line-height-relaxed);
  color: hsl(var(--agala-foreground));
  overflow-wrap: break-word;
}

.alert__dismiss {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  opacity: 0.5;
  transition: opacity var(--agala-transition-fast), background var(--agala-transition-fast);
}

.alert__dismiss:hover {
  opacity: 1;
  background: hsl(var(--agala-muted-foreground) / 0.1);
}

.alert__dismiss:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}
</style>
