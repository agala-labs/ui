<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DropdownMenuContent as RekaDropdownMenuContent,
  DropdownMenuItem as RekaDropdownMenuItem,
  DropdownMenuPortal as RekaDropdownMenuPortal,
  DropdownMenuRoot as RekaDropdownMenuRoot,
  DropdownMenuSeparator as RekaDropdownMenuSeparator,
  DropdownMenuTrigger as RekaDropdownMenuTrigger,
} from 'reka-ui'
import { AgalaIcon } from '../AgalaIcon'
import type { DropdownMenuItem, DropdownMenuProps } from './types'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  placement: 'bottom-end',
})

const isOpen = ref(false)
const contentAlign = computed(() => props.placement === 'bottom-start' ? 'start' : 'end')

function executeItem(item: DropdownMenuItem) {
  if (item.disabled || item.separator) return
  item.onClick?.()
  isOpen.value = false
}
</script>

<template>
  <div
    class="wrapper"
    :class="props.class"
  >
    <RekaDropdownMenuRoot
      :open="isOpen"
      @update:open="isOpen = $event"
    >
      <RekaDropdownMenuTrigger
        as-child
        class="trigger"
      >
        <slot name="trigger" />
      </RekaDropdownMenuTrigger>

      <RekaDropdownMenuPortal>
        <div class="agala-dropdown-menu-portal">
          <RekaDropdownMenuContent
            class="menu"
            side="bottom"
            :align="contentAlign"
            :side-offset="4"
            :collision-padding="8"
            :loop="false"
          >
            <template
              v-for="(item, idx) in items"
              :key="idx"
            >
              <RekaDropdownMenuSeparator
                v-if="item.separator"
                class="separator"
              />
              <RekaDropdownMenuItem
                v-else
                as="button"
                type="button"
                :disabled="item.disabled"
                :class="[
                  'menuItem',
                  item.variant === 'danger' ? 'menuItemDanger' : undefined,
                  item.disabled ? 'menuItemDisabled' : undefined,
                ].filter(Boolean).join(' ')"
                @select="executeItem(item)"
              >
                <AgalaIcon
                  v-if="item.icon"
                  :name="item.icon"
                  size="sm"
                  class="menuItemIcon"
                />
                {{ item.label }}
              </RekaDropdownMenuItem>
            </template>
          </RekaDropdownMenuContent>
        </div>
      </RekaDropdownMenuPortal>
    </RekaDropdownMenuRoot>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: inline-flex;
}

.trigger {
  display: inline-flex;
  /* See Tooltip.vue's .tooltipWrapper comment: `as-child` merges this class
   * onto the slotted content itself, so it needs to opt out of stretching
   * under an ancestor flex/grid container's default `align-items: stretch`. */
  align-self: flex-start;
}

/*
 * Reka teleports this content via its own internal <Teleport>, which Vue's
 * compiler can't see, so the scoped data-v-* attribute never lands on it.
 * These rules are marked :global() and scoped to .agala-dropdown-menu-portal
 * (a static class on the portal wrapper) so they still apply to the
 * portaled DOM without colliding with unrelated ".menu"/".separator"
 * classes elsewhere on the page (VitePress's own nav chrome uses ".menu").
 */

/* Menu panel */
:global(.agala-dropdown-menu-portal .menu) {
  margin: 0;
  z-index: var(--agala-layer-dropdown, var(--agala-z-dropdown));
  min-width: 10rem;
  max-width: min(calc(100vw - 1rem), var(--reka-popper-available-width, calc(100vw - 1rem)), var(--agala-floating-available-width, calc(100vw - 1rem)));
  max-height: min(calc(100dvh - 1rem), var(--reka-popper-available-height, calc(100dvh - 1rem)), var(--agala-floating-available-height, calc(100dvh - 1rem)));
  padding: 0.25rem;
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-popover, var(--agala-shadow-md));
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Items */
:global(.agala-dropdown-menu-portal .menuItem) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4375rem 0.625rem;
  border: none;
  border-radius: calc(var(--agala-radius) - 4px);
  background: transparent;
  color: hsl(var(--agala-popover-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-normal);
  text-align: left;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: background-color var(--agala-transition-fast), color var(--agala-transition-fast);
}

:global(.agala-dropdown-menu-portal .menuItem[data-highlighted]) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-dropdown-menu-portal .menuItemDanger) {
  color: hsl(var(--agala-danger));
}

:global(.agala-dropdown-menu-portal .menuItemDanger[data-highlighted]) {
  background-color: hsl(var(--agala-danger) / 0.08);
  color: hsl(var(--agala-danger));
}

:global(.agala-dropdown-menu-portal .menuItemDisabled) {
  cursor: default;
  opacity: 0.4;
  pointer-events: none;
}

:global(.agala-dropdown-menu-portal .menuItemIcon) {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Separator */
:global(.agala-dropdown-menu-portal .separator) {
  height: var(--agala-border-width);
  background-color: hsl(var(--agala-border));
  margin: 0.25rem 0;
}

@media (max-width: 639px) {
  :global(.agala-dropdown-menu-portal .menuItem) {
    min-height: 2.5rem;
  }
}
</style>
