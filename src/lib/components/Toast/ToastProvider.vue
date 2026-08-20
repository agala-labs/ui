<script setup lang="ts">
import {
  ToastProvider as RekaToastProvider,
  ToastRoot as RekaToastRoot,
  ToastViewport as RekaToastViewport,
} from 'reka-ui'
import Toast from './Toast.vue'
import { toastManager } from './ToastManager'

function handleToastOpenChange(id: string, open: boolean) {
  if (!open) toastManager.dismiss(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="agala-toast-portal">
      <RekaToastProvider
        :duration="0"
        :disable-swipe="true"
        label="Notifications"
      >
        <RekaToastViewport
          class="toastContainer"
          aria-label="Notifications"
        >
          <RekaToastRoot
            v-for="toast in toastManager.state.toasts"
            :key="toast.id"
            :open="true"
            :duration="0"
            as-child
            @update:open="handleToastOpenChange(toast.id, $event)"
          >
            <Toast :toast="toast" />
          </RekaToastRoot>
        </RekaToastViewport>
      </RekaToastProvider>
    </div>
  </Teleport>
</template>

<style scoped>
/*
 * `RekaToastViewport` sits behind two nested Reka components, and Vue's
 * scoped data-v-* attribute doesn't propagate through that chain, so this
 * rule is marked :global() and scoped to .agala-toast-portal (a static
 * class on the portal wrapper) to still apply without colliding with
 * unrelated classes elsewhere on the page.
 */
:global(.agala-toast-portal .toastContainer) {
  position: fixed;
  right: max(0.75rem, env(safe-area-inset-right));
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  width: min(24rem, calc(100vw - 1.5rem));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: var(--agala-layer-toast, var(--agala-z-modal));
  pointer-events: none;
  align-items: flex-end;
  margin: 0;
  padding: 0;
  list-style: none;
}

:global(.agala-toast-portal .toastContainer > *) {
  pointer-events: auto;
}
</style>
