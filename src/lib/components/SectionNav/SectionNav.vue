<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import type { SectionNavItem, SectionNavProps } from './types'

const props = withDefaults(defineProps<SectionNavProps>(), {
  variant: 'panel',
  density: 'compact',
  responsive: 'scroll',
  ariaLabel: 'Section navigation',
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [item: SectionNavItem, event: MouseEvent]
}>()

const root = ref<HTMLElement | null>(null)
const itemElements = new Map<string, HTMLElement>()
const hasOverflowStart = ref(false)
const hasOverflowEnd = ref(false)
let resizeObserver: ResizeObserver | undefined

function setItemElement(value: string, element: unknown) {
  if (element instanceof HTMLElement) itemElements.set(value, element)
  else itemElements.delete(value)
}

function updateOverflowEdges() {
  const element = root.value
  if (!element) return

  const maxScroll = element.scrollWidth - element.clientWidth
  hasOverflowStart.value = maxScroll > 1 && element.scrollLeft > 1
  hasOverflowEnd.value = maxScroll > 1 && element.scrollLeft < maxScroll - 1
}

async function revealActiveItem() {
  await nextTick()
  const active = itemElements.get(props.modelValue)
  if (!active) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  active.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'nearest',
  })
  requestAnimationFrame(updateOverflowEdges)
}

function selectItem(item: SectionNavItem, event: MouseEvent) {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  emit('update:modelValue', item.value)
  emit('select', item, event)
}

function validateItems() {
  if (!import.meta.env.DEV) return
  const values = new Set<string>()
  for (const item of props.items) {
    if (values.has(item.value)) console.warn(`[AgalaSectionNav] Duplicate item value: "${item.value}".`)
    values.add(item.value)
  }
  if (props.modelValue && !values.has(props.modelValue)) {
    console.warn(`[AgalaSectionNav] Active value "${props.modelValue}" does not match an item.`)
  }
}

watch(() => props.modelValue, revealActiveItem)
watch(() => props.items, () => {
  validateItems()
  void revealActiveItem()
}, { deep: true })

onMounted(() => {
  validateItems()
  resizeObserver = new ResizeObserver(updateOverflowEdges)
  if (root.value) resizeObserver.observe(root.value)
  root.value?.addEventListener('scroll', updateOverflowEdges, { passive: true })
  updateOverflowEdges()
  void revealActiveItem()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  root.value?.removeEventListener('scroll', updateOverflowEdges)
})
</script>

<template>
  <nav
    ref="root"
    :class="[
      'agala-section-nav',
      `agala-section-nav--${variant}`,
      `agala-section-nav--${density}`,
      `agala-section-nav--responsive-${responsive}`,
      {
        'agala-section-nav--overflow-start': hasOverflowStart,
        'agala-section-nav--overflow-end': hasOverflowEnd,
      },
      props.class,
    ]"
    :aria-label="ariaLabel"
  >
    <template v-for="item in items" :key="item.value">
      <a
        v-if="item.href"
        :ref="element => setItemElement(item.value, element)"
        class="agala-section-nav__item"
        :class="{ 'agala-section-nav__item--active': item.value === modelValue }"
        :href="item.disabled ? undefined : item.href"
        :aria-current="item.value === modelValue ? 'page' : undefined"
        :aria-disabled="item.disabled || undefined"
        :tabindex="item.disabled ? -1 : undefined"
        @click="selectItem(item, $event)"
      >
        <AgalaIcon v-if="item.icon" class="agala-section-nav__icon" :name="item.icon" />
        <span class="agala-section-nav__label">{{ item.label }}</span>
        <span v-if="item.badge !== undefined" class="agala-section-nav__badge">{{ item.badge }}</span>
      </a>
      <button
        v-else
        :ref="element => setItemElement(item.value, element)"
        class="agala-section-nav__item"
        :class="{ 'agala-section-nav__item--active': item.value === modelValue }"
        type="button"
        :disabled="item.disabled"
        :aria-current="item.value === modelValue ? 'page' : undefined"
        @click="selectItem(item, $event)"
      >
        <AgalaIcon v-if="item.icon" class="agala-section-nav__icon" :name="item.icon" />
        <span class="agala-section-nav__label">{{ item.label }}</span>
        <span v-if="item.badge !== undefined" class="agala-section-nav__badge">{{ item.badge }}</span>
      </button>
    </template>
  </nav>
</template>

<style scoped>
.agala-section-nav {
  --_section-nav-item-min-height: var(--agala-section-nav-item-min-height, 2.25rem);
  --_section-nav-item-padding-inline: var(--agala-section-nav-item-padding-inline, var(--agala-space-3));
  --_section-nav-font-size: var(--agala-section-nav-font-size, 0.8125rem);

  position: relative;
  display: flex;
  width: min(100%, var(--agala-section-nav-width, 13.5rem));
  min-width: 0;
  flex-direction: column;
  gap: var(--agala-section-nav-gap, var(--agala-space-0-5));
  padding: var(--agala-section-nav-padding, var(--agala-space-1-5));
  font-family: var(--agala-font-sans);
}

.agala-section-nav--panel {
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-section-nav-panel-radius, var(--agala-radius));
  background: var(--agala-section-nav-panel-bg, hsl(var(--agala-card)));
  box-shadow: var(--agala-section-nav-panel-shadow, var(--agala-shadow-xs));
}

.agala-section-nav--plain {
  padding: var(--agala-section-nav-plain-padding, 0);
  border: var(--agala-section-nav-plain-border, 0);
  border-radius: var(--agala-section-nav-plain-radius, 0);
  background: var(--agala-section-nav-plain-bg, transparent);
  box-shadow: var(--agala-section-nav-plain-shadow, none);
}

.agala-section-nav--comfortable {
  --_section-nav-item-min-height: var(--agala-section-nav-comfortable-item-min-height, 2.5rem);
  --_section-nav-item-padding-inline: var(--agala-section-nav-comfortable-item-padding-inline, 0.75rem);
  --_section-nav-font-size: var(--agala-section-nav-comfortable-font-size, 0.875rem);
}

.agala-section-nav__item {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: var(--_section-nav-item-min-height);
  align-items: center;
  gap: var(--agala-space-2-5);
  padding: var(--agala-space-1-5) var(--_section-nav-item-padding-inline);
  border: 0;
  border-radius: var(--agala-section-nav-item-radius, calc(var(--agala-radius) - 0.125rem));
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  font: inherit;
  font-size: var(--_section-nav-font-size);
  font-weight: var(--agala-section-nav-font-weight, var(--agala-font-weight-medium));
  line-height: 1.25;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--agala-transition-fast),
    color var(--agala-transition-fast);
}

.agala-section-nav__item::before {
  position: absolute;
  inset-block: 0.35rem;
  inset-inline-start: 0;
  width: var(--agala-section-nav-indicator-size, 2px);
  border-radius: 999px;
  background: var(--agala-section-nav-indicator, hsl(var(--agala-primary)));
  content: '';
  opacity: 0;
  transform: scaleY(0.55);
  transition:
    opacity var(--agala-transition-fast),
    transform var(--agala-transition-fast);
}

.agala-section-nav__item:hover:not(:disabled, [aria-disabled="true"]) {
  background: var(--agala-section-nav-hover-bg, hsl(var(--agala-primary) / 0.055));
  color: hsl(var(--agala-foreground));
}

.agala-section-nav__item--active,
.agala-section-nav__item--active:hover:not(:disabled, [aria-disabled="true"]) {
  background: var(--agala-section-nav-active-bg, hsl(var(--agala-primary) / 0.09));
  color: var(--agala-section-nav-active-fg, hsl(var(--agala-primary)));
  font-weight: var(--agala-font-weight-semibold);
}

.agala-section-nav__item--active::before { opacity: 1; transform: scaleY(1); }

.agala-section-nav__item:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px hsl(var(--agala-ring));
}

.agala-section-nav__item:disabled,
.agala-section-nav__item[aria-disabled="true"] { opacity: var(--agala-opacity-disabled); cursor: not-allowed; }

.agala-section-nav__icon { width: 1rem; height: 1rem; flex: 0 0 auto; }
.agala-section-nav__label { min-width: 0; flex: 1; overflow-wrap: anywhere; }
.agala-section-nav__badge {
  display: inline-flex;
  min-width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding-inline: 0.35rem;
  border-radius: 999px;
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-muted-foreground));
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
}
.agala-section-nav__item--active .agala-section-nav__badge {
  background: hsl(var(--agala-primary) / 0.12);
  color: inherit;
}

@media (max-width: 639px) {
  .agala-section-nav--responsive-scroll {
    width: 100%;
    max-width: 100%;
    flex-direction: row;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .agala-section-nav--responsive-scroll::-webkit-scrollbar { display: none; }
  .agala-section-nav--responsive-scroll .agala-section-nav__item { flex: 0 0 auto; white-space: nowrap; }
  .agala-section-nav--responsive-scroll .agala-section-nav__item::before {
    inset-block: auto 0;
    inset-inline: 0;
    width: auto;
    height: var(--agala-section-nav-indicator-size, 2px);
    transform: scaleX(0.55);
  }
  .agala-section-nav--responsive-scroll .agala-section-nav__item--active::before { transform: scaleX(1); }
  .agala-section-nav--responsive-scroll::after {
    position: sticky;
    inset-inline-end: 0;
    width: 1.5rem;
    flex: 0 0 1.5rem;
    align-self: stretch;
    background: linear-gradient(to var(--agala-section-nav-fade-direction, left), transparent, hsl(var(--agala-card)));
    content: '';
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }
  .agala-section-nav--overflow-end::after { opacity: 1; }
  .agala-section-nav--responsive-stack { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .agala-section-nav__item,
  .agala-section-nav__item::before,
  .agala-section-nav--responsive-scroll::after { transition: none; }
}
</style>
