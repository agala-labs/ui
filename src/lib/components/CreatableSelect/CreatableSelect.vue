<script setup lang="ts">
import { ref, computed, useId, watch, nextTick } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { AgalaIcon } from '../AgalaIcon'
import { useChipDisplay } from '../../composables/useChipDisplay'
import type { CreatableSelectProps } from './types'

const instanceId = useId()
const listboxId = `agala-creatable-listbox-${instanceId}`

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
const triggerRef = ref<HTMLDivElement>()

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

/* ─── Helpers ─── */
function updateValue(newValue: string[]) {
  if (!isControlled.value) {
    internalValue.value = newValue
  }
  emit('update:modelValue', newValue)
}

function handleRootValueChange(value: unknown) {
  updateValue(Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [])
}

function isSelected(value: string) {
  return selectedValues.value.includes(value)
}

function closeDropdown() {
  isOpen.value = false
  query.value = ''
}

function openDropdown() {
  isOpen.value = true
  query.value = ''
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

/* ─── Event handlers ─── */
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
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleCreateSelect(event: Event) {
  event.preventDefault()
  const text = query.value.trim()
  if (text) handleCreate(text)
}

/* ─── Watches ─── */
watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      document.getElementById(listboxId)?.querySelector<HTMLInputElement>('.search')?.focus({ preventScroll: true })
    })
  } else {
    query.value = ''
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

</script>

<template>
  <div
    class="wrapper"
    :class="$props.class"
  >
    <ComboboxRoot
      v-model:open="isOpen"
      :model-value="selectedValues"
      multiple
      ignore-filter
      :disabled="disabled"
      @update:model-value="handleRootValueChange"
    >
      <ComboboxAnchor as-child>
        <ComboboxTrigger
          as-child
          :disabled="disabled"
        >
          <div
            :id="inputId"
            ref="triggerRef"
            class="triggerRow"
            :class="{
              triggerRowOpen: isOpen,
              triggerRowDisabled: disabled,
            }"
            role="combobox"
            :tabindex="disabled ? -1 : 0"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            :aria-controls="listboxId"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledby"
            :aria-disabled="disabled"
            @keydown="handleTriggerKeyDown"
          >
            <div
              v-if="visibleChips.length > 0"
              class="chips"
            >
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
                  @pointerdown.stop
                  @click.stop="removeChip(chip.value)"
                >
                  <AgalaIcon
                    name="x"
                    :size="10"
                  />
                </button>
              </span>
              <span
                v-if="remainingCount > 0"
                class="moreChip"
              >
                +{{ remainingCount }} more
              </span>
            </div>
            <span
              v-else
              class="triggerPlaceholder"
            >{{ placeholder ?? 'Choose…' }}</span>

            <button
              v-if="selectedValues.length > 0 && !disabled"
              type="button"
              tabindex="-1"
              class="clearBtn"
              aria-label="Clear selection"
              @pointerdown.stop
              @click.stop="updateValue([])"
            >
              <AgalaIcon
                name="x"
                :size="12"
              />
            </button>

            <span
              class="chevron"
              :class="isOpen ? 'chevronOpen' : undefined"
              aria-hidden="true"
            >
              <AgalaIcon
                name="chevron"
                :size="14"
              />
            </span>
          </div>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxPortal>
        <div
          :id="listboxId"
          class="agala-creatable-select-portal"
          style="display: contents"
        >
          <ComboboxContent
            position="popper"
            align="start"
            class="dropdown"
          >
            <div class="searchWrapper">
              <ComboboxInput
                v-model="query"
                class="search"
                placeholder="Search or create…"
                @input="handleSearchInput"
              />
            </div>

            <ComboboxViewport
              as="ul"
              class="list"
            >
              <li
                v-if="!showCreateOption && filteredOptions.length === 0"
                class="emptyMessage"
              >
                {{ query ? 'No results found.' : 'No options available.' }}
              </li>

              <ComboboxItem
                v-if="showCreateOption"
                as="li"
                :value="query.trim()"
                :text-value="createOptionLabel"
                class="option createOption"
                @select="handleCreateSelect"
              >
                <span
                  class="createIcon"
                  aria-hidden="true"
                >
                  <AgalaIcon
                    name="plus"
                    :size="12"
                  />
                </span>
                <span class="optionContent">
                  <span class="createLabel">{{ createOptionLabel }}</span>
                </span>
              </ComboboxItem>

              <ComboboxItem
                v-for="option in filteredOptions"
                :key="String(option[props.idKey!] ?? option.value)"
                as="li"
                :value="String(option[props.idKey!] ?? option.value)"
                :text-value="String(option[props.labelKey!] ?? option.label)"
                :disabled="option.disabled"
                class="option"
                :class="{
                  optionSelected: isSelected(String(option[props.idKey!] ?? option.value)),
                  optionDisabled: option.disabled,
                }"
              >
                <span
                  class="checkBox"
                  aria-hidden="true"
                >
                  <AgalaIcon
                    v-if="isSelected(String(option[props.idKey!] ?? option.value))"
                    name="check"
                    :size="10"
                  />
                </span>
                <span class="optionContent">
                  <span class="optionLabel">{{ String(option[props.labelKey!] ?? option.label) }}</span>
                </span>
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxContent>
        </div>
      </ComboboxPortal>
    </ComboboxRoot>
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
  opacity: var(--agala-opacity-disabled);
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

/*
 * Reka teleports this content via its own internal <Teleport>, which Vue's
 * compiler can't see, so the scoped data-v-* attribute never lands on it.
 * These rules are marked :global() (scoped to .agala-creatable-select-portal,
 * a static class on the portal wrapper, to avoid colliding with the
 * similarly-named Select/DatePicker portal rules) so they still apply to
 * the portaled DOM.
 */

/* ── Dropdown ── */
:global(.agala-creatable-select-portal .dropdown) {
  margin: 0;
  box-sizing: border-box;
  z-index: var(--agala-z-dropdown);
  display: flex;
  flex-direction: column;
  width: var(--reka-combobox-trigger-width, auto);
  max-width: var(--reka-combobox-content-available-width, calc(100vw - 1rem));
  max-height: min(24rem, 60vh, var(--reka-combobox-content-available-height, 60vh));
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  overflow: hidden;
}

/* Search */
:global(.agala-creatable-select-portal .searchWrapper) {
  padding: 0.5rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

:global(.agala-creatable-select-portal .search) {
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

:global(.agala-creatable-select-portal .search::placeholder) {
  color: hsl(var(--agala-muted-foreground));
}

:global(.agala-creatable-select-portal .search:focus) {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.15);
}

/* ── List ── */
:global(.agala-creatable-select-portal .list) {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  overflow-y: auto;
  flex: 1;
}

/* ── Option ── */
:global(.agala-creatable-select-portal .option) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: calc(var(--agala-radius) - 4px);
  cursor: pointer;
  font-size: var(--agala-font-size-base);
  transition: background-color var(--agala-transition-fast);
}

:global(.agala-creatable-select-portal .option:not(.optionDisabled):hover) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-creatable-select-portal .optionHighlighted) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-creatable-select-portal .option[data-highlighted]) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-creatable-select-portal .optionSelected) {
  background-color: hsl(var(--agala-primary) / 0.08);
  color: hsl(var(--agala-primary));
}

:global(.agala-creatable-select-portal .optionSelected.optionHighlighted),
:global(.agala-creatable-select-portal .optionSelected[data-highlighted]) {
  background-color: hsl(var(--agala-primary) / 0.15);
}

:global(.agala-creatable-select-portal .optionDisabled) {
  cursor: default;
  opacity: 0.4;
}

/* Option content */
:global(.agala-creatable-select-portal .optionContent) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

:global(.agala-creatable-select-portal .optionLabel) {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Checkbox */
:global(.agala-creatable-select-portal .checkBox) {
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

:global(.agala-creatable-select-portal .optionSelected .checkBox) {
  background-color: hsl(var(--agala-primary));
  border-color: hsl(var(--agala-primary));
}

/* Create option */
:global(.agala-creatable-select-portal .createOption) {
  color: hsl(var(--agala-primary));
  font-weight: var(--agala-font-weight-medium);
}

:global(.agala-creatable-select-portal .createOption.optionHighlighted),
:global(.agala-creatable-select-portal .createOption[data-highlighted]) {
  background-color: hsl(var(--agala-primary) / 0.08);
}

:global(.agala-creatable-select-portal .createIcon) {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

:global(.agala-creatable-select-portal .createLabel) {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Messages ── */
:global(.agala-creatable-select-portal .emptyMessage) {
  padding: 0.75rem 0.625rem;
  text-align: center;
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-muted-foreground));
  line-height: var(--agala-line-height-normal);
}
</style>
