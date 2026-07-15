<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { DrawerProps, DrawerPlacement } from './types'

const props = withDefaults(defineProps<DrawerProps>(), {
  placement: 'right',
  size: '384px',
  dismissible: true,
  escapeCloses: true,
})

const emit = defineEmits<{
  close: []
}>()

const drawerRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.open)
const isScrolled = ref(false)
const canScrollFurther = ref(false)
let previouslyFocused: HTMLElement | null = null
let bodyResizeObserver: ResizeObserver | null = null

const placementClasses = computed(() => {
  const map: Record<DrawerPlacement, string> = {
    left: 'drawer--left',
    right: 'drawer--right',
    top: 'drawer--top',
    bottom: 'drawer--bottom',
  }
  return map[props.placement]
})

const drawerStyle = computed(() => ({
  '--agala-drawer-size': props.size,
}))

useBodyScrollLock(isOpen)

function emitClose() {
  emit('close')
}

function requestDismiss() {
  if (props.dismissible) emitClose()
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) requestDismiss()
}

function getFocusableElements() {
  if (!drawerRef.value) return []
  return Array.from(drawerRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.escapeCloses) {
    event.preventDefault()
    event.stopPropagation()
    emitClose()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = getFocusableElements()
  if (focusable.length === 0) {
    event.preventDefault()
    drawerRef.value?.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === drawerRef.value)) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first?.focus()
  }
}

function updateScrollEdges() {
  const body = bodyRef.value
  if (!body) {
    isScrolled.value = false
    canScrollFurther.value = false
    return
  }

  isScrolled.value = body.scrollTop > 1
  canScrollFurther.value = body.scrollHeight - body.clientHeight - body.scrollTop > 1
}

function observeBodySize() {
  bodyResizeObserver?.disconnect()
  if (!bodyRef.value || typeof ResizeObserver === 'undefined') return
  bodyResizeObserver = new ResizeObserver(updateScrollEdges)
  bodyResizeObserver.observe(bodyRef.value)
}

watch(isOpen, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    await nextTick()
    observeBodySize()
    updateScrollEdges()

    const autofocus = drawerRef.value?.querySelector<HTMLElement>('[autofocus]')
    const firstFocusable = getFocusableElements()[0]
    ;(autofocus || firstFocusable || drawerRef.value)?.focus({ preventScroll: true })
    return
  }

  bodyResizeObserver?.disconnect()
  bodyResizeObserver = null
  isScrolled.value = false
  canScrollFurther.value = false

  await nextTick()
  if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
  previouslyFocused = null
})

onUnmounted(() => bodyResizeObserver?.disconnect())
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="drawer-backdrop"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition
          :name="`drawer-slide-${placement}`"
          appear
        >
          <section
            v-if="open"
            ref="drawerRef"
            class="drawer"
            :class="[placementClasses, props.class]"
            :style="drawerStyle"
            role="dialog"
            aria-modal="true"
            :aria-label="title || 'Drawer'"
            tabindex="-1"
          >
            <header
              v-if="$slots.header || title || dismissible"
              class="drawer__header"
              :class="{ 'drawer__header--elevated': isScrolled }"
            >
              <div class="drawer__heading">
                <slot name="header">
                  <h2
                    v-if="title"
                    class="drawer__title"
                  >
                    {{ title }}
                  </h2>
                </slot>
              </div>
              <button
                v-if="dismissible"
                type="button"
                class="drawer__close"
                aria-label="Close drawer"
                @click="requestDismiss"
              >
                <AgalaIcon
                  name="x"
                  :size="16"
                />
              </button>
            </header>

            <div
              ref="bodyRef"
              class="drawer__body"
              @scroll.passive="updateScrollEdges"
            >
              <slot />
            </div>

            <footer
              v-if="$slots.footer"
              class="drawer__footer"
              :class="{ 'drawer__footer--elevated': canScrollFurther }"
            >
              <slot
                name="footer"
                :close="emitClose"
              />
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--agala-z-modal);
  display: flex;
  background: hsl(var(--agala-overlay) / var(--agala-drawer-overlay-opacity, 0.36));
  overscroll-behavior: contain;
}

.drawer {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  min-height: 0;
  max-width: 100vw;
  max-height: 100vh;
  max-height: 100dvh;
  flex-direction: column;
  overflow: hidden;
  outline: none;
  background: var(--agala-drawer-background, hsl(var(--agala-card)));
  color: var(--agala-drawer-foreground, hsl(var(--agala-card-foreground)));
  box-shadow: var(--agala-drawer-shadow, var(--agala-shadow-lg));
}

.drawer--left,
.drawer--right {
  width: var(--agala-drawer-size);
  max-width: calc(100vw - var(--agala-drawer-viewport-gutter, 0px));
  height: 100%;
}

.drawer--top,
.drawer--bottom {
  width: 100%;
  height: var(--agala-drawer-size);
  max-height: calc(100dvh - var(--agala-drawer-viewport-gutter, 0px));
}

.drawer--left {
  margin-right: auto;
  border-right: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--right {
  margin-left: auto;
  border-left: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--top {
  margin-bottom: auto;
  border-bottom: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--bottom {
  margin-top: auto;
  border-top: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer__header,
.drawer__footer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  gap: 0.75rem;
  padding: var(--agala-drawer-section-padding, 1rem 1.25rem);
  background: inherit;
  transition: box-shadow var(--agala-transition-fast);
}

.drawer__header {
  align-items: center;
  justify-content: space-between;
  padding-top: max(1rem, env(safe-area-inset-top));
}

.drawer__header--elevated {
  box-shadow: 0 1px 0 hsl(var(--agala-border)), 0 8px 18px -16px hsl(var(--agala-overlay) / 0.55);
}

.drawer__heading {
  min-width: 0;
  flex: 1;
}

.drawer__title {
  margin: 0;
  color: hsl(var(--agala-foreground));
  font-size: var(--agala-font-size-lg);
  font-weight: var(--agala-font-weight-semibold);
  line-height: var(--agala-line-height-normal);
  letter-spacing: var(--agala-letter-spacing-tight);
}

.drawer__close {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin: -0.375rem -0.5rem -0.375rem 0;
  padding: 0;
  border: 0;
  border-radius: var(--agala-radius-md);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  transition: background var(--agala-transition-fast), color var(--agala-transition-fast), box-shadow var(--agala-transition-fast);
}

.drawer__close:hover {
  background: hsl(var(--agala-accent));
  color: hsl(var(--agala-foreground));
}

.drawer__close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.35);
}

.drawer__body {
  min-height: 0;
  flex: 1 1 auto;
  padding: var(--agala-drawer-body-padding, 0.25rem 1.25rem 1.25rem);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  color: hsl(var(--agala-card-foreground));
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-relaxed);
}

.drawer__footer {
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.drawer__footer--elevated {
  box-shadow: 0 -1px 0 hsl(var(--agala-border)), 0 -8px 18px -16px hsl(var(--agala-overlay) / 0.55);
}

.drawer--left .drawer__header,
.drawer--left .drawer__body,
.drawer--left .drawer__footer {
  padding-left: max(1.25rem, env(safe-area-inset-left));
}

.drawer--right .drawer__header,
.drawer--right .drawer__body,
.drawer--right .drawer__footer {
  padding-right: max(1.25rem, env(safe-area-inset-right));
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity var(--agala-transition-base);
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-right-enter-active,
.drawer-slide-right-leave-active,
.drawer-slide-left-enter-active,
.drawer-slide-left-leave-active,
.drawer-slide-top-enter-active,
.drawer-slide-top-leave-active,
.drawer-slide-bottom-enter-active,
.drawer-slide-bottom-leave-active {
  transition: transform var(--agala-transition-slow);
}

.drawer-slide-right-enter-from,
.drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.drawer-slide-left-enter-from,
.drawer-slide-left-leave-to {
  transform: translateX(-100%);
}

.drawer-slide-top-enter-from,
.drawer-slide-top-leave-to {
  transform: translateY(-100%);
}

.drawer-slide-bottom-enter-from,
.drawer-slide-bottom-leave-to {
  transform: translateY(100%);
}

@media (max-width: 639px) {
  .drawer {
    --agala-drawer-viewport-gutter: 1rem;
  }

  .drawer__header,
  .drawer__footer {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .drawer__body {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .drawer__footer > :deep(*) {
    flex: 1 1 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer-fade-enter-active,
  .drawer-fade-leave-active,
  .drawer-slide-right-enter-active,
  .drawer-slide-right-leave-active,
  .drawer-slide-left-enter-active,
  .drawer-slide-left-leave-active,
  .drawer-slide-top-enter-active,
  .drawer-slide-top-leave-active,
  .drawer-slide-bottom-enter-active,
  .drawer-slide-bottom-leave-active {
    transition-duration: 1ms;
  }
}
</style>
