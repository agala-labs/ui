<script setup lang="ts">
import Toast from './Toast.vue'
import { toastManager } from './ToastManager'
</script>

<template>
  <Teleport to="body">
    <div class="toastContainer" aria-label="Notifications">
      <Toast
        v-for="toast in toastManager.state.toasts"
        :key="toast.id"
        :toast="toast"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.toastContainer {
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
}

.toastContainer > :deep(*) {
  pointer-events: auto;
}
</style>
