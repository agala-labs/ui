<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import { useChipDisplay } from '../../composables/useChipDisplay'
import { useKeyboardNav } from '../../composables/useKeyboardNav'
import { useDropdownPosition } from '../../composables/useDropdownPosition'
import { usePopoverBehavior } from '../../composables/usePopoverBehavior'
import type { CreatableSelectProps } from './types'

const props = withDefaults(defineProps<CreatableSelectProps>(), {
  disabled: false,
  creatable: true,
  labelKey: 'label',
  idKey: 'value',
  maxDisplayed: 3,
  debounce: 300,
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  create: [text: string]
  search: [query: string]
}>()

/* ─── Refs ─── */
const isOpen = ref(false)
const query = ref('')
const highlightedIdx = ref(0)
const wrapperRef = ref<HTMLDivElement>()
const triggerRef = ref<HTMLDivElement>()
const searchRef = ref<HTMLInputElement>()
const listRef = ref<HTMLUListElement>()
const floatingRef = ref<HTMLDivElement>()

/** Internal value for uncontrolled mode */
const internalValue = ref<string[]>([])

/* ─── Controlled / uncontrolled ─── */
const isControlled = computed(() => props.modelValue !== undefined)

const selectedValues = computed<string[]>(() => {
  if (isControlled.value) return props.modelValue!
  return internalValue.value
})

/* ─── Track labels for created items (not yet in options) ─── */
const createdLabels = ref<Map<string, string>>(new Map())

/* ─── Options as computed ref ─── */
const optionsRef = computed(() => props.options)

/* ─── Chip display with created label fallback ─── */
const { visibleChips, remainingCount } = useChipDisplay(
  selectedValues,
  optionsRef,
  props.labelKey,
  props.idKey,
  props.maxDisplayed,
  createdLabels
)

function removeChip(value: string) {
  const current = [...selectedValues.value]
  const idx = current.indexOf(value)
  if (idx !== -1) {
    updateValue(current.filter((v) => v !== value))
  }
}

/* ─── Filter logic ─── */
const filteredOptions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((o) => {
    const label = String(o[props.labelKey!] ?? o.label).toLowerCase()
    return label.includes(q)
  })
})

const exactMatch = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return false
  return props.options.some(
    (o) => String(o[props.labelKey!] ?? o.label).toLowerCase() === q
  )
})

const showCreateOption = computed(() => {
  return props.creatable && query.value.trim().length > 0 && !exactMatch.value
})

const createOptionLabel = computed(() => {
  const q = query.value.trim()
  return q ? `Crear "${q}"` : ''
})

/* ─── Flat items for keyboard nav ─── */
type FlatItemType = 'option' | 'create'

interface FlatItemEntry {
  type: FlatItemType
  label: string
  value: string
  disabled?: boolean
}

const flatItems = computed<FlatItemEntry[]>(() => {
  const items: FlatItemEntry[] = []

  if (showCreateOption.value) {
    items.push({
      type: 'create',
      label: createOptionLabel.value,
      value: query.value.trim(),
    })
  }

  for (const opt of filteredOptions.value) {
    items.push({
      type: 'option',
      label: String(opt[props.labelKey!] ?? opt.label),
      value: String(opt[props.idKey!] ?? opt.value),
      disabled: opt.disabled,
    })
  }

  return items
})

/* ─── Dropdown position ─── */
const { dropdownStyle, recompute } = useDropdownPosition(triggerRef, floatingRef)

/* ─── Helpers ─── */
function updateValue(newValue: string[]) {
  if (!isControlled.value) {
    internalValue.value = newValue
  }
  emit('update:modelValue', newValue)
}

function toggleOption(value: string) {
  const current = [...selectedValues.value]
  const idx = current.indexOf(value)
  if (idx >= 0) {
    updateValue(current.filter((v) => v !== value))
  } else {
    updateValue([...current, value])
  }
}

function isSelected(value: string) {
  return selectedValues.value.includes(value)
}

function closeDropdown() {
  isOpen.value = false
  query.value = ''
  highlightedIdx.value = 0
}

function openDropdown() {
  isOpen.value = true
  query.value = ''
  highlightedIdx.value = 0
  nextTick(() => requestAnimationFrame(() => recompute()))
}

function removeLastChip() {
  if (selectedValues.value.length > 0) {
    const last = selectedValues.value[selectedValues.value.length - 1]
    updateValue(selectedValues.value.filter((v) => v !== last))
  }
}

function highlightItem(idx: number, disabled: boolean | undefined) {
  if (!disabled) highlightedIdx.value = idx
}

function selectItem(idx: number, disabled: boolean | undefined) {
  if (!disabled) toggleOption(flatItems.value[idx].value)
}

function handleCreate(text: string) {
  createdLabels.value.set(text, text)
  emit('create', text)
  // Auto-select the newly created option
  const current = [...selectedValues.value]
  if (!current.includes(text)) {
    updateValue([...current, text])
  }
  closeDropdown()
}

/* ─── Keyboard navigation ─── */
interface KeyboardNavItem {
  type: FlatItemType
  label: string
  value: string
  disabled?: boolean
}

const { handleKeyDown } = useKeyboardNav(
  flatItems as unknown as { value: KeyboardNavItem[] },
  highlightedIdx,
  isOpen,
  {
    onSelect: (idx) => {
      const item = flatItems.value[idx]
      if (item) toggleOption(item.value)
    },
    onCreate: () => {
      const text = query.value.trim()
      if (text) handleCreate(text)
      else closeDropdown()
    },
    onClose: () => {
      closeDropdown()
      triggerRef.value?.focus()
    },
    onRemoveLast: removeLastChip,
  }
)

/* ─── Event handlers ─── */
function handleTriggerClick() {
  if (props.disabled) return
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
      if (isOpen.value) closeDropdown()
      else openDropdown()
      break
    case 'ArrowDown':
      e.preventDefault()
      openDropdown()
      break
    case 'ArrowUp':
      e.preventDefault()
      openDropdown()
      break
    case 'Escape':
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

function handleSearchInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value
  highlightedIdx.value = 0
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleSearchKeyDown(e: KeyboardEvent) {
  handleKeyDown(e)
  if (e.key === 'Escape') {
    query.value = ''
    triggerRef.value?.focus()
  }
}

/* ─── Watches ─── */
usePopoverBehavior(isOpen, wrapperRef, floatingRef, () => closeDropdown(), recompute)

// Focus search when opening
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => searchRef.value?.focus({ preventScroll: true }))
  }
})

watch(query, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (q.trim()) {
    debounceTimer = setTimeout(() => {
      emit('search', q.trim())
    }, props.debounce)
  }
})

watch(highlightedIdx, () => {
  if (!isOpen.value || !listRef.value) return
  const el = listRef.value.children[highlightedIdx.value] as HTMLElement | undefined
  el?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div ref="wrapperRef" class="wrapper" :class="$props.class">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      role="combobox"
      :tabindex="disabled ? -1 : 0"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      aria-controls="agala-creatable-listbox"
      :aria-disabled="disabled"
      class="triggerRow"
      :class="{
        triggerRowOpen: isOpen,
        triggerRowDisabled: disabled,
      }"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeyDown"
    >
      <!-- Chips -->
      <div v-if="visibleChips.length > 0" class="chips">
        <span
          v-for="chip in visibleChips"
          :key="chip.value"
          class="chip"
        >
          {{ chip.label }}
          <button
            type="button"
            tabindex="-1"
            class="chipRemove"
            :aria-label="`Remove ${chip.label}`"
            @click.stop="removeChip(chip.value)"
          >
            <AgalaIcon name="x" :size="10" />
          </button>
        </span>
        <span v-if="remainingCount > 0" class="moreChip">
          +{{ remainingCount }} more
        </span>
      </div>
      <span v-else class="triggerPlaceholder">{{ placeholder ?? 'Choose…' }}</span>

      <!-- Clear -->
      <button
        v-if="selectedValues.length > 0 && !disabled"
        type="button"
        tabindex="-1"
        class="clearBtn"
        aria-label="Clear selection"
        @click.stop="updateValue([])"
      >
        <AgalaIcon name="x" :size="12" />
      </button>

      <!-- Chevron -->
      <span class="chevron" :class="isOpen ? 'chevronOpen' : undefined" aria-hidden="true">
        <AgalaIcon name="chevron" :size="14" />
      </span>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="floatingRef"
        class="dropdown"
        :style="dropdownStyle"
      >
        <!-- Search -->
        <div class="searchWrapper">
          <input
            ref="searchRef"
            type="text"
            class="search"
            placeholder="Search or create…"
            :value="query"
            @input="handleSearchInput"
            @keydown="handleSearchKeyDown"
          />
        </div>

        <!-- List -->
        <ul
          ref="listRef"
          id="agala-creatable-listbox"
          class="list"
          role="listbox"
          tabindex="-1"
          @keydown="handleKeyDown"
        >
          <li v-if="flatItems.length === 0" class="emptyMessage">
            {{ query ? 'No results found.' : 'No options available.' }}
          </li>

          <template v-for="(item, idx) in flatItems" :key="`${item.type}-${item.value}-${idx}`">
            <!-- Create option -->
            <li
              v-if="item.type === 'create'"
              :id="`agala-create-opt-${idx}`"
              role="option"
              aria-selected="false"
              class="option createOption"
              :class="{ optionHighlighted: idx === highlightedIdx }"
              @mouseenter="highlightedIdx = idx"
              @click.stop="handleCreate(item.value)"
            >
              <span class="createIcon" aria-hidden="true">
                <AgalaIcon name="plus" :size="12" />
              </span>
              <span class="optionContent">
                <span class="createLabel">{{ item.label }}</span>
              </span>
            </li>

            <!-- Regular option -->
            <li
              v-else
              :id="`agala-opt-${idx}`"
              role="option"
              :aria-selected="isSelected(item.value)"
              :aria-disabled="item.disabled"
              class="option"
              :class="{
                optionHighlighted: idx === highlightedIdx,
                optionSelected: isSelected(item.value),
                optionDisabled: item.disabled,
              }"
              @mouseenter="highlightItem(idx, item.disabled)"
              @click.stop="selectItem(idx, item.disabled)"
            >
              <span class="checkBox" aria-hidden="true">
                <AgalaIcon v-if="isSelected(item.value)" name="check" :size="10" />
              </span>
              <span class="optionContent">
                <span class="optionLabel">{{ item.label }}</span>
              </span>
            </li>
          </template>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 160px;
}

/* ── Trigger Row ── */
.triggerRow {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-sizing: border-box;
  height: var(--agala-height-md);
  padding: 0 0.625rem;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: calc(var(--agala-radius) - 2px);
  background-color: hsl(var(--agala-background));
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

/* ── Chips ── */
.chips {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  min-width: 0;
  overflow: hidden;
  flex: 1;
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

.triggerPlaceholder {
  flex: 1;
  color: hsl(var(--agala-muted-foreground));
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
  background-color: hsl(var(--agala-background));
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

/* Option content */
.optionContent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.optionLabel {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Checkbox */
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

/* Create option */
.createOption {
  color: hsl(var(--agala-primary));
  font-weight: var(--agala-font-weight-medium);
}

.createOption.optionHighlighted {
  background-color: hsl(var(--agala-primary) / 0.08);
}

.createIcon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.createLabel {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Messages ── */
.emptyMessage {
  padding: 0.75rem 0.625rem;
  text-align: center;
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-muted-foreground));
  line-height: var(--agala-line-height-normal);
}
</style>
