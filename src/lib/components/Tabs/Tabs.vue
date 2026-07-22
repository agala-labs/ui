<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { TabsProps, TabItem } from './types'

let idCounter = 0

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'underline',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

idCounter += 1
const uid = `tabs-${idCounter}`

const { matches: reduceMotion } = useMediaQuery('(prefers-reduced-motion: reduce)')
const tabListRef = ref<HTMLElement | null>(null)
const tabRefs = new Map<string, HTMLElement>()
const canScrollStart = ref(false)
const canScrollEnd = ref(false)
let resizeObserver: ResizeObserver | undefined

function setTabRef(value: string, el: unknown) {
  if (el instanceof HTMLElement) tabRefs.set(value, el)
  else tabRefs.delete(value)
}

function checkOverflow() {
  const list = tabListRef.value
  if (!list) return
  const tolerance = 2
  canScrollStart.value = list.scrollLeft > tolerance
  canScrollEnd.value = list.scrollLeft + list.clientWidth < list.scrollWidth - tolerance
}

onMounted(() => {
  checkOverflow()
  if (typeof ResizeObserver !== 'undefined' && tabListRef.value) {
    resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(tabListRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.tabs, () => nextTick(checkOverflow), { deep: true })

watch(() => props.modelValue, () => {
  nextTick(() => {
    tabRefs.get(props.modelValue)?.scrollIntoView({
      behavior: reduceMotion.value ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
    checkOverflow()
  })
})

function safeId(value: string) {
  return encodeURIComponent(value).replaceAll('%', '-')
}

function tabId(value: string) {
  return `${uid}-tab-${safeId(value)}`
}

function panelId(value: string) {
  return `${uid}-panel-${safeId(value)}`
}

function focusAndSelect(tab: TabItem) {
  emit('update:modelValue', tab.value)
  nextTick(() => {
    tabRefs.get(tab.value)?.focus({ preventScroll: true })
    tabRefs.get(tab.value)?.scrollIntoView({
      behavior: reduceMotion.value ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
    checkOverflow()
  })
}

const overflowCls = computed(() => [
  'tabListShell',
  canScrollStart.value ? 'canScrollStart' : undefined,
  canScrollEnd.value ? 'canScrollEnd' : undefined,
].filter(Boolean).join(' '))

const tabListCls = computed(() => [
  'tabList',
  props.variant === 'pills' ? 'tabsPills' : undefined,
].filter(Boolean).join(' '))

const enabledTabs = computed(() => props.tabs.filter(t => !t.disabled))

function select(tab: TabItem) {
  if (!tab.disabled) emit('update:modelValue', tab.value)
}

function handleKeyDown(e: KeyboardEvent, currentValue: string) {
  const tabs = enabledTabs.value
  const idx = tabs.findIndex(t => t.value === currentValue)
  if (idx === -1) return

  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    next = (idx + 1) % tabs.length
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    next = (idx - 1 + tabs.length) % tabs.length
  } else if (e.key === 'Home') {
    e.preventDefault()
    next = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    next = tabs.length - 1
  }

  if (next !== -1) focusAndSelect(tabs[next])
}

function tabCls(tab: TabItem) {
  return [
    'tabBtn',
    props.modelValue === tab.value ? 'tabBtnActive' : undefined,
    tab.disabled ? 'tabBtnDisabled' : undefined,
  ].filter(Boolean).join(' ')
}
</script>

<template>
  <div :class="['tabs', props.class].filter(Boolean).join(' ')">
    <div :class="overflowCls">
      <div
        ref="tabListRef"
        :class="tabListCls"
        role="tablist"
        aria-orientation="horizontal"
        :aria-label="ariaLabel"
        @scroll="checkOverflow"
      >
        <button
          v-for="tab in tabs"
          :id="tabId(tab.value)"
          :key="tab.value"
          :ref="el => setTabRef(tab.value, el)"
          :aria-controls="$slots[`panel-${tab.value}`] ? panelId(tab.value) : undefined"
          :aria-label="tab.label"
          :aria-selected="modelValue === tab.value"
          :disabled="tab.disabled"
          :tabindex="modelValue === tab.value ? 0 : -1"
          :class="tabCls(tab)"
          role="tab"
          type="button"
          @click="select(tab)"
          @keydown="handleKeyDown($event, tab.value)"
        >
          <slot
            :name="`tab-${tab.value}`"
            :tab="tab"
            :active="modelValue === tab.value"
          >
            {{ tab.label }}
          </slot>
        </button>
      </div>
    </div>

    <div
      v-if="$slots[`panel-${modelValue}`]"
      :id="panelId(modelValue)"
      :aria-labelledby="tabId(modelValue)"
      class="tabPanel"
      role="tabpanel"
      tabindex="0"
    >
      <slot :name="`panel-${modelValue}`" />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Tab strip */
.tabListShell {
  min-width: 0;
}

.tabList {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  border-bottom: var(--agala-tab-list-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  gap: var(--agala-tab-gap, 0);
  padding: var(--agala-tab-list-padding, 0);
}

.tabBtn {
  position: relative;
  padding: var(--agala-tab-padding, 0.625rem 1rem);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: calc(-1 * var(--agala-border-width));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-tab-font-size, var(--agala-font-size-base));
  font-weight: var(--agala-tab-font-weight, var(--agala-font-weight-medium));
  color: var(--agala-tab-inactive-color, hsl(var(--agala-muted-foreground)));
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--agala-transition-fast),
    border-color var(--agala-transition-fast);
  outline: none;
}

.tabBtn:hover:not(.tabBtnDisabled):not(.tabBtnActive) {
  color: hsl(var(--agala-foreground));
}

.tabBtn:focus-visible {
  outline: 2px solid hsl(var(--agala-ring));
  outline-offset: -2px;
  border-radius: var(--agala-radius-sm) var(--agala-radius-sm) 0 0;
}

.tabBtnActive {
  color: var(--agala-tab-active-color, hsl(var(--agala-primary)));
  border-bottom: var(--agala-tab-active-border, 2px solid hsl(var(--agala-primary)));
}

.tabBtnDisabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* Tab panel */
.tabPanel {
  padding-top: 1.25rem;
  outline: none;
}

.tabPanel:focus-visible {
  outline: 2px solid hsl(var(--agala-ring));
  outline-offset: 2px;
  border-radius: var(--agala-radius-sm);
}

@media (max-width: 639px) {
  .tabList {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    min-height: 2.75rem;
  }

  .tabList::-webkit-scrollbar {
    display: none;
  }

  .canScrollEnd:not(.canScrollStart) .tabList {
    mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent);
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent);
  }

  .canScrollStart:not(.canScrollEnd) .tabList {
    mask-image: linear-gradient(to right, transparent, black 1rem);
    -webkit-mask-image: linear-gradient(to right, transparent, black 1rem);
  }

  .canScrollStart.canScrollEnd .tabList {
    mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent);
  }

  .tabBtn {
    flex-shrink: 0;
    min-height: 2.75rem;
  }
}

/* Pills variant */
.tabsPills {
  border-bottom: none;
  gap: 0.25rem;
  padding: 0.25rem;
  background: hsl(var(--agala-muted) / 0.5);
  border-radius: var(--agala-radius);
  width: fit-content;
  max-width: 100%;
}
.tabsPills .tabBtn {
  border-bottom: none;
  border-radius: calc(var(--agala-radius) - 2px);
  padding: 0.375rem 0.75rem;
}
.tabsPills .tabBtnActive {
  background: hsl(var(--agala-card));
  color: hsl(var(--agala-foreground));
  box-shadow: var(--agala-shadow-xs);
  border-bottom: none;
}

@media (prefers-reduced-motion: reduce) {
  .tabBtn {
    transition: none;
  }
}
</style>
