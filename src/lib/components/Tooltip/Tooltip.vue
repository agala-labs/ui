<script setup lang="ts">
import { arrow } from '@floating-ui/vue'
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { useFloatingOverlay } from '../../composables/useFloatingOverlay'
import type { TooltipProps } from './types'

let idCounter = 0

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  delay: 300,
  block: false,
})

idCounter += 1
const tooltipId = `agala-tooltip-${idCounter}`
const rendered = ref(false)
const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)
const requestedPlacement = computed(() => props.placement)
const {
  floatingStyles,
  middlewareData,
  placement: actualPlacement,
} = useFloatingOverlay(wrapperRef, tooltipRef, rendered, {
  placement: requestedPlacement,
  gap: 8,
  middleware: [arrow({ element: arrowRef, padding: 5 })],
})
const arrowStyle = computed(() => ({
  left: middlewareData.value.arrow?.x != null ? `${middlewareData.value.arrow.x}px` : undefined,
  top: middlewareData.value.arrow?.y != null ? `${middlewareData.value.arrow.y}px` : undefined,
}))
let timer: ReturnType<typeof setTimeout> | null = null
let shouldShow = false

function show() {
  shouldShow = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!shouldShow) return
    rendered.value = true
    await nextTick()
    if (shouldShow) visible.value = true
  }, props.delay)
}

function hide() {
  shouldShow = false
  if (timer) { clearTimeout(timer); timer = null }
  visible.value = false
}

function handleAfterLeave() {
  if (!shouldShow) rendered.value = false
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="tooltipWrapper"
    :class="[props.class, block ? 'tooltipWrapper--block' : undefined]"
    :aria-describedby="visible ? tooltipId : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <div
      v-if="rendered"
      ref="tooltipRef"
      class="tooltipShell"
      popover="manual"
      :style="floatingStyles"
    >
      <Transition name="tooltip" @after-leave="handleAfterLeave">
        <div
          v-if="visible"
          :id="tooltipId"
          :class="['tooltip', `tooltip-${actualPlacement}`]"
          role="tooltip"
        >
          {{ content }}
          <span
            ref="arrowRef"
            :class="['arrow', `arrow-${actualPlacement}`]"
            :style="arrowStyle"
            aria-hidden="true"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tooltipWrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tooltipWrapper--block {
  display: flex;
  width: 100%;
}

.tooltipShell {
  position: fixed;
  inset: auto;
  width: max-content;
  height: max-content;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  background: transparent;
  color: inherit;
  pointer-events: none;
  z-index: var(--agala-layer-tooltip, var(--agala-z-dropdown));
}

.tooltip {
  position: relative;
  padding: 0.375rem 0.625rem;
  background-color: hsl(var(--agala-foreground));
  color: hsl(var(--agala-background));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-sm);
  line-height: var(--agala-line-height-normal);
  border-radius: var(--agala-radius-sm);
  width: max-content;
  max-width: min(18rem, calc(100vw - 1rem), var(--agala-floating-available-width, calc(100vw - 1rem)));
  white-space: normal;
  overflow-wrap: anywhere;
  pointer-events: none;
  box-shadow: var(--agala-shadow-popover, var(--agala-shadow-md));
}

/* Placement */
/* Arrow */
.arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.arrow-top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid hsl(var(--agala-foreground));
}

.arrow-bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid hsl(var(--agala-foreground));
}

.arrow-left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid hsl(var(--agala-foreground));
}

.arrow-right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid hsl(var(--agala-foreground));
}

/* Transition */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity var(--agala-transition-fast);
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition-duration: 1ms;
  }
}
</style>
