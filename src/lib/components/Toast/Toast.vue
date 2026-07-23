<script setup lang="ts">
import { AgalaIcon } from '../AgalaIcon'
import { toastManager } from './ToastManager'
import type { ToastItem, ToastVariant } from './types'
import type { IconName } from '../AgalaIcon/types'

defineProps<{ toast: ToastItem }>()

const variantMap: Record<ToastVariant, string> = {
  default: 'toastDefault',
  success: 'toastSuccess',
  warning: 'toastWarning',
  danger:  'toastDanger',
}

const iconMap: Record<ToastVariant, IconName> = {
  default: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger:  'alert-circle',
}
</script>

<template>
  <div
    :class="['toast', variantMap[toast.variant], toast.leaving ? 'toastLeaving' : undefined].filter(Boolean).join(' ')"
    :role="toast.variant === 'danger' ? 'alert' : 'status'"
    aria-live="polite"
    aria-atomic="true"
  >
    <AgalaIcon :name="iconMap[toast.variant]" size="md" class="toastIcon" />
    <span class="toastMessage">{{ toast.message }}</span>
    <button
      v-if="toast.action"
      type="button"
      class="toastAction"
      @click="toast.action!.onClick"
    >
      {{ toast.action.label }}
    </button>
    <button
      type="button"
      class="toastClose"
      aria-label="Dismiss"
      @click="toastManager.dismiss(toast.id)"
    >
      <AgalaIcon name="x" size="sm" />
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: min(24rem, calc(100vw - 1.5rem));
  min-width: 0;
  max-width: 24rem;
  padding: 0.75rem 1rem;
  border-radius: var(--agala-radius);
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  background-color: hsl(var(--agala-card));
  color: hsl(var(--agala-card-foreground));
  box-shadow: var(--agala-shadow-lg);
  animation: toastIn 0.25s ease;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
}

.toastLeaving {
  animation: toastOut 0.3s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(1rem); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateX(0); max-height: 5rem; margin-bottom: 0.5rem; }
  to   { opacity: 0; transform: translateX(1rem); max-height: 0; margin-bottom: 0; }
}

.toastIcon { flex-shrink: 0; }

.toastMessage {
  min-width: 0;
  flex: 1;
  overflow-wrap: anywhere;
  line-height: var(--agala-line-height-normal);
}

.toastAction {
  flex-shrink: 0;
  background: none;
  border: var(--agala-border-width) solid currentColor;
  border-radius: var(--agala-radius-sm);
  color: inherit;
  font-family: inherit;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity var(--agala-transition-fast);
}
.toastAction:hover { opacity: 1; }

.toastClose {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.5;
  padding: 0.125rem;
  border-radius: var(--agala-radius-sm);
  transition: opacity var(--agala-transition-fast);
}
.toastClose:hover { opacity: 1; }

.toastAction:focus-visible,
.toastClose:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.35);
}

/* Variants — icon color only */
.toastDefault .toastIcon { color: hsl(var(--agala-primary)); }
.toastSuccess .toastIcon { color: hsl(var(--agala-success)); }
.toastWarning .toastIcon { color: hsl(var(--agala-warning)); }
.toastDanger  .toastIcon { color: hsl(var(--agala-danger)); }

@media (max-width: 359px) {
  .toast {
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0.75rem;
  }

  .toastAction {
    margin-left: 1.625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast,
  .toastLeaving {
    animation-duration: 1ms;
  }
}
</style>
