<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { TabsProps, TabItem } from './types'

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'underline',
  orientation: 'horizontal',
  ariaLabel: undefined,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = `agala-tabs-${useId()}`
const { matches: reduceMotion } = useMediaQuery('(prefers-reduced-motion: reduce)')
const tabListRef = ref<HTMLElement | null>(null)
const canScrollStart = ref(false)
const canScrollEnd = ref(false)
let resizeObserver: ResizeObserver | undefined

function listElement() {
  const list = tabListRef.value
  return typeof Element !== 'undefined' && list instanceof Element ? list as HTMLElement : null
}

function checkOverflow() {
  const list = listElement()
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
  const list = listElement()
  if (typeof ResizeObserver !== 'undefined' && list) {
    resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(list)
  }
})
onUnmounted(() => resizeObserver?.disconnect())
watch(() => props.tabs, () => nextTick(checkOverflow), { deep: true })
watch(() => props.orientation, () => nextTick(checkOverflow))
watch(() => props.modelValue, () => nextTick(checkOverflow))

function onModelUpdate(value: string | number) {
  const nextValue = String(value)
  emit('update:modelValue', nextValue)
  nextTick(() => {
    const trigger = listElement()?.querySelector<HTMLElement>(`[id$="-tab-${safeId(nextValue)}"]`)
    trigger?.scrollIntoView({ behavior: reduceMotion.value ? 'auto' : 'smooth', inline: 'nearest', block: 'nearest' })
    checkOverflow()
  })
}
function safeId(value: string) {
  return encodeURIComponent(value).replaceAll('%', '-')
}
function tabId(value: string) { return `${uid}-tab-${safeId(value)}` }
function panelId(value: string) { return `${uid}-panel-${safeId(value)}` }
const overflowCls = computed(() => [
  'tabListShell',
  props.orientation === 'vertical' ? 'tabListShellVertical' : undefined,
  canScrollStart.value ? 'canScrollStart' : undefined,
  canScrollEnd.value ? 'canScrollEnd' : undefined,
].filter(Boolean).join(' '))
const tabListCls = computed(() => ['tabList', props.variant === 'pills' ? 'tabsPills' : undefined].filter(Boolean).join(' '))
const rootCls = computed(() => ['tabs', props.class, props.orientation === 'vertical' ? 'tabsVertical' : undefined].filter(Boolean).join(' '))
function tabCls(tab: TabItem) {
  return ['tabBtn', props.modelValue === tab.value ? 'tabBtnActive' : undefined, tab.disabled ? 'tabBtnDisabled' : undefined].filter(Boolean).join(' ')
}
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    :orientation="orientation"
    :class="rootCls"
    @update:model-value="onModelUpdate"
  >
    <div :class="overflowCls">
      <TabsList
        ref="tabListRef"
        :class="tabListCls"
        :aria-label="ariaLabel"
        @scroll="checkOverflow"
      >
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :disabled="tab.disabled"
          as-child
        >
          <button
            :id="tabId(tab.value)"
            type="button"
            :class="tabCls(tab)"
            :aria-controls="panelId(tab.value)"
            :aria-label="tab.label"
          >
            <slot
              :name="`tab-${tab.value}`"
              :tab="tab"
              :active="modelValue === tab.value"
            >
              {{ tab.label }}
            </slot>
          </button>
        </TabsTrigger>
      </TabsList>
    </div>
    <template
      v-for="tab in tabs"
      :key="tab.value"
    >
      <TabsContent
        v-if="$slots[`panel-${tab.value}`]"
        :id="panelId(tab.value)"
        :value="tab.value"
        :aria-labelledby="tabId(tab.value)"
        class="tabPanel"
      >
        <slot :name="`panel-${tab.value}`" />
      </TabsContent>
    </template>
  </TabsRoot>
</template>

<style scoped>
.tabs { display: flex; flex-direction: column; width: 100%; }
.tabListShell { min-width: 0; }
.tabList { display: flex; width: 100%; box-sizing: border-box; border-bottom: var(--agala-tab-list-border, var(--agala-border-width) solid hsl(var(--agala-border))); gap: var(--agala-tab-gap, 0); padding: var(--agala-tab-list-padding, 0); }
.tabBtn { position: relative; padding: var(--agala-tab-padding, 0.625rem 1rem); background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: calc(-1 * var(--agala-border-width)); font-family: var(--agala-font-sans); font-size: var(--agala-tab-font-size, var(--agala-font-size-base)); font-weight: var(--agala-tab-font-weight, var(--agala-font-weight-medium)); color: var(--agala-tab-inactive-color, hsl(var(--agala-muted-foreground))); cursor: pointer; white-space: nowrap; transition: color var(--agala-transition-fast), border-color var(--agala-transition-fast); outline: none; }
.tabBtn:hover:not(.tabBtnDisabled):not(.tabBtnActive):not([data-disabled]) { color: hsl(var(--agala-foreground)); }
.tabBtn:focus-visible { outline: 2px solid hsl(var(--agala-ring)); outline-offset: -2px; border-radius: var(--agala-radius-sm) var(--agala-radius-sm) 0 0; }
.tabBtnActive, .tabBtn[data-state='active'] { color: var(--agala-tab-active-color, hsl(var(--agala-primary))); border-bottom: var(--agala-tab-active-border, 2px solid hsl(var(--agala-primary))); }
.tabBtnDisabled, .tabBtn[data-disabled] { cursor: not-allowed; opacity: 0.4; }
.tabPanel { padding-top: 1.25rem; outline: none; }
.tabPanel:focus-visible { outline: 2px solid hsl(var(--agala-ring)); outline-offset: 2px; border-radius: var(--agala-radius-sm); }
@media (max-width: 639px) {
  .tabList { overflow-x: auto; overflow-y: hidden; scrollbar-width: none; min-height: 2.75rem; }
  .tabList::-webkit-scrollbar { display: none; }
  .canScrollEnd:not(.canScrollStart) .tabList { mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent); -webkit-mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent); }
  .canScrollStart:not(.canScrollEnd) .tabList { mask-image: linear-gradient(to right, transparent, black 1rem); -webkit-mask-image: linear-gradient(to right, transparent, black 1rem); }
  .canScrollStart.canScrollEnd .tabList { mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent); }
  .tabBtn { flex-shrink: 0; min-height: 2.75rem; }
}
.tabsVertical { flex-direction: row; align-items: stretch; }
.tabListShellVertical { display: flex; flex-direction: column; flex: 0 0 auto; overflow: hidden; min-width: 0; }
.tabListShellVertical .tabList { width: auto; min-width: var(--agala-tab-vertical-rail-min-width, 11rem); flex: 1 1 auto; flex-direction: column; align-items: stretch; border-bottom: none; border-right: var(--agala-tab-vertical-rail-border, var(--agala-border-width) solid hsl(var(--agala-border))); overflow-x: hidden; overflow-y: auto; scrollbar-width: none; min-height: 0; }
.tabListShellVertical .tabList::-webkit-scrollbar { display: none; }
.tabListShellVertical .tabList:not(.tabsPills) .tabBtn { border-bottom: none; border-right: 2px solid transparent; margin-bottom: 0; margin-right: calc(-1 * var(--agala-border-width)); text-align: left; }
.tabListShellVertical .tabList:not(.tabsPills) .tabBtn:focus-visible { border-radius: var(--agala-radius-sm) 0 0 var(--agala-radius-sm); outline-offset: -2px; }
.tabListShellVertical .tabList:not(.tabsPills) .tabBtnActive, .tabListShellVertical .tabList:not(.tabsPills) .tabBtn[data-state='active'] { border-bottom: none; border-right: var(--agala-tab-active-vertical-border, 2px solid hsl(var(--agala-primary))); }
.tabListShellVertical .tabList.tabsPills { width: auto; flex-direction: column; align-items: flex-start; align-self: flex-start; border-right: none; }
.tabsVertical > .tabPanel { padding-top: 0; padding-left: 1.25rem; flex: 1 1 auto; min-width: 0; }
.tabListShellVertical.canScrollStart:not(.canScrollEnd) .tabList { mask-image: linear-gradient(to bottom, transparent, black 1rem); -webkit-mask-image: linear-gradient(to bottom, transparent, black 1rem); }
.tabListShellVertical.canScrollEnd:not(.canScrollStart) .tabList { mask-image: linear-gradient(to bottom, black calc(100% - 1rem), transparent); -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 1rem), transparent); }
.tabListShellVertical.canScrollStart.canScrollEnd .tabList { mask-image: linear-gradient(to bottom, transparent, black 1rem, black calc(100% - 1rem), transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 1rem, black calc(100% - 1rem), transparent); }
.tabsPills { border-bottom: none; gap: var(--agala-tab-pill-gap, 0.375rem); padding: 0; background: transparent; border-radius: 0; width: fit-content; max-width: 100%; }
.tabsPills .tabBtn { min-height: var(--agala-tab-pill-height, 2.25rem); margin-bottom: 0; border: var(--agala-border-width) solid transparent; border-radius: var(--agala-tab-pill-radius, var(--agala-radius-md)); padding: var(--agala-tab-pill-padding, 0.4375rem 0.75rem); }
.tabsPills .tabBtnActive, .tabsPills .tabBtn[data-state='active'] { background: hsl(var(--agala-primary) / 0.1); color: hsl(var(--agala-primary)); border-color: hsl(var(--agala-primary) / 0.16); box-shadow: none; }
.tabsPills .tabBtn:focus-visible { outline-offset: 2px; border-radius: var(--agala-tab-pill-radius, var(--agala-radius-md)); }
@media (prefers-reduced-motion: reduce) { .tabBtn { transition: none; } }
</style>
