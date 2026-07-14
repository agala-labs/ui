<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
} from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import { useDropdownPosition } from '../../composables/useDropdownPosition'
import { usePopoverBehavior } from '../../composables/usePopoverBehavior'
import type { SelectOption, SelectSize } from './types'

type FlatItem =
  | { type: 'option'; option: SelectOption }
  | { type: 'header'; label: string }

const props = withDefaults(defineProps<{
  options: SelectOption[]
  modelValue?: string | string[]
  multiple?: boolean
  placeholder?: string
  size?: SelectSize
  disabled?: boolean
  loading?: boolean
  searchable?: boolean
  onSearch?: (query: string) => void
  clearable?: boolean
  error?: boolean
  errorMessage?: string
  maxDisplayed?: number
  maxSelections?: number
  wrapperClass?: string
  class?: string
}>(), {
  multiple: false,
  placeholder: 'Choose…',
  size: 'md',
  disabled: false,
  loading: false,
  searchable: false,
  clearable: false,
  error: false,
  maxDisplayed: 3,
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

/* ─── State ─── */
const isOpen = ref(false)
const query = ref('')
const highlightedIdx = ref(0)

/** Internal value for uncontrolled mode */
const internalValue = ref<string | string[]>(props.multiple ? [] : '')

const rowRef = ref<HTMLDivElement>()
const triggerRef = ref<HTMLDivElement>()
const floatingRef = ref<HTMLDivElement>()
const searchRef = ref<HTMLInputElement>()
const listRef = ref<HTMLUListElement>()
const wrapperRef = ref<HTMLDivElement>()

/* ─── Computed ─── */
const isControlled = computed(() => props.modelValue !== undefined)

const selectedValue = computed<string | string[]>(() => {
  if (isControlled.value) return props.modelValue!
  return internalValue.value
})

const filteredOptions = computed(() => {
  // When onSearch is provided, consumer handles filtering server-side
  if (props.onSearch) return props.options
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      (o.subtitle?.toLowerCase().includes(q) ?? false) ||
      (o.group?.toLowerCase().includes(q) ?? false)
  )
})

const flatFiltered = computed<FlatItem[]>(() => {
  const items: FlatItem[] = []
  const grouped = groupOptions(filteredOptions.value)
  for (const [groupLabel, groupOpts] of grouped) {
    if (groupLabel) {
      items.push({ type: 'header', label: groupLabel })
    }
    for (const opt of groupOpts) {
      items.push({ type: 'option', option: opt })
    }
  }
  return items
})

const selectedSet = computed(() => {
  if (props.multiple) return new Set(Array.isArray(selectedValue.value) ? selectedValue.value : [])
  const s = new Set<string>()
  if (selectedValue.value) s.add(selectedValue.value as string)
  return s
})

const isMaxed = computed(() => {
  if (!props.multiple || props.maxSelections == null) return false
  const count = Array.isArray(selectedValue.value) ? selectedValue.value.length : 0
  return count >= props.maxSelections
})

const selectedOptions = computed(() => {
  if (!props.multiple) {
    const v = selectedValue.value as string
    const found = v ? props.options.find((o) => o.value === v) : undefined
    return found ? [found] : []
  }
  const vals = selectedValue.value as string[]
  return vals
    .map((v) => props.options.find((o) => o.value === v))
    .filter((o): o is SelectOption => !!o)
})

const showClear = computed(() => {
  if (!props.clearable || props.disabled) return false
  return props.multiple
    ? (selectedValue.value as string[]).length > 0
    : !!selectedValue.value
})

const activeDescendant = computed(() => {
  if (!isOpen.value) return undefined
  const item = flatFiltered.value[highlightedIdx.value]
  if (item?.type === 'option') return `agala-opt-${highlightedIdx.value}`
  return undefined
})

/* ─── Fixed dropdown positioning (escapes overflow) ─── */
const { dropdownStyle, recompute } = useDropdownPosition(rowRef, floatingRef)

/* ─── Class helpers ─── */
const triggerRowCls = computed(() => [
  'triggerRow',
  `triggerRow${props.size.charAt(0).toUpperCase()}${props.size.slice(1)}`,
  isOpen.value ? 'triggerRowOpen' : undefined,
  props.disabled ? 'triggerRowDisabled' : undefined,
  props.error ? 'triggerRowError' : undefined,
].filter(Boolean).join(' '))

/* ─── Helpers ─── */
function groupOptions(options: SelectOption[]): Map<string, SelectOption[]> {
  const map = new Map<string, SelectOption[]>()
  for (const opt of options) {
    const key = opt.group ?? ''
    const arr = map.get(key) ?? []
    arr.push(opt)
    map.set(key, arr)
  }
  return map
}

function isSelected(value: string) {
  return selectedSet.value.has(value)
}

function updateValue(newValue: string | string[]) {
  if (!isControlled.value) {
    internalValue.value = newValue
  }
  emit('update:modelValue', newValue)
}

function toggleOption(opt: SelectOption) {
  if (opt.disabled) return
  if (props.multiple) {
    const current = Array.isArray(selectedValue.value) ? [...selectedValue.value] : []
    const exists = current.includes(opt.value)
    if (exists) {
      updateValue(current.filter((v) => v !== opt.value))
    } else if (!isMaxed.value) {
      updateValue([...current, opt.value])
    }
  } else {
    updateValue(opt.value)
    closeDropdown()
  }
}

function clearAll() {
  updateValue(props.multiple ? [] : '')
  closeDropdown()
}

function clearChip(value: string) {
  if (props.multiple) {
    const current = Array.isArray(selectedValue.value) ? [...selectedValue.value] : []
    updateValue(current.filter((v) => v !== value))
  }
}

function closeDropdown() {
  isOpen.value = false
  query.value = ''
}

function openDropdown() {
  isOpen.value = true
  query.value = ''
  highlightedIdx.value = 0
  nextTick(() => requestAnimationFrame(() => recompute()))
}

function findNextIndex(start: number, dir: 1 | -1): number {
  let i = start
  for (let attempts = 0; attempts < flatFiltered.value.length; attempts++) {
    i += dir
    if (i < 0 || i >= flatFiltered.value.length) break
    const item = flatFiltered.value[i]
    if (item.type === 'option' && !item.option.disabled) return i
  }
  return -1
}

function itemKey(item: FlatItem, idx: number): string {
  if (item.type === 'header') return `group-${item.label}-${idx}`
  return item.option.value
}

function optionCls(item: { type: 'option'; option: SelectOption }, idx: number): string {
  const selected = isSelected(item.option.value)
  const highlighted = idx === highlightedIdx.value
  const selectable = !item.option.disabled && !(isMaxed.value && !selected && props.multiple)
  return [
    'option',
    highlighted ? 'optionHighlighted' : undefined,
    selected ? 'optionSelected' : undefined,
    !selectable ? 'optionDisabled' : undefined,
  ].filter(Boolean).join(' ')
}

function highlightOption(item: FlatItem, idx: number) {
  if (item.type !== 'option') return
  const selectable = !item.option.disabled && !(isMaxed.value && !isSelected(item.option.value) && props.multiple)
  if (selectable) highlightedIdx.value = idx
}

function selectOption(item: FlatItem) {
  if (item.type !== 'option') return
  const selectable = !item.option.disabled && !(isMaxed.value && !isSelected(item.option.value) && props.multiple)
  if (selectable) toggleOption(item.option)
}

/* ─── Event handlers ─── */
function handleTriggerClick() {
  if (props.disabled || props.loading) return
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function handleTriggerKeyDown(e: KeyboardEvent) {
  if (props.disabled) return
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (isOpen.value) {
        closeDropdown()
      } else {
        openDropdown()
      }
      break
    case 'ArrowDown':
      e.preventDefault()
      openDropdown()
      break
    case 'ArrowUp':
      e.preventDefault()
      openDropdown()
      {
        const lastOpt = flatFiltered.value.findLastIndex(
          (i) => i.type === 'option' && !i.option.disabled
        )
        highlightedIdx.value = lastOpt >= 0 ? lastOpt : 0
      }
      break
    case 'Escape':
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

function handleListKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault()
      const next = findNextIndex(highlightedIdx.value, 1)
      if (next >= 0) highlightedIdx.value = next
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      const prev = findNextIndex(highlightedIdx.value, -1)
      if (prev >= 0) highlightedIdx.value = prev
      break
    }
    case 'Home': {
      e.preventDefault()
      const first = flatFiltered.value.findIndex(
        (i) => i.type === 'option' && !i.option.disabled
      )
      if (first >= 0) highlightedIdx.value = first
      break
    }
    case 'End': {
      e.preventDefault()
      const last = flatFiltered.value.findLastIndex(
        (i) => i.type === 'option' && !i.option.disabled
      )
      if (last >= 0) highlightedIdx.value = last
      break
    }
    case 'Enter':
    case ' ': {
      e.preventDefault()
      const item = flatFiltered.value[highlightedIdx.value]
      if (item?.type === 'option') toggleOption(item.option)
      break
    }
    case 'Escape':
      closeDropdown()
      triggerRef.value?.focus()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

function handleSearchInput(e: Event) {
  const q = (e.target as HTMLInputElement).value
  query.value = q
  highlightedIdx.value = 0
  props.onSearch?.(q)
}

function handleSearchKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    listRef.value?.focus({ preventScroll: true })
  }
  if (e.key === 'Escape') {
    query.value = ''
    triggerRef.value?.focus()
  }
}

/* ─── Watches ─── */
usePopoverBehavior(isOpen, wrapperRef, floatingRef, () => closeDropdown(), recompute)

// Focus search input when opening
watch(isOpen, (open) => {
  if (open && props.searchable) {
    nextTick(() => searchRef.value?.focus({ preventScroll: true }))
  }
})

watch(highlightedIdx, () => {
  if (!isOpen.value || !listRef.value) return
  const el = listRef.value.children[highlightedIdx.value] as HTMLElement | undefined
  el?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="wrapper"
    :class="[wrapperClass, $props.class]"
  >
    <div ref="rowRef" :class="triggerRowCls">
      <div
        ref="triggerRef"
        role="combobox"
        :tabindex="disabled || loading ? -1 : 0"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        aria-controls="agala-select-listbox"
        :aria-activedescendant="activeDescendant"
        :aria-disabled="disabled || loading"
        class="trigger"
        @click="handleTriggerClick"
        @keydown="handleTriggerKeyDown"
      >
        <span v-if="multiple && selectedOptions.length > 0" class="chips">
          <span
            v-for="opt in selectedOptions.slice(0, maxDisplayed)"
            :key="opt.value"
            class="chip"
          >
            {{ opt.label }}
            <button
              type="button"
              tabindex="-1"
              class="chipRemove"
              @click.stop="clearChip(opt.value)"
              :aria-label="`Remove ${opt.label}`"
            >
              <AgalaIcon name="x" :size="10" />
            </button>
          </span>
          <span v-if="selectedOptions.length > maxDisplayed" class="moreChip">
            +{{ selectedOptions.length - maxDisplayed }} more
          </span>
        </span>
        <span v-else-if="!multiple && selectedOptions.length > 0" class="triggerSingleLabel">
          {{ selectedOptions[0].label }}
        </span>
        <span v-else class="triggerPlaceholder">{{ placeholder }}</span>
      </div>

      <button
        v-if="showClear"
        type="button"
        tabindex="-1"
        class="clearBtn"
        @click.stop="clearAll"
        aria-label="Clear selection"
      >
        <AgalaIcon name="x" :size="12" />
      </button>

      <span
        class="chevron"
        :class="isOpen ? 'chevronOpen' : undefined"
        aria-hidden="true"
      >
        <AgalaIcon name="chevron" :size="14" />
      </span>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" ref="floatingRef" class="dropdown" :style="dropdownStyle">
        <div v-if="searchable" class="searchWrapper">
          <input
            ref="searchRef"
            type="text"
            class="search"
            placeholder="Search…"
            :value="query"
            @input="handleSearchInput"
            @keydown="handleSearchKeyDown"
          />
        </div>

        <div v-if="isMaxed" class="maxMessage" role="alert">
          Max {{ maxSelections }} selections
        </div>

        <ul
          ref="listRef"
          id="agala-select-listbox"
          class="list"
          role="listbox"
          :aria-multiselectable="multiple"
          tabindex="-1"
          @keydown="handleListKeyDown"
        >
          <li v-if="loading" class="loadingState">
            <AgalaIcon name="spinner" :size="16" class="spinnerIcon" />
            Searching…
          </li>
          <li v-else-if="flatFiltered.length === 0" class="emptyMessage">
            {{ query ? 'No results found.' : 'No options available.' }}
          </li>
          <template v-for="(item, idx) in flatFiltered" :key="itemKey(item, idx)">
            <li v-if="item.type === 'header'" role="presentation">
              <div class="groupHeader">{{ item.label }}</div>
            </li>
            <li
              v-else
              :id="`agala-opt-${idx}`"
              role="option"
              :aria-selected="isSelected(item.option.value)"
              :aria-disabled="item.option.disabled || (isMaxed && !isSelected(item.option.value))"
              :class="optionCls(item, idx)"
              @mouseenter="highlightOption(item, idx)"
              @click="selectOption(item)"
            >
              <span v-if="multiple" class="checkBox" aria-hidden="true">
                <AgalaIcon v-if="isSelected(item.option.value)" name="check" :size="10" />
              </span>
              <span v-else class="radioBox" aria-hidden="true">
                <span v-if="isSelected(item.option.value)" class="radioDot" />
              </span>

              <span class="optionContent">
                <span class="optionText">
                  <span class="optionLabel">{{ item.option.label }}</span>
                  <span v-if="item.option.subtitle" class="optionSubtitle">
                    {{ item.option.subtitle }}
                  </span>
                </span>
              </span>
            </li>
          </template>
        </ul>
      </div>
    </Teleport>

    <p v-if="errorMessage" class="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

/* ── Trigger Row ── */
.triggerRow {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-sizing: border-box;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: calc(var(--agala-radius) - 2px);
  background-color: hsl(var(--agala-input-background, var(--agala-background)));
  color: hsl(var(--agala-foreground));
  cursor: pointer;
  transition: border-color var(--agala-transition-fast), box-shadow var(--agala-transition-fast);
}

.triggerRow:hover:not(.triggerRowDisabled) {
  border-color: hsl(var(--agala-border));
}

.triggerRow:focus-within {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.triggerRowOpen {
  border-color: hsl(var(--agala-ring));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-ring) / 0.2);
}

.triggerRowDisabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: hsl(var(--agala-muted));
}

.triggerRowError {
  border-color: hsl(var(--agala-danger));
}
.triggerRowError:focus-within {
  border-color: hsl(var(--agala-danger));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-danger) / 0.2);
}

/* Trigger sizes */
.triggerRowSm {
  height: var(--agala-height-sm);
  padding: 0 0.5rem;
  font-size: var(--agala-font-size-sm);
  border-radius: var(--agala-radius-sm);
}

.triggerRowMd {
  height: var(--agala-height-md);
  padding: 0 0.625rem;
}

.triggerRowLg {
  height: var(--agala-height-lg);
  padding: 0 0.875rem;
  font-size: var(--agala-font-size-lg);
  border-radius: var(--agala-radius-lg);
}

/* ── Trigger ── */
.trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-family: var(--agala-font-sans);
  font-size: inherit;
  line-height: var(--agala-line-height-normal);
  text-align: left;
  outline: none;
  cursor: inherit;
}

.trigger:focus {
  outline: none;
}

.triggerPlaceholder {
  color: hsl(var(--agala-muted-foreground));
}

.triggerSingleLabel {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Chevron ── */
.chevron {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: hsl(var(--agala-muted-foreground));
  transition: transform var(--agala-transition-fast);
}

.chevronOpen {
  transform: rotate(180deg);
}

/* ── Clear button ── */
.clearBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  transition: color var(--agala-transition-fast), background var(--agala-transition-fast);
}

.clearBtn:hover {
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-muted));
}

/* ── Chips ── */
.chips {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  min-width: 0;
  overflow: hidden;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  background-color: hsl(var(--agala-secondary));
  color: hsl(var(--agala-secondary-foreground));
  border-radius: var(--agala-radius-sm);
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.chipRemove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  height: 0.875rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--agala-transition-fast), background var(--agala-transition-fast);
}

.chipRemove:hover {
  opacity: 1;
  background: hsl(var(--agala-muted));
}

.moreChip {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  background-color: hsl(var(--agala-muted));
  color: hsl(var(--agala-muted-foreground));
  border-radius: var(--agala-radius-sm);
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

/* ── Dropdown ── */
.dropdown {
  box-sizing: border-box;
  z-index: var(--agala-z-dropdown);
  display: flex;
  flex-direction: column;
  max-height: min(24rem, 60vh);
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  overflow: hidden;
}

/* Search */
.searchWrapper {
  padding: 0.5rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.search {
  width: 100%;
  height: 2rem;
  padding: 0 0.5rem;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: var(--agala-radius-sm);
  background-color: hsl(var(--agala-input-background, var(--agala-background)));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  outline: none;
  transition: border-color var(--agala-transition-fast), box-shadow var(--agala-transition-fast);
}

.search::placeholder {
  color: hsl(var(--agala-muted-foreground));
}

.search:focus {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.15);
}

/* ── List ── */
.list {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Group header */
.groupHeader {
  padding: 0.375rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-muted-foreground));
  text-transform: uppercase;
  letter-spacing: var(--agala-letter-spacing-wide);
  user-select: none;
}

/* ── Option ── */
.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: calc(var(--agala-radius) - 4px);
  cursor: pointer;
  font-size: var(--agala-font-size-base);
  transition: background-color var(--agala-transition-fast);
}

.option:not(.optionDisabled):hover {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.optionHighlighted {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.optionSelected {
  background-color: hsl(var(--agala-primary) / 0.08);
  color: hsl(var(--agala-primary));
}

.optionSelected.optionHighlighted {
  background-color: hsl(var(--agala-primary) / 0.15);
}

.optionDisabled {
  cursor: default;
  opacity: 0.4;
}

/* Option content layout */
.optionContent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.optionText {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.optionLabel {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.optionSubtitle {
  font-size: var(--agala-font-size-sm);
  line-height: 1rem;
  color: currentColor;
  opacity: 0.7;
}

.optionHighlighted .optionSubtitle,
.optionSelected .optionSubtitle {
  color: inherit;
  opacity: 0.7;
}

/* Checkbox (multi-select) */
.checkBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 0.875rem;
  height: 0.875rem;
  border: var(--agala-border-width-thick) solid hsl(var(--agala-border));
  border-radius: 3px;
  background-color: transparent;
  transition: background-color var(--agala-transition-fast), border-color var(--agala-transition-fast);
}

.optionSelected .checkBox {
  background-color: hsl(var(--agala-primary));
  border-color: hsl(var(--agala-primary));
}

/* Radio (single-select) */
.radioBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 0.875rem;
  height: 0.875rem;
  border: var(--agala-border-width-thick) solid hsl(var(--agala-border));
  border-radius: 50%;
  background-color: transparent;
  transition: border-color var(--agala-transition-fast);
}

.optionSelected .radioBox {
  border-color: hsl(var(--agala-primary));
}

.radioDot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: hsl(var(--agala-primary));
}

/* ── Loading state ── */
.loadingState {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.625rem;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-normal);
}

.spinnerIcon {
  animation: agala-spin 0.8s linear infinite;
}

@keyframes agala-spin {
  to { transform: rotate(360deg); }
}

/* ── Messages ── */
.emptyMessage,
.maxMessage {
  padding: 0.75rem 0.625rem;
  text-align: center;
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-muted-foreground));
  line-height: var(--agala-line-height-normal);
}

.maxMessage {
  color: hsl(var(--agala-danger));
  font-size: var(--agala-font-size-sm);
  background-color: hsl(var(--agala-danger) / 0.05);
  border-radius: var(--agala-radius-sm);
  margin: 0.25rem 0.5rem;
  padding: 0.375rem 0.625rem;
}

/* Error below trigger */
.errorMessage {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
  line-height: var(--agala-line-height-normal);
  margin: 0;
  padding-top: 0.25rem;
}
</style>
