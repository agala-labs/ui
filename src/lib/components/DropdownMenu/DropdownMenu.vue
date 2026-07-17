<script setup lang="ts">
import { ref, computed } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import { useFloatingOverlay } from '../../composables/useFloatingOverlay'
import { usePopoverBehavior } from '../../composables/usePopoverBehavior'
import type { DropdownMenuItem, DropdownMenuProps } from './types'

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  placement: 'bottom-end',
})

const isOpen = ref(false)
const highlightedIdx = ref(-1)
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const floatingPlacement = computed(() => props.placement)
const { floatingStyles } = useFloatingOverlay(triggerRef, floatingRef, isOpen, {
  placement: floatingPlacement,
})

/* Only non-separator items can be highlighted */
const actionIndices = computed(() =>
  props.items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !item.separator && !item.disabled)
    .map(({ i }) => i)
)

function open() {
  isOpen.value = true
  highlightedIdx.value = -1
}

function close() {
  isOpen.value = false
  highlightedIdx.value = -1
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function executeItem(item: DropdownMenuItem) {
  if (item.disabled || item.separator) return
  item.onClick?.()
  close()
}

function moveHighlight(dir: 1 | -1) {
  const indices = actionIndices.value
  if (!indices.length) return
  const pos = indices.indexOf(highlightedIdx.value)
  if (pos === -1) {
    highlightedIdx.value = dir === 1 ? indices[0] : indices[indices.length - 1]
  } else {
    const next = pos + dir
    if (next >= 0 && next < indices.length) {
      highlightedIdx.value = indices[next]
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) { open(); return }
      moveHighlight(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      if (!isOpen.value) { open(); return }
      moveHighlight(-1)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (!isOpen.value) { open(); return }
      if (highlightedIdx.value >= 0) {
        executeItem(props.items[highlightedIdx.value])
      }
      break
    case 'Escape':
      close()
      break
    case 'Tab':
      close()
      break
  }
}

usePopoverBehavior(isOpen, wrapperRef, floatingRef, close, { closeOnScroll: false })
</script>

<template>
  <div
    ref="wrapperRef"
    class="wrapper"
    :class="props.class"
    @keydown="handleKeyDown"
  >
    <div ref="triggerRef" class="trigger" @click="toggle">
      <slot name="trigger" />
    </div>

    <div
      v-if="isOpen"
      ref="floatingRef"
      class="menu"
      popover="manual"
      role="menu"
      :style="floatingStyles"
    >
      <template v-for="(item, idx) in items" :key="idx">
        <div v-if="item.separator" class="separator" role="separator" />
        <button
          v-else
          type="button"
          role="menuitem"
          :disabled="item.disabled"
          :class="[
            'menuItem',
            item.variant === 'danger' ? 'menuItemDanger' : undefined,
            idx === highlightedIdx ? 'menuItemHighlighted' : undefined,
            item.disabled ? 'menuItemDisabled' : undefined,
          ].filter(Boolean).join(' ')"
          @mouseenter="highlightedIdx = idx"
          @mouseleave="highlightedIdx = -1"
          @click="executeItem(item)"
        >
          <AgalaIcon v-if="item.icon" :name="item.icon" :size="14" class="menuItemIcon" />
          {{ item.label }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: inline-flex;
}

.trigger {
  display: inline-flex;
}

/* Menu panel */
.menu {
  position: fixed;
  inset: auto;
  margin: 0;
  z-index: var(--agala-z-dropdown);
  min-width: 10rem;
  max-width: min(calc(100vw - 1rem), var(--agala-floating-available-width, calc(100vw - 1rem)));
  max-height: min(calc(100dvh - 1rem), var(--agala-floating-available-height, calc(100dvh - 1rem)));
  padding: 0.25rem;
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Items */
.menuItem {
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

.menuItemHighlighted {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.menuItemDanger {
  color: hsl(var(--agala-danger));
}

.menuItemDanger.menuItemHighlighted {
  background-color: hsl(var(--agala-danger) / 0.08);
  color: hsl(var(--agala-danger));
}

.menuItemDisabled {
  cursor: default;
  opacity: 0.4;
  pointer-events: none;
}

.menuItemIcon {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Separator */
.separator {
  height: var(--agala-border-width);
  background-color: hsl(var(--agala-border));
  margin: 0.25rem 0;
}

@media (max-width: 639px) {
  .menuItem {
    min-height: 2.5rem;
  }
}
</style>
