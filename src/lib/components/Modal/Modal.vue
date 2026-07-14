<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { AgalaIcon } from '../AgalaIcon'
import type { ModalSize } from './types'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  size?: ModalSize
  hideHeader?: boolean
  dismissible?: boolean
  escapeCloses?: boolean
}>(), {
  size: 'md',
  title: undefined,
  hideHeader: false,
  dismissible: true,
  escapeCloses: true,
})

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.open)
let previouslyFocused: HTMLElement | null = null

useBodyScrollLock(isOpen)

function requestClose() {
  emit('update:open', false)
  emit('close')
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'dialogSm',
  md: 'dialogMd',
  lg: 'dialogLg',
  xl: 'dialogXl',
  full: 'dialogFull',
}

function handleBackdropClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const current = e.currentTarget as HTMLElement
  if (target === current && props.dismissible) {
    requestClose()
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.escapeCloses) {
    e.preventDefault()
    requestClose()
    return
  }

  if (e.key !== 'Tab') return
  const focusable = getFocusableElements()
  if (focusable.length === 0) {
    e.preventDefault()
    dialogRef.value?.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.value)) {
    e.preventDefault()
    last?.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first?.focus()
  }
}

function getFocusableElements() {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

watch(() => props.open, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    await nextTick()
    const autofocus = dialogRef.value?.querySelector<HTMLElement>('[autofocus]')
    ;(autofocus || getFocusableElements()[0] || dialogRef.value)?.focus({ preventScroll: true })
    return
  }

  await nextTick()
  if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
  previouslyFocused = null
})
</script>

<template>
  <Teleport
    v-if="open"
    to="body"
  >
    <div
      class="overlay"
      role="presentation"
      @click="handleBackdropClick"
      @keydown="handleKeyDown"
    >
      <div
        ref="dialogRef"
        :class="[ 'dialog', sizeMap[size] ].filter(Boolean).join(' ')"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Dialog'"
        tabindex="-1"
      >
        <div
          v-if="!hideHeader"
          class="header"
        >
          <h2
            v-if="title"
            class="title"
          >
            {{ title }}
          </h2>
          <span v-else />
          <button
            type="button"
            class="closeBtn"
            aria-label="Close dialog"
            @click="requestClose"
          >
            <AgalaIcon
              name="x"
              :size="16"
            />
          </button>
        </div>

        <div class="body">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="footer"
        >
          <slot
            name="footer"
            :close="requestClose"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--agala-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: hsl(var(--agala-overlay) / 0.4);
  animation: fadeIn 180ms ease-out;
  overscroll-behavior: contain;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 3rem);
  max-height: calc(100dvh - 3rem);
  background-color: hsl(var(--agala-card));
  color: hsl(var(--agala-card-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-lg);
  box-shadow: var(--agala-shadow-lg);
  overflow: hidden;
  animation: dialogIn 200ms ease-out;
}

@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.dialogSm { width: 100%; max-width: 24rem; }
.dialogMd { width: 100%; max-width: 32rem; }
.dialogLg { width: 100%; max-width: 40rem; }
.dialogXl { width: 100%; max-width: 48rem; }
.dialogFull {
  width: 100%;
  max-width: calc(100vw - 3rem);
  height: calc(100vh - 3rem);
  height: calc(100dvh - 3rem);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: var(--agala-font-size-lg);
  font-weight: var(--agala-font-weight-semibold);
  line-height: 1.25;
  color: hsl(var(--agala-card-foreground));
}

.closeBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--agala-transition-fast), background-color var(--agala-transition-fast);
}

.closeBtn:hover {
  color: hsl(var(--agala-foreground));
  background-color: hsl(var(--agala-muted));
}

.body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-relaxed);
  color: hsl(var(--agala-card-foreground));
}

.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-top: var(--agala-border-width) solid hsl(var(--agala-border));
  flex-shrink: 0;
}

@media (max-width: 639px) {
  .overlay {
    padding:
      max(0.75rem, env(safe-area-inset-top))
      max(0.75rem, env(safe-area-inset-right))
      max(0.75rem, env(safe-area-inset-bottom))
      max(0.75rem, env(safe-area-inset-left));
  }

  .dialogSm,
  .dialogMd,
  .dialogLg,
  .dialogXl {
    width: 100%;
    max-width: calc(100vw - 1.5rem);
    max-height: calc(100vh - 1.5rem);
    max-height: calc(100dvh - 1.5rem);
  }

  .dialogFull {
    max-width: calc(100vw - 1.5rem);
    height: calc(100vh - 1.5rem);
    height: calc(100dvh - 1.5rem);
  }

  .header {
    padding: 0.75rem 1rem;
  }

  .body {
    padding: 1rem;
  }

  .footer {
    align-items: stretch;
    padding: 0.75rem 1rem;
  }

  .footer > :deep(*) {
    flex: 1 1 auto;
  }

  @keyframes dialogIn {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .overlay,
  .dialog {
    animation-duration: 1ms;
  }
}
</style>
