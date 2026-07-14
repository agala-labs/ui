<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import type { TooltipProps } from './types'

let idCounter = 0

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  delay: 300,
  block: false,
})

idCounter += 1
const tooltipId = `agala-tooltip-${idCounter}`
const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const actualPlacement = ref(props.placement)
let timer: ReturnType<typeof setTimeout> | null = null

function show() {
  timer = setTimeout(async () => {
    visible.value = true
    await nextTick()
    positionTooltip()
  }, props.delay)
}

function hide() {
  if (timer) { clearTimeout(timer); timer = null }
  visible.value = false
}

function positionTooltip() {
  const trigger = wrapperRef.value
  const tooltip = tooltipRef.value
  if (!trigger || !tooltip) return

  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = window.innerHeight
  const margin = 8
  const gap = 8
  let placement = props.placement

  const fits = {
    top: triggerRect.top - tooltipRect.height - gap >= margin,
    bottom: triggerRect.bottom + tooltipRect.height + gap <= viewportHeight - margin,
    left: triggerRect.left - tooltipRect.width - gap >= margin,
    right: triggerRect.right + tooltipRect.width + gap <= viewportWidth - margin,
  }

  if (!fits[placement]) {
    if (placement === 'top' && fits.bottom) placement = 'bottom'
    else if (placement === 'bottom' && fits.top) placement = 'top'
    else if (placement === 'left' && fits.right) placement = 'right'
    else if (placement === 'right' && fits.left) placement = 'left'
  }

  let left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
  let top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2

  if (placement === 'top') top = triggerRect.top - tooltipRect.height - gap
  if (placement === 'bottom') top = triggerRect.bottom + gap
  if (placement === 'left') left = triggerRect.left - tooltipRect.width - gap
  if (placement === 'right') left = triggerRect.right + gap

  left = Math.min(Math.max(margin, left), viewportWidth - tooltipRect.width - margin)
  top = Math.min(Math.max(margin, top), viewportHeight - tooltipRect.height - margin)

  actualPlacement.value = placement
  tooltipStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  }
}

watch(visible, (open) => {
  if (open) {
    window.addEventListener('resize', positionTooltip)
    window.addEventListener('scroll', positionTooltip, true)
  } else {
    window.removeEventListener('resize', positionTooltip)
    window.removeEventListener('scroll', positionTooltip, true)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  window.removeEventListener('resize', positionTooltip)
  window.removeEventListener('scroll', positionTooltip, true)
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

    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible"
          :id="tooltipId"
          ref="tooltipRef"
          :class="['tooltip', `tooltip-${actualPlacement}`]"
          :style="tooltipStyle"
          role="tooltip"
        >
          {{ content }}
          <span
            :class="['arrow', `arrow-${actualPlacement}`]"
            aria-hidden="true"
          />
        </div>
      </Transition>
    </Teleport>
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

.tooltip {
  position: fixed;
  z-index: var(--agala-z-dropdown);
  padding: 0.375rem 0.625rem;
  background-color: hsl(var(--agala-foreground));
  color: hsl(var(--agala-background));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-sm);
  line-height: var(--agala-line-height-normal);
  border-radius: var(--agala-radius-sm);
  width: max-content;
  max-width: min(18rem, calc(100vw - 1rem));
  white-space: normal;
  overflow-wrap: anywhere;
  pointer-events: none;
  box-shadow: var(--agala-shadow-md);
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
