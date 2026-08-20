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

const cls = computed(() => [
  'alert',
  `alert--${props.variant}`,
  props.title && !props.flat ? 'alert--has-title' : '',
  props.flat ? 'alert--flat' : '',
  props.icon !== false ? 'alert--has-icon' : '',
  slots.action ? 'alert--has-action' : '',
  props.dismissible ? 'alert--dismissible' : '',
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <Transition name="alertShell">
    <div
      v-if="!dismissed"
      class="alertShell"
    >
      <div class="alertShellInner">
        <div
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
              size="md"
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
            aria-label="Dismiss alert"
            @click="dismissed = true"
          >
            <AgalaIcon
              name="x"
              size="md"
            />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* CSS grid trick for smooth height animation — no JS height calc needed */
.alertShell {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--agala-transition-base), opacity var(--agala-transition-base);
}

.alertShellInner {
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

@media (prefers-reduced-motion: reduce) {
  .alertShell {
    transition: opacity var(--agala-transition-fast);
  }
}

.alert {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'content';
  align-items: flex-start;
  gap: var(--agala-alert-row-gap, 0.5rem) var(--agala-alert-gap, 0.625rem);
  padding: var(--agala-alert-padding, 0.75rem 0.875rem);
  border: 0;
  border-radius: var(--agala-alert-radius, var(--agala-radius-md));
  background: var(--agala-alert-bg, hsl(var(--agala-muted) / 0.45));
  box-shadow: var(--agala-alert-shadow, none);
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
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: var(--agala-alert-flat-padding, 0.25rem 0.875rem);
  gap: var(--agala-alert-flat-gap, 0.625rem);
}
.alert--flat .alert__icon {
  width: var(--agala-alert-icon-size, 1.5rem);
  height: var(--agala-alert-icon-size, 1.5rem);
  margin-top: 0;
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
  grid-area: icon;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--agala-alert-icon-size, 1.5rem);
  height: var(--agala-alert-icon-size, 1.5rem);
  margin-top: 0;
  border: 0;
  border-radius: 999px;
  background: hsl(var(--alert-accent) / 0.1);
  color: hsl(var(--alert-accent));
}

.alert__content {
  grid-area: content;
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

.alert__action {
  grid-area: action;
  display: flex;
  align-items: center;
  align-self: flex-start;
  justify-self: end;
  max-width: 100%;
}

.alert--flat .alert__action {
  align-self: center;
}

.alert__dismiss {
  grid-area: dismiss;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0 -0.25rem 0 0;
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

@media (max-width: 639px) {
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
    align-self: start;
    justify-self: start;
  }
}
</style>
