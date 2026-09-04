<script setup lang="ts">
import { computed, ref } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { IconName } from '../AgalaIcon/types'
import type { AlertProps, AlertVariant } from './types'

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'info',
  role: 'status',
  dismissible: false,
  flat: false,
  icon: undefined,
  dismissLabel: 'Dismiss notification',
})

const emit = defineEmits<{
  dismiss: []
}>()

const slots = defineSlots<{
  default?: () => unknown
  action?: () => unknown
}>()

const dismissed = ref(false)

const iconMap: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
}

const classes = computed(() => [
  'alert',
  `alert--${props.variant}`,
  props.title ? 'alert--has-title' : '',
  props.flat ? 'alert--flat' : '',
  props.icon !== false ? 'alert--has-icon' : '',
  slots.action ? 'alert--has-action' : '',
  props.dismissible ? 'alert--dismissible' : '',
  props.class,
].filter(Boolean))

function dismiss() {
  dismissed.value = true
  emit('dismiss')
}
</script>

<template>
  <Transition name="alertShell">
    <div
      v-if="!dismissed"
      class="alertShell"
    >
      <div class="alertShell__inner">
        <div
          :class="classes"
          :role="props.role"
          :aria-label="props.ariaLabel"
          aria-atomic="true"
        >
          <span
            v-if="props.icon !== false"
            class="alert__icon"
            aria-hidden="true"
          >
            <AgalaIcon
              :name="(props.icon as IconName) || iconMap[props.variant]"
              size="sm"
            />
          </span>

          <div class="alert__content">
            <h4
              v-if="props.title"
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

          <div
            v-if="$slots.action"
            class="alert__action"
          >
            <slot name="action" />
          </div>

          <button
            v-if="props.dismissible"
            type="button"
            class="alert__dismiss"
            :aria-label="props.dismissLabel"
            @click="dismiss"
          >
            <AgalaIcon
              name="x"
              size="sm"
            />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.alertShell {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows var(--agala-transition-base),
    opacity var(--agala-transition-fast);
}

.alertShell__inner {
  min-height: 0;
  overflow: hidden;
}

.alertShell-leave-to,
.alertShell-enter-from {
  grid-template-rows: 0fr;
  opacity: 0;
}

.alertShell-leave-active,
.alertShell-enter-active {
  overflow: hidden;
}

.alert {
  --alert-accent: var(--agala-info);

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'content';
  align-items: center;
  gap: var(--agala-alert-row-gap, var(--agala-space-2)) var(--agala-alert-gap, var(--agala-space-3));
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: var(--agala-alert-padding, 0.8125rem 0.875rem);
  border: var(--agala-alert-border, var(--agala-border-width) solid hsl(var(--agala-border) / 0.42));
  border-radius: var(--agala-alert-radius, var(--agala-radius-lg));
  background: var(--agala-alert-bg, hsl(var(--agala-muted) / 0.42));
  box-shadow: var(--agala-alert-shadow, var(--agala-shadow-xs));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
}

.alert--has-icon {
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: 'icon content';
}

.alert--has-action {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'content action';
}

.alert--dismissible {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'content dismiss';
}

.alert--has-action.alert--dismissible {
  grid-template-columns: minmax(0, 1fr) auto auto;
  grid-template-areas: 'content action dismiss';
}

.alert--has-icon.alert--has-action {
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: 'icon content action';
}

.alert--has-icon.alert--dismissible {
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas: 'icon content dismiss';
}

.alert--has-icon.alert--has-action.alert--dismissible {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  grid-template-areas: 'icon content action dismiss';
}

.alert--info {
  --alert-accent: var(--agala-info);
}

.alert--success {
  --alert-accent: var(--agala-success);
}

.alert--warning {
  --alert-accent: var(--agala-warning);
}

.alert--danger {
  --alert-accent: var(--agala-danger);
}

.alert__icon {
  grid-area: icon;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: start;
  width: var(--agala-alert-icon-size, 1.75rem);
  height: var(--agala-alert-icon-size, 1.75rem);
  margin-top: 0.0625rem;
  border: var(--agala-border-width) solid hsl(var(--alert-accent) / 0.12);
  border-radius: var(--agala-radius-full);
  background: hsl(var(--alert-accent) / 0.09);
  color: hsl(var(--alert-accent));
}

.alert__content {
  grid-area: content;
  display: flex;
  flex-direction: column;
  gap: var(--agala-alert-content-gap, var(--agala-space-1));
  min-width: 0;
}

.alert__title {
  margin: 0;
  color: hsl(var(--agala-foreground));
  font-size: var(--agala-alert-title-size, var(--agala-font-size-base));
  font-weight: var(--agala-alert-title-weight, var(--agala-font-weight-semibold));
  line-height: var(--agala-leading-tight);
  letter-spacing: var(--agala-letter-spacing-tight);
  overflow-wrap: anywhere;
}

.alert__body {
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-alert-body-size, 0.8125rem);
  font-weight: var(--agala-font-weight-normal);
  line-height: var(--agala-leading-normal);
  overflow-wrap: anywhere;
}

.alert:not(.alert--has-title) .alert__body {
  color: hsl(var(--agala-foreground) / 0.84);
}

.alert__action {
  grid-area: action;
  display: flex;
  align-items: center;
  justify-self: end;
  max-width: 100%;
}

.alert__dismiss {
  grid-area: dismiss;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin: 0 -0.25rem 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  opacity: 0.76;
  transition:
    opacity var(--agala-transition-fast),
    background-color var(--agala-transition-fast),
    color var(--agala-transition-fast);
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

.alert--flat {
  gap: var(--agala-alert-flat-gap, var(--agala-space-2));
  padding: var(--agala-alert-flat-padding, var(--agala-space-1) 0);
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.alert--flat .alert__icon {
  align-self: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

@media (max-width: 639px) {
  .alert {
    align-items: start;
    padding: var(--agala-alert-mobile-padding, var(--agala-space-3));
  }

  .alert--has-action {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'content'
      'action';
  }

  .alert--has-action.alert--dismissible {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'content dismiss'
      'action action';
  }

  .alert--has-icon.alert--has-action {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'icon content'
      '. action';
  }

  .alert--has-icon.alert--has-action.alert--dismissible {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'icon content dismiss'
      '. action action';
  }

  .alert__action {
    justify-self: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .alertShell {
    transition: opacity var(--agala-transition-fast);
  }
}
</style>
