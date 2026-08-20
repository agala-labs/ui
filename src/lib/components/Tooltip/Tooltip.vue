<script setup lang="ts">
import {
  TooltipContent as RekaTooltipContent,
  TooltipPortal as RekaTooltipPortal,
  TooltipProvider as RekaTooltipProvider,
  TooltipRoot as RekaTooltipRoot,
  TooltipTrigger as RekaTooltipTrigger,
} from 'reka-ui'
import type { TooltipProps } from './types'

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  delay: 300,
  block: false,
})
</script>

<template>
  <RekaTooltipProvider :delay-duration="delay">
    <RekaTooltipRoot v-slot="{ open }">
      <RekaTooltipTrigger
        as-child
        :class="[
          'tooltipWrapper',
          props.class,
          block ? 'tooltipWrapper--block' : undefined,
        ]"
      >
        <slot />
      </RekaTooltipTrigger>

      <RekaTooltipPortal>
        <div class="agala-tooltip-portal">
          <RekaTooltipContent
            :force-mount="true"
            class="tooltipShell"
            :side="placement"
            :side-offset="8"
            :collision-padding="8"
            :aria-label="content"
          >
            <Transition name="tooltip">
              <div
                v-if="open"
                :class="['tooltip', `tooltip-${placement}`]"
                role="tooltip"
              >
                {{ content }}
                <span
                  class="arrow"
                  aria-hidden="true"
                />
              </div>
            </Transition>
          </RekaTooltipContent>
        </div>
      </RekaTooltipPortal>
    </RekaTooltipRoot>
  </RekaTooltipProvider>
</template>

<style scoped>
.tooltipWrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /*
   * The trigger merges these classes onto the slotted content itself (Reka's
   * `as-child`), rather than wrapping it in a separate element like the
   * pre-Reka implementation did. Without this, an ancestor flex/grid
   * container with the default `align-items: stretch` visibly stretches the
   * slotted element (e.g. a button) to fill the cross axis, instead of the
   * invisible wrapper stretching while the button kept its natural size.
   */
  align-self: flex-start;
}

.tooltipWrapper--block {
  display: flex;
  width: 100%;
}

/*
 * Reka teleports this content via its own internal <Teleport>, which Vue's
 * compiler can't see, so the scoped data-v-* attribute never lands on it.
 * These rules are marked :global() and scoped to .agala-tooltip-portal (a
 * static class on the portal wrapper) so they still apply to the portaled
 * DOM without colliding with unrelated classes elsewhere on the page.
 */
:global(.agala-tooltip-portal .tooltipShell) {
  position: relative;
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

:global(.agala-tooltip-portal .tooltip) {
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
:global(.agala-tooltip-portal .arrow) {
  position: absolute;
  width: 0;
  height: 0;
}

:global(.agala-tooltip-portal .tooltipShell[data-side='top'] .arrow),
:global(.agala-tooltip-portal .tooltip-top .arrow) {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid hsl(var(--agala-foreground));
}

:global(.agala-tooltip-portal .tooltipShell[data-side='bottom'] .arrow),
:global(.agala-tooltip-portal .tooltip-bottom .arrow) {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid hsl(var(--agala-foreground));
}

:global(.agala-tooltip-portal .tooltipShell[data-side='left'] .arrow),
:global(.agala-tooltip-portal .tooltip-left .arrow) {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid hsl(var(--agala-foreground));
}

:global(.agala-tooltip-portal .tooltipShell[data-side='right'] .arrow),
:global(.agala-tooltip-portal .tooltip-right .arrow) {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid hsl(var(--agala-foreground));
}

/* Transition */
:global(.agala-tooltip-portal .tooltip-enter-active),
:global(.agala-tooltip-portal .tooltip-leave-active) {
  transition: opacity var(--agala-transition-fast);
}
:global(.agala-tooltip-portal .tooltip-enter-from),
:global(.agala-tooltip-portal .tooltip-leave-to) {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  :global(.agala-tooltip-portal .tooltip-enter-active),
  :global(.agala-tooltip-portal .tooltip-leave-active) {
    transition-duration: 1ms;
  }
}
</style>
