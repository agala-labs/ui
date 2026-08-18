<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { TabsProps, TabItem } from './types'

let idCounter = 0

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'underline',
  orientation: 'horizontal',
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
  if (props.orientation === 'vertical') {
    canScrollStart.value = list.scrollTop > tolerance
    canScrollEnd.value = list.scrollTop + list.clientHeight < list.scrollHeight - tolerance
  } else {
    canScrollStart.value = list.scrollLeft > tolerance
    canScrollEnd.value = list.scrollLeft + list.clientWidth < list.scrollWidth - tolerance
  }
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

watch(() => props.orientation, () => nextTick(checkOverflow))

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
  props.orientation === 'vertical' ? 'tabListShellVertical' : undefined,
  canScrollStart.value ? 'canScrollStart' : undefined,
  canScrollEnd.value ? 'canScrollEnd' : undefined,
].filter(Boolean).join(' '))

const tabListCls = computed(() => [
  'tabList',
  props.variant === 'pills' ? 'tabsPills' : undefined,
].filter(Boolean).join(' '))

const rootCls = computed(() => [
  'tabs',
  props.class,
  props.orientation === 'vertical' ? 'tabsVertical' : undefined,
].filter(Boolean).join(' '))

const enabledTabs = computed(() => props.tabs.filter(t => !t.disabled))

function select(tab: TabItem) {
  if (!tab.disabled) emit('update:modelValue', tab.value)
}

function handleKeyDown(e: KeyboardEvent, currentValue: string) {
  const tabs = enabledTabs.value
  const idx = tabs.findIndex(t => t.value === currentValue)
  if (idx === -1) return

  const vertical = props.orientation === 'vertical'
  let next = -1
  if (vertical) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      next = (idx + 1) % tabs.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      next = (idx - 1 + tabs.length) % tabs.length
    }
  } else {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      next = (idx + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      next = (idx - 1 + tabs.length) % tabs.length
    }
  }

  if (next === -1 && e.key === 'Home') {
    e.preventDefault()
    next = 0
  } else if (next === -1 && e.key === 'End') {
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
  <div :class="rootCls">
    <div :class="overflowCls">
      <div
        ref="tabListRef"
        :class="tabListCls"
        role="tablist"
        :aria-orientation="orientation"
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

/* Vertical orientation */
.tabsVertical {
  flex-direction: row;
  align-items: stretch;
}

.tabListShellVertical {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  overflow: hidden;
  min-width: 0;
}

.tabListShellVertical .tabList {
  width: auto;
  min-width: var(--agala-tab-vertical-rail-min-width, 11rem);
  flex: 1 1 auto;
  flex-direction: column;
  align-items: stretch;
  border-bottom: none;
  border-right: var(--agala-tab-vertical-rail-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  min-height: 0;
}

.tabListShellVertical .tabList::-webkit-scrollbar {
  display: none;
}

.tabListShellVertical .tabList:not(.tabsPills) .tabBtn {
  border-bottom: none;
  border-right: 2px solid transparent;
  margin-bottom: 0;
  margin-right: calc(-1 * var(--agala-border-width));
  text-align: left;
}

.tabListShellVertical .tabList:not(.tabsPills) .tabBtn:focus-visible {
  border-radius: var(--agala-radius-sm) 0 0 var(--agala-radius-sm);
  outline-offset: -2px;
}

.tabListShellVertical .tabList:not(.tabsPills) .tabBtnActive {
  border-bottom: none;
  border-right: var(--agala-tab-active-vertical-border, 2px solid hsl(var(--agala-primary)));
}

.tabListShellVertical .tabList.tabsPills {
  width: auto;
  flex-direction: column;
  align-items: flex-start;
  align-self: flex-start;
  border-right: none;
}

.tabsVertical > .tabPanel {
  padding-top: 0;
  padding-left: 1.25rem;
  flex: 1 1 auto;
  min-width: 0;
}

.tabListShellVertical.canScrollStart:not(.canScrollEnd) .tabList {
  mask-image: linear-gradient(to bottom, transparent, black 1rem);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 1rem);
}

.tabListShellVertical.canScrollEnd:not(.canScrollStart) .tabList {
  mask-image: linear-gradient(to bottom, black calc(100% - 1rem), transparent);
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 1rem), transparent);
}

.tabListShellVertical.canScrollStart.canScrollEnd .tabList {
  mask-image: linear-gradient(to bottom, transparent, black 1rem, black calc(100% - 1rem), transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 1rem, black calc(100% - 1rem), transparent);
}

/* Pills variant */
.tabsPills {
  border-bottom: none;
  gap: var(--agala-tab-pill-gap, 0.375rem);
  padding: 0;
  background: transparent;
  border-radius: 0;
  width: fit-content;
  max-width: 100%;
}
.tabsPills .tabBtn {
  min-height: var(--agala-tab-pill-height, 2.25rem);
  margin-bottom: 0;
  border: var(--agala-border-width) solid transparent;
  border-radius: var(--agala-tab-pill-radius, var(--agala-radius-md));
  padding: var(--agala-tab-pill-padding, 0.4375rem 0.75rem);
}
.tabsPills .tabBtnActive {
  background: hsl(var(--agala-primary) / 0.1);
  color: hsl(var(--agala-primary));
  border-color: hsl(var(--agala-primary) / 0.16);
  box-shadow: none;
}

.tabsPills .tabBtn:focus-visible {
  outline-offset: 2px;
  border-radius: var(--agala-tab-pill-radius, var(--agala-radius-md));
}

@media (prefers-reduced-motion: reduce) {
  .tabBtn {
    transition: none;
  }
}
</style>
