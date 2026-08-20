<script setup lang="ts">
import { computed, nextTick, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  DrawerContent,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
} from 'reka-ui'
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

// Reka owns the focus scope, escape handling and outside interaction layer.
// The local presence state keeps the existing edge transition and close
// lifecycle while a controlled drawer prop changes immediately.
const drawerRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.open)
const rendered = ref(props.open)
const lockActive = ref(false)
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

const swipeDirection = computed(() => {
  const map: Record<DrawerPlacement, 'left' | 'right' | 'up' | 'down'> = {
    left: 'left',
    right: 'right',
    top: 'up',
    bottom: 'down',
  }
  return map[props.placement]
})

useBodyScrollLock(lockActive)

function emitClose() {
  if (props.open) emit('close')
}

function handleRootOpenChange(value: boolean) {
  if (!value) emitClose()
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

async function focusFallback() {
  await nextTick()
  const drawer = drawerRef.value
  if (!drawer || drawer.contains(document.activeElement)) return
  const autofocus = drawer.querySelector<HTMLElement>('[autofocus]')
  const firstFocusable = drawer.querySelector<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  ;(autofocus || firstFocusable || drawer)?.focus({ preventScroll: true })
}

onBeforeMount(() => {
  if (props.open) rememberFocus()
})

watch(isOpen, async (open) => {
  if (open) {
    rememberFocus()
    rendered.value = true
    lockActive.value = true
    await nextTick()
    observeBodySize()
    updateScrollEdges()
    // Reka normally focuses the first candidate. This only covers a rapid
    // controlled reopen while the force-mounted content is still present.
    await focusFallback()
    return
  }

  bodyResizeObserver?.disconnect()
  bodyResizeObserver = null
  rendered.value = false
})

onMounted(async () => {
  if (!props.open) return
  lockActive.value = true
  observeBodySize()
  updateScrollEdges()
  await focusFallback()
})

function onAfterLeave() {
  if (props.open) return
  lockActive.value = false
  isScrolled.value = false
  canScrollFurther.value = false
  if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
  previouslyFocused = null
}

onUnmounted(() => bodyResizeObserver?.disconnect())
</script>

<template>
  <DrawerRoot
    :open="open"
    modal="trap-focus"
    :swipe-direction="swipeDirection"
    @update:open="handleRootOpenChange"
  >
    <DrawerPortal>
      <Transition
        name="drawer"
        appear
        @after-leave="onAfterLeave"
      >
        <div
          v-if="rendered"
          class="drawer-backdrop"
          role="presentation"
        >
          <DrawerContent
            :force-mount="true"
            as-child
            aria-modal="true"
            :aria-label="title || 'Drawer'"
            @escape-key-down="handleEscapeKeyDown"
            @pointer-down-outside="handlePointerDownOutside"
          >
            <section
              ref="drawerRef"
              class="drawer"
              :class="[placementClasses, props.class]"
              :style="drawerStyle"
              role="dialog"
              tabindex="-1"
            >
              <header
                v-if="$slots.header || title || dismissible"
                class="drawer__header"
                :class="{ 'drawer__header--elevated': isScrolled }"
              >
                <div class="drawer__heading">
                  <slot name="header">
                    <DrawerTitle
                      v-if="title"
                      as-child
                    >
                      <h2 class="drawer__title">
                        {{ title }}
                      </h2>
                    </DrawerTitle>
                  </slot>
                </div>
                <button
                  v-if="dismissible"
                  type="button"
                  class="drawer__close"
                  aria-label="Close drawer"
                  @click="emitClose"
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
          </DrawerContent>
        </div>
      </Transition>
    </DrawerPortal>
  </DrawerRoot>
</template>

<style scoped>
.drawer-backdrop {
  --agala-drawer-enter-duration: 230ms;
  --agala-drawer-leave-duration: 180ms;
  --agala-drawer-enter-easing: cubic-bezier(0.22, 1, 0.36, 1);
  --agala-drawer-leave-easing: cubic-bezier(0.4, 0, 1, 1);
  position: fixed;
  inset: 0;
  z-index: var(--agala-layer-drawer, var(--agala-z-modal));
  display: flex;
  pointer-events: auto;
  background: hsl(var(--agala-overlay) / var(--agala-drawer-overlay-opacity, var(--agala-opacity-overlay)));
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
  --agala-drawer-closed-transform: translate3d(-100%, 0, 0);
  margin-right: auto;
  border-right: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--right {
  --agala-drawer-closed-transform: translate3d(100%, 0, 0);
  margin-left: auto;
  border-left: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--top {
  --agala-drawer-closed-transform: translate3d(0, -100%, 0);
  margin-bottom: auto;
  border-bottom: var(--agala-drawer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.drawer--bottom {
  --agala-drawer-closed-transform: translate3d(0, 100%, 0);
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

.drawer-enter-active {
  transition: background-color var(--agala-drawer-enter-duration) var(--agala-drawer-enter-easing);
}

.drawer-leave-active {
  pointer-events: none;
  transition: background-color var(--agala-drawer-leave-duration) var(--agala-drawer-leave-easing);
}

.drawer-enter-active .drawer {
  transition: transform var(--agala-drawer-enter-duration) var(--agala-drawer-enter-easing);
}

.drawer-leave-active .drawer {
  transition: transform var(--agala-drawer-leave-duration) var(--agala-drawer-leave-easing);
}

.drawer-enter-from,
.drawer-leave-to {
  background-color: transparent;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: var(--agala-drawer-closed-transform);
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
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .drawer,
  .drawer-leave-active .drawer {
    transition-duration: 1ms !important;
  }

  .drawer-enter-from .drawer,
  .drawer-leave-to .drawer {
    transform: none;
  }
}
</style>
