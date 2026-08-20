<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'reka-ui'
import { AgalaIcon } from '../AgalaIcon'
import type { SelectOption, SelectSize } from './types'

const instanceId = useId()
const listboxId = `agala-select-listbox-${instanceId}`

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
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
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

/** Internal value for uncontrolled mode */
const internalValue = ref<string | string[]>(props.multiple ? [] : '')

const triggerRef = ref<HTMLDivElement>()

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

const groupedOptions = computed(() => {
  const groups = new Map<string, SelectOption[]>()
  for (const option of filteredOptions.value) {
    const group = option.group ?? ''
    groups.set(group, [...(groups.get(group) ?? []), option])
  }
  return Array.from(groups, ([label, options]) => ({ label, options }))
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

const rootComponent = computed(() => props.searchable ? ComboboxRoot : SelectRoot)
const triggerComponent = computed(() => props.searchable ? ComboboxTrigger : SelectTrigger)
const portalComponent = computed(() => props.searchable ? ComboboxPortal : SelectPortal)
const contentComponent = computed(() => props.searchable ? ComboboxContent : SelectContent)
const viewportComponent = computed(() => props.searchable ? ComboboxViewport : SelectViewport)
const groupComponent = computed(() => props.searchable ? ComboboxGroup : SelectGroup)
const labelComponent = computed(() => props.searchable ? ComboboxLabel : SelectLabel)
const itemComponent = computed(() => props.searchable ? ComboboxItem : SelectItem)

const rootModelValue = computed<string | string[] | undefined>(() => {
  if (props.multiple) {
    return Array.isArray(selectedValue.value) ? selectedValue.value : []
  }
  const value = selectedValue.value as string
  return value || undefined
})

/* ─── Class helpers ─── */
const triggerRowCls = computed(() => [
  'triggerRow',
  `triggerRow${props.size.charAt(0).toUpperCase()}${props.size.slice(1)}`,
  isOpen.value ? 'triggerRowOpen' : undefined,
  (props.disabled || props.loading) ? 'triggerRowDisabled' : undefined,
  props.error ? 'triggerRowError' : undefined,
].filter(Boolean).join(' '))

/* ─── Helpers ─── */
function isSelected(value: string) {
  return selectedSet.value.has(value)
}

function updateValue(newValue: string | string[]) {
  if (!isControlled.value) {
    internalValue.value = newValue
  }
  emit('update:modelValue', newValue)
}

function handleRootValueChange(value: unknown) {
  if (props.multiple) {
    updateValue(Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === 'string')
      : [])
  } else {
    updateValue(typeof value === 'string' ? value : '')
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
}

function optionCls(option: SelectOption): string {
  const selected = isSelected(option.value)
  const selectable = !option.disabled && !(isMaxed.value && !selected && props.multiple)
  return [
    'option',
    selected ? 'optionSelected' : undefined,
    !selectable ? 'optionDisabled' : undefined,
  ].filter(Boolean).join(' ')
}

function handleItemSelect(event: Event, option: SelectOption) {
  if (option.disabled || (isMaxed.value && !isSelected(option.value) && props.multiple)) {
    event.preventDefault()
  }
}

/* ─── Event handlers ─── */
function handleTriggerKeyDown(e: KeyboardEvent) {
  if (props.disabled || props.loading) return
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
  const q = (e.target as HTMLInputElement).value
  query.value = q
  props.onSearch?.(q)
}

/* ─── Watches ─── */
watch(isOpen, (open) => {
  if (open && props.searchable) {
    nextTick(() => {
      document.getElementById(listboxId)?.querySelector<HTMLInputElement>('.search')?.focus({ preventScroll: true })
    })
  } else if (!open) {
    query.value = ''
  }
})
</script>

<template>
  <div
    class="wrapper"
    :class="[wrapperClass, $props.class]"
  >
    <component
      :is="rootComponent"
      v-model:open="isOpen"
      :model-value="rootModelValue"
      :multiple="multiple"
      :disabled="disabled || loading"
      :ignore-filter="searchable"
      @update:model-value="handleRootValueChange"
    >
      <ComboboxAnchor as-child>
        <component
          :is="triggerComponent"
          as-child
          :disabled="disabled || loading"
        >
          <div
            :id="inputId"
            ref="triggerRef"
            :class="triggerRowCls"
            role="combobox"
            :tabindex="disabled || loading ? -1 : 0"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            :aria-controls="listboxId"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledby"
            :aria-disabled="disabled || loading"
            @keydown="handleTriggerKeyDown"
          >
            <span
              v-if="multiple && selectedOptions.length > 0"
              class="chips"
            >
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
                  :aria-label="`Remove ${opt.label}`"
                  @pointerdown.stop
                  @click.stop="clearChip(opt.value)"
                >
                  <AgalaIcon
                    name="x"
                    :size="10"
                  />
                </button>
              </span>
              <span
                v-if="selectedOptions.length > maxDisplayed"
                class="moreChip"
              >
                +{{ selectedOptions.length - maxDisplayed }} more
              </span>
            </span>
            <span
              v-else-if="!multiple && selectedOptions.length > 0"
              class="triggerSingleLabel"
            >
              {{ selectedOptions[0].label }}
            </span>
            <span
              v-else
              class="triggerPlaceholder"
            >{{ placeholder }}</span>

            <button
              v-if="showClear"
              type="button"
              tabindex="-1"
              class="clearBtn"
              aria-label="Clear selection"
              @pointerdown.stop
              @click.stop="clearAll"
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
        </component>
      </ComboboxAnchor>

      <component :is="portalComponent">
        <div
          :id="listboxId"
          class="agala-select-portal"
          style="display: contents"
        >
          <component
            :is="contentComponent"
            position="popper"
            align="start"
            class="dropdown"
            :aria-multiselectable="multiple || undefined"
          >
            <div
              v-if="searchable"
              class="searchWrapper"
            >
              <ComboboxInput
                v-model="query"
                class="search"
                placeholder="Search…"
                @input="handleSearchInput"
              />
            </div>

            <div
              v-if="isMaxed"
              class="maxMessage"
              role="alert"
            >
              Max {{ maxSelections }} selections
            </div>

            <component
              :is="viewportComponent"
              as="ul"
              class="list"
            >
              <li
                v-if="loading"
                class="loadingState"
              >
                <AgalaIcon
                  name="spinner"
                  :size="16"
                  class="spinnerIcon"
                />
                Searching…
              </li>
              <li
                v-else-if="filteredOptions.length === 0"
                class="emptyMessage"
              >
                {{ query ? 'No results found.' : 'No options available.' }}
              </li>

              <template
                v-for="group in groupedOptions"
                :key="group.label || '__ungrouped'"
              >
                <component
                  :is="groupComponent"
                  v-if="group.label"
                  class="optionGroup"
                >
                  <component
                    :is="labelComponent"
                    class="groupHeader"
                  >
                    {{ group.label }}
                  </component>
                  <component
                    :is="itemComponent"
                    v-for="option in group.options"
                    :key="option.value"
                    as="li"
                    :value="option.value"
                    :text-value="option.label"
                    :disabled="option.disabled || (isMaxed && !isSelected(option.value) && multiple)"
                    :class="optionCls(option)"
                    @select="handleItemSelect($event, option)"
                  >
                    <span
                      v-if="multiple"
                      class="checkBox"
                      aria-hidden="true"
                    >
                      <AgalaIcon
                        v-if="isSelected(option.value)"
                        name="check"
                        :size="10"
                      />
                    </span>
                    <span
                      v-else
                      class="radioBox"
                      aria-hidden="true"
                    >
                      <span
                        v-if="isSelected(option.value)"
                        class="radioDot"
                      />
                    </span>
                    <span class="optionContent">
                      <span class="optionText">
                        <span class="optionLabel">{{ option.label }}</span>
                        <span
                          v-if="option.subtitle"
                          class="optionSubtitle"
                        >{{ option.subtitle }}</span>
                      </span>
                    </span>
                  </component>
                </component>

                <template v-else>
                  <component
                    :is="itemComponent"
                    v-for="option in group.options"
                    :key="option.value"
                    as="li"
                    :value="option.value"
                    :text-value="option.label"
                    :disabled="option.disabled || (isMaxed && !isSelected(option.value) && multiple)"
                    :class="optionCls(option)"
                    @select="handleItemSelect($event, option)"
                  >
                    <span
                      v-if="multiple"
                      class="checkBox"
                      aria-hidden="true"
                    >
                      <AgalaIcon
                        v-if="isSelected(option.value)"
                        name="check"
                        :size="10"
                      />
                    </span>
                    <span
                      v-else
                      class="radioBox"
                      aria-hidden="true"
                    >
                      <span
                        v-if="isSelected(option.value)"
                        class="radioDot"
                      />
                    </span>
                    <span class="optionContent">
                      <span class="optionText">
                        <span class="optionLabel">{{ option.label }}</span>
                        <span
                          v-if="option.subtitle"
                          class="optionSubtitle"
                        >{{ option.subtitle }}</span>
                      </span>
                    </span>
                  </component>
                </template>
              </template>
            </component>
          </component>
        </div>
      </component>
    </component>

    <p
      v-if="errorMessage"
      class="errorMessage"
    >
      {{ errorMessage }}
    </p>
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
  opacity: var(--agala-opacity-disabled);
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

/*
 * Reka teleports this content via its own internal <Teleport>, which Vue's
 * compiler can't see, so the scoped data-v-* attribute never lands on it.
 * These rules are marked :global() (scoped to .agala-select-portal, a
 * static class on the portal wrapper, to avoid colliding with the
 * similarly-named CreatableSelect/DatePicker portal rules) so they still
 * apply to the portaled DOM.
 */

/* ── Dropdown ── */
:global(.agala-select-portal .dropdown) {
  margin: 0;
  box-sizing: border-box;
  z-index: var(--agala-z-dropdown);
  display: flex;
  flex-direction: column;
  width: var(--reka-select-trigger-width, var(--reka-combobox-trigger-width, auto));
  max-width: var(--reka-select-content-available-width, var(--reka-combobox-content-available-width, calc(100vw - 1rem)));
  max-height: min(24rem, 60vh, var(--reka-select-content-available-height, var(--reka-combobox-content-available-height, 60vh)));
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  overflow: hidden;
}

/* Search */
:global(.agala-select-portal .searchWrapper) {
  padding: 0.5rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

:global(.agala-select-portal .search) {
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

:global(.agala-select-portal .search::placeholder) {
  color: hsl(var(--agala-muted-foreground));
}

:global(.agala-select-portal .search:focus) {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.15);
}

/* ── List ── */
:global(.agala-select-portal .list) {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Group header */
:global(.agala-select-portal .groupHeader) {
  padding: 0.375rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-muted-foreground));
  text-transform: uppercase;
  letter-spacing: var(--agala-letter-spacing-wide);
  user-select: none;
}

/* ── Option ── */
:global(.agala-select-portal .option) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: calc(var(--agala-radius) - 4px);
  cursor: pointer;
  font-size: var(--agala-font-size-base);
  transition: background-color var(--agala-transition-fast);
}

:global(.agala-select-portal .option:not(.optionDisabled):hover) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-select-portal .optionHighlighted) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-select-portal .option[data-highlighted]) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

:global(.agala-select-portal .optionSelected) {
  background-color: hsl(var(--agala-primary) / 0.08);
  color: hsl(var(--agala-primary));
}

:global(.agala-select-portal .optionSelected.optionHighlighted),
:global(.agala-select-portal .optionSelected[data-highlighted]) {
  background-color: hsl(var(--agala-primary) / 0.15);
}

:global(.agala-select-portal .optionDisabled) {
  cursor: default;
  opacity: 0.4;
}

/* Option content layout */
:global(.agala-select-portal .optionContent) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

:global(.agala-select-portal .optionText) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

:global(.agala-select-portal .optionLabel) {
  line-height: var(--agala-line-height-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.agala-select-portal .optionSubtitle) {
  font-size: var(--agala-font-size-sm);
  line-height: 1rem;
  color: currentColor;
  opacity: 0.7;
}

:global(.agala-select-portal .optionHighlighted .optionSubtitle),
:global(.agala-select-portal .optionSelected .optionSubtitle) {
  color: inherit;
  opacity: 0.7;
}

/* Checkbox (multi-select) */
:global(.agala-select-portal .checkBox) {
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

:global(.agala-select-portal .optionSelected .checkBox) {
  background-color: hsl(var(--agala-primary));
  border-color: hsl(var(--agala-primary));
}

/* Radio (single-select) */
:global(.agala-select-portal .radioBox) {
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

:global(.agala-select-portal .optionSelected .radioBox) {
  border-color: hsl(var(--agala-primary));
}

:global(.agala-select-portal .radioDot) {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: hsl(var(--agala-primary));
}

/* ── Loading state ── */
:global(.agala-select-portal .loadingState) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.625rem;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-normal);
}

:global(.agala-select-portal .spinnerIcon) {
  animation: agala-spin 0.8s linear infinite;
}

@keyframes agala-spin {
  to { transform: rotate(360deg); }
}

/* ── Messages ── */
:global(.agala-select-portal .emptyMessage),
:global(.agala-select-portal .maxMessage) {
  padding: 0.75rem 0.625rem;
  text-align: center;
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-muted-foreground));
  line-height: var(--agala-line-height-normal);
}

:global(.agala-select-portal .maxMessage) {
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
