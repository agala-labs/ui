<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import {
  DialogContent,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
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
  'after-leave': []
}>()

// Reka owns the dialog focus scope and outside interaction handling. Keep a
// small outer presence state so the public after-leave lifecycle and existing
// visual motion remain unchanged.
const rendered = ref(props.open)
const lockActive = ref(props.open)
let previouslyFocused: HTMLElement | null = null

useBodyScrollLock(lockActive)

function requestClose() {
  if (!props.open) return
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

function handleRootOpenChange(value: boolean) {
  if (value) {
    emit('update:open', true)
    return
  }

  // DialogContent emits this through Reka's dismissable layer. Respect the
  // existing controlled API and emit the legacy close event once.
  requestClose()
}

function handleEscapeKeyDown(event: KeyboardEvent) {
  if (!props.escapeCloses || !props.open) event.preventDefault()
}

function handlePointerDownOutside(event: Event) {
  if (!props.dismissible || !props.open) event.preventDefault()
}

function rememberFocus() {
  if (!previouslyFocused) {
    previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  }
}

onBeforeMount(() => {
  if (props.open) rememberFocus()
})

watch(() => props.open, (open) => {
  if (open) {
    rememberFocus()
    rendered.value = true
    lockActive.value = true
  } else {
    // Keep the Reka content force-mounted until the outer transition has
    // finished so the dialog itself participates in the leave animation.
    rendered.value = false
  }
})

onMounted(() => {
  if (props.open) lockActive.value = true
})

function onAfterLeave() {
  if (props.open) return
  lockActive.value = false
  if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
  previouslyFocused = null
  emit('after-leave')
}
</script>

<template>
  <DialogRoot
    :open="open"
    :modal="true"
    @update:open="handleRootOpenChange"
  >
    <DialogPortal>
      <Transition
        name="modal"
        appear
        @after-leave="onAfterLeave"
      >
        <div
          v-if="rendered"
          class="overlay"
          role="presentation"
        >
          <DialogContent
            :force-mount="true"
            :class="[ 'dialog', sizeMap[size] ].filter(Boolean).join(' ')"
            aria-modal="true"
            :aria-label="title || 'Dialog'"
            @escape-key-down="handleEscapeKeyDown"
            @pointer-down-outside="handlePointerDownOutside"
          >
            <div
              v-if="!hideHeader"
              class="header"
            >
              <DialogTitle
                v-if="title"
                as-child
              >
                <h2 class="title">
                  {{ title }}
                </h2>
              </DialogTitle>
              <span v-else />
              <button
                v-if="dismissible"
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
          </DialogContent>
        </div>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.overlay {
  --agala-modal-enter-duration: 210ms;
  --agala-modal-leave-duration: 160ms;
  --agala-modal-enter-easing: cubic-bezier(0.22, 1, 0.36, 1);
  --agala-modal-leave-easing: cubic-bezier(0.4, 0, 1, 1);
  position: fixed;
  inset: 0;
  z-index: var(--agala-layer-modal, var(--agala-z-modal));
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  padding: 1.5rem;
  background-color: hsl(var(--agala-overlay) / var(--agala-opacity-overlay));
  overscroll-behavior: contain;
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
  box-shadow: var(--agala-shadow-overlay, var(--agala-shadow-lg));
  overflow: hidden;
}

.modal-enter-active {
  transition: background-color var(--agala-modal-enter-duration) var(--agala-modal-enter-easing);
}

.modal-leave-active {
  pointer-events: none;
  transition: background-color var(--agala-modal-leave-duration) var(--agala-modal-leave-easing);
}

.modal-enter-active .dialog {
  transition:
    opacity var(--agala-modal-enter-duration) var(--agala-modal-enter-easing),
    transform var(--agala-modal-enter-duration) var(--agala-modal-enter-easing);
}

.modal-leave-active .dialog {
  transition:
    opacity var(--agala-modal-leave-duration) var(--agala-modal-leave-easing),
    transform var(--agala-modal-leave-duration) var(--agala-modal-leave-easing);
}

.modal-enter-from,
.modal-leave-to {
  background-color: transparent;
}

.modal-enter-from .dialog,
.modal-leave-to .dialog {
  opacity: 0;
  transform: translate3d(0, 4px, 0) scale(0.985);
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

}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .dialog,
  .modal-leave-active .dialog {
    transition-duration: 1ms !important;
  }

  .modal-enter-from .dialog,
  .modal-leave-to .dialog {
    transform: none;
  }
}
</style>
