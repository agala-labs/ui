<script setup lang="ts">
import { ref, computed, watch, nextTick, useId } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import { useFloatingOverlay } from '../../composables/useFloatingOverlay'
import { usePopoverBehavior } from '../../composables/usePopoverBehavior'
import type { DatePickerSize } from './types'

const instanceId = useId()

const props = withDefaults(defineProps<{
  modelValue?: string
  size?: DatePickerSize
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  placeholder?: string
  min?: string
  max?: string
  clearable?: boolean
  inline?: boolean
  highlightDates?: string[]
  displayMonth?: string
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
  class?: string
}>(), {
  size: 'md',
  disabled: false,
  error: false,
  placeholder: 'Pick a date',
  clearable: false,
  inline: false,
  highlightDates: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:displayMonth': [value: string]
}>()

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/* State */
const isOpen = ref(false)
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const focusedDate = ref(props.modelValue || todayISO())
const hoverDay = ref('')
const wrapperRef = ref<HTMLDivElement>()
const triggerRef = ref<HTMLDivElement>()
const floatingRef = ref<HTMLDivElement>()
const isYearPanelOpen = ref(false)

const { floatingStyles } = useFloatingOverlay(triggerRef, floatingRef, isOpen, {
  placement: 'bottom-start',
})

/* Computed */
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const d = parseISO(props.modelValue)
  if (!d) return ''
  return formatDisplay(d)
})

const yearOptions = computed(() => {
  const min = props.min ? parseISO(props.min)?.getFullYear() : undefined
  const max = props.max ? parseISO(props.max)?.getFullYear() : undefined
  const start = min ?? new Date().getFullYear() - 100
  const end = max ?? new Date().getFullYear() + 100
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

interface DayCell {
  dateISO: string
  dayNum: number
  currentMonth: boolean
  selected: boolean
  disabled: boolean
  focused: boolean
  today: boolean
  ariaLabel: string
}

const grid = computed((): DayCell[][] => {
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const startDay = firstOfMonth.getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()

  const days: DayCell[] = []
  const today = todayISO()

  // prev month padding
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(viewYear.value, viewMonth.value - 1, prevMonthDays - i)
    days.push(makeCell(d, false, today))
  }

  // current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(viewYear.value, viewMonth.value, i)
    days.push(makeCell(d, true, today))
  }

  // next month padding (fill to 42 cells = 6 weeks)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(viewYear.value, viewMonth.value + 1, i)
    days.push(makeCell(d, false, today))
  }

  // chunk into weeks
  const weeks: DayCell[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

const triggerRowCls = computed(() => [
  'triggerRow',
  `triggerRow${props.size.charAt(0).toUpperCase()}${props.size.slice(1)}`,
  isOpen.value ? 'triggerRowOpen' : undefined,
  props.disabled ? 'triggerRowDisabled' : undefined,
  props.error ? 'triggerRowError' : undefined,
].filter(Boolean).join(' '))

/* Helpers */
function makeCell(d: Date, currentMonth: boolean, todayISO: string): DayCell {
  const iso = toISO(d)
  const selected = props.modelValue === iso
  const disabled = isDisabled(iso)
  const focused = focusedDate.value === iso
  const today = iso === todayISO
  return {
    dateISO: iso,
    dayNum: d.getDate(),
    currentMonth,
    selected,
    disabled,
    focused,
    today,
    ariaLabel: d.toDateString(),
  }
}

function isDisabled(iso: string): boolean {
  if (props.min && iso < props.min) return true
  if (props.max && iso > props.max) return true
  return false
}

function isMonthDisabled(monthIndex: number): boolean {
  const year = viewYear.value
  const firstISO = toISO(new Date(year, monthIndex, 1))
  const lastISO = toISO(new Date(year, monthIndex + 1, 0))
  if (props.min && lastISO < props.min) return true
  if (props.max && firstISO > props.max) return true
  return false
}

function isYearDisabled(year: number): boolean {
  const firstISO = toISO(new Date(year, 0, 1))
  const lastISO = toISO(new Date(year, 11, 31))
  if (props.min && lastISO < props.min) return true
  if (props.max && firstISO > props.max) return true
  return false
}

function selectYear(year: number) {
  if (isYearDisabled(year)) return
  viewYear.value = year
  isYearPanelOpen.value = false
}

function yearCellCls(year: number): string {
  const selected = viewYear.value === year
  const disabled = isYearDisabled(year)
  return [
    'yearCell',
    selected ? 'yearCellSelected' : undefined,
    disabled ? 'yearCellDisabled' : undefined,
  ].filter(Boolean).join(' ')
}

function closeYearPanelOnClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const panel = wrapperRef.value?.querySelector('.yearPanel')
  const trigger = wrapperRef.value?.querySelector('.yearTrigger')
  if (panel && !panel.contains(target) && trigger && !trigger.contains(target)) {
    isYearPanelOpen.value = false
  }
}

function todayISO(): string {
  return toISO(new Date())
}

function toISO(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseISO(s: string): Date | null {
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return date
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function selectDay(day: DayCell) {
  if (day.disabled) return
  emit('update:modelValue', day.dateISO)
  isYearPanelOpen.value = false
  if (!props.inline) close()
}

function clear() {
  emit('update:modelValue', '')
  close()
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  if (props.modelValue) {
    const d = parseISO(props.modelValue)
    if (d) {
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
      focusedDate.value = props.modelValue
    }
  } else {
    const t = new Date()
    viewYear.value = t.getFullYear()
    viewMonth.value = t.getMonth()
    focusedDate.value = todayISO()
  }
  nextTick(() => {
    const el = wrapperRef.value?.querySelector('[tabindex="0"]') as HTMLElement | null
    el?.focus({ preventScroll: true })
  })
}

function close() {
  isOpen.value = false
  isYearPanelOpen.value = false
}

function handleTriggerClick() {
  if (props.disabled) return
  if (isOpen.value) close()
  else open()
}

function handleTriggerKeyDown(e: KeyboardEvent) {
  if (props.disabled) return
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (isOpen.value) close()
      else open()
      break
    case 'ArrowDown':
      e.preventDefault()
      open()
      break
    case 'Escape':
      close()
      break
  }
}

function handleGridKeyDown(e: KeyboardEvent) {
  e.stopPropagation()
  if (!isOpen.value && !props.inline) return

  if (isYearPanelOpen.value) {
    const panel = wrapperRef.value?.querySelector('.yearPanel')
    const buttons = panel ? Array.from(panel.querySelectorAll('.yearCell')) as HTMLElement[] : []
    const activeIndex = buttons.findIndex(btn => btn === document.activeElement)

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        if (activeIndex > 0) {
          buttons[activeIndex - 1]?.focus()
        } else if (buttons.length > 0) {
          buttons[0]?.focus()
        }
        return
      case 'ArrowDown':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < buttons.length - 1) {
          buttons[activeIndex + 1]?.focus()
        } else if (buttons.length > 0) {
          buttons[buttons.length - 1]?.focus()
        }
        return
      case 'Enter':
        if (activeIndex !== -1) {
          e.preventDefault()
          selectYear(Number(buttons[activeIndex].textContent?.trim()))
        }
        return
      case 'Escape':
        e.preventDefault()
        isYearPanelOpen.value = false
        return
    }
  }

  let d = parseISO(focusedDate.value) || new Date()
  let changed = false

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      d.setDate(d.getDate() - 1)
      changed = true
      break
    case 'ArrowRight':
      e.preventDefault()
      d.setDate(d.getDate() + 1)
      changed = true
      break
    case 'ArrowUp':
      e.preventDefault()
      d.setDate(d.getDate() - 7)
      changed = true
      break
    case 'ArrowDown':
      e.preventDefault()
      d.setDate(d.getDate() + 7)
      changed = true
      break
    case 'Home':
      e.preventDefault()
      d.setDate(1)
      changed = true
      break
    case 'End':
      e.preventDefault()
      d.setDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())
      changed = true
      break
    case 'PageUp':
      e.preventDefault()
      d.setMonth(d.getMonth() - 1)
      changed = true
      break
    case 'PageDown':
      e.preventDefault()
      d.setMonth(d.getMonth() + 1)
      changed = true
      break
    case 'Enter':
    case ' ': {
      e.preventDefault()
      const iso = toISO(d)
      if (!isDisabled(iso)) {
        emit('update:modelValue', iso)
        if (!props.inline) close()
      }
      return
    }
    case 'Escape':
      if (!props.inline) close()
      return
  }

  if (changed) {
    focusedDate.value = toISO(d)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth()
    nextTick(() => {
      const el = wrapperRef.value?.querySelector('[tabindex="0"]') as HTMLElement | null
      el?.focus({ preventScroll: true })
    })
  }
}

function cellCls(day: DayCell): string {
  const isHighlighted = props.highlightDates?.includes(day.dateISO)
  return [
    'dayCell',
    !day.currentMonth ? 'dayCellOther' : undefined,
    day.selected ? 'dayCellSelected' : undefined,
    day.today ? 'dayCellToday' : undefined,
    day.disabled ? 'dayCellDisabled' : undefined,
    day.focused && !day.selected ? 'dayCellFocused' : undefined,
    hoverDay.value === day.dateISO && !day.disabled && !day.selected ? 'dayCellHover' : undefined,
    isHighlighted ? 'dayCellHighlighted' : undefined,
  ].filter(Boolean).join(' ')
}

watch(isYearPanelOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', closeYearPanelOnClickOutside)
    nextTick(() => {
      const panel = wrapperRef.value?.querySelector('.yearPanel') as HTMLElement | null
      const selectedBtn = panel?.querySelector('.yearCellSelected') as HTMLElement | null
      selectedBtn?.scrollIntoView({ block: 'center', behavior: 'auto' })
    })
  } else {
    document.removeEventListener('mousedown', closeYearPanelOnClickOutside)
  }
})

/* click outside + scroll close */
usePopoverBehavior(isOpen, wrapperRef, floatingRef, () => close())

/* Watchers for displayMonth */
watch(() => props.displayMonth, (val) => {
  if (val) {
    const [y, m] = val.split('-').map(Number)
    if (y && m !== undefined) {
      viewYear.value = y
      viewMonth.value = m - 1
    }
  }
}, { immediate: true })

watch([viewYear, viewMonth], () => {
  const val = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}`
  emit('update:displayMonth', val)
})

</script>

<template>
  <div v-if="inline" ref="wrapperRef" class="inlinePanel" :class="$props.class" @keydown="handleGridKeyDown" :id="`agala-date-grid-${instanceId}`" role="grid" aria-label="Calendar">
    <div class="header">
      <button type="button" class="navBtn" @click="prevMonth" aria-label="Previous month">
        <AgalaIcon name="chevron" :size="14" />
      </button>
      <div class="headerSelects">
        <div class="selectWrapper">
          <select v-model="viewMonth" class="nativeSelect monthSelect">
            <option v-for="(label, i) in MONTH_LABELS" :key="i" :value="i" :disabled="isMonthDisabled(i)">
              {{ label }}
            </option>
          </select>
          <AgalaIcon name="chevron" :size="12" class="selectChevron" />
        </div>
        <div class="selectWrapper yearPanelWrapper">
          <button
            type="button"
            class="nativeSelect yearTrigger yearSelect"
            @click.stop="isYearPanelOpen = !isYearPanelOpen"
            :aria-expanded="isYearPanelOpen"
            aria-haspopup="listbox"
          >
            {{ viewYear }}
            <AgalaIcon name="chevron" :size="12" class="selectChevron" :class="isYearPanelOpen ? 'selectChevronOpen' : ''" />
          </button>
          <div
            v-if="isYearPanelOpen"
            class="yearPanel"
            role="listbox"
            aria-label="Years"
          >
            <button
              v-for="year in yearOptions"
              :key="year"
              type="button"
              role="option"
              :class="yearCellCls(year)"
              :aria-selected="viewYear === year"
              :aria-disabled="isYearDisabled(year)"
              @click="selectYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
      <button type="button" class="navBtn navBtnNext" @click="nextMonth" aria-label="Next month">
        <AgalaIcon name="chevron" :size="14" />
      </button>
    </div>

    <div class="weekdays" role="row">
      <div v-for="d in WEEKDAYS" :key="d" class="weekday" role="columnheader" :aria-label="d">
        {{ d }}
      </div>
    </div>

    <div class="days" role="rowgroup">
      <div v-for="(week, wi) in grid" :key="wi" class="week" role="row">
        <button
          v-for="day in week"
          :key="day.dateISO"
          type="button"
          role="gridcell"
          :aria-selected="day.selected"
          :aria-disabled="day.disabled"
          :aria-label="day.ariaLabel"
          :class="cellCls(day)"
          :tabindex="day.focused ? 0 : -1"
          @click="selectDay(day)"
          @mouseenter="hoverDay = day.dateISO"
          @mouseleave="hoverDay = ''"
        >
          {{ day.dayNum }}
        </button>
      </div>
    </div>

    <div v-if="clearable && modelValue" class="footer">
      <button type="button" class="clearBtn" @click="clear">
        Clear
      </button>
    </div>
  </div>
  <div v-else ref="wrapperRef" class="wrapper" :class="$props.class">
    <div ref="triggerRef" :class="triggerRowCls" @click="handleTriggerClick" @keydown="handleTriggerKeyDown" tabindex="0" role="combobox" :aria-expanded="isOpen" aria-haspopup="grid" :id="inputId" :aria-label="ariaLabel" :aria-labelledby="ariaLabelledby" :aria-controls="`agala-date-grid-${instanceId}`" :aria-disabled="disabled">
      <span class="triggerLabel">
        <AgalaIcon name="calendar" :size="14" />
        <span :class="displayValue ? 'triggerValue' : 'triggerPlaceholder'">
          {{ displayValue || placeholder }}
        </span>
      </span>
      <span class="chevron" :class="isOpen ? 'chevronOpen' : undefined" aria-hidden="true">
        <AgalaIcon name="chevron" :size="14" />
      </span>
    </div>

      <div v-if="isOpen" ref="floatingRef" class="dropdown" popover="manual" :style="floatingStyles" :id="`agala-date-grid-${instanceId}`" role="grid" aria-label="Calendar" @keydown="handleGridKeyDown">
        <div class="header">
          <button type="button" class="navBtn" @click="prevMonth" aria-label="Previous month">
            <AgalaIcon name="chevron" :size="14" />
          </button>
      <div class="headerSelects">
              <div class="selectWrapper">
                <select v-model="viewMonth" class="nativeSelect monthSelect">
                  <option v-for="(label, i) in MONTH_LABELS" :key="i" :value="i" :disabled="isMonthDisabled(i)">
                    {{ label }}
                  </option>
                </select>
                <AgalaIcon name="chevron" :size="12" class="selectChevron" />
              </div>
              <div class="selectWrapper yearPanelWrapper">
                <button
                  type="button"
                  class="nativeSelect yearTrigger yearSelect"
                  @click.stop="isYearPanelOpen = !isYearPanelOpen"
                  :aria-expanded="isYearPanelOpen"
                  aria-haspopup="listbox"
                >
                  {{ viewYear }}
                  <AgalaIcon name="chevron" :size="12" class="selectChevron" :class="isYearPanelOpen ? 'selectChevronOpen' : ''" />
                </button>
                <div
                  v-if="isYearPanelOpen"
                  class="yearPanel"
                  role="listbox"
                  aria-label="Years"
                >
                  <button
                    v-for="year in yearOptions"
                    :key="year"
                    type="button"
                    role="option"
                    :class="yearCellCls(year)"
                    :aria-selected="viewYear === year"
                    :aria-disabled="isYearDisabled(year)"
                    @click="selectYear(year)"
                  >
                    {{ year }}
                  </button>
                </div>
              </div>
            </div>
          <button type="button" class="navBtn navBtnNext" @click="nextMonth" aria-label="Next month">
            <AgalaIcon name="chevron" :size="14" />
          </button>
        </div>

        <div class="weekdays" role="row">
          <div v-for="d in WEEKDAYS" :key="d" class="weekday" role="columnheader" :aria-label="d">
            {{ d }}
          </div>
        </div>

        <div class="days" role="rowgroup">
          <div v-for="(week, wi) in grid" :key="wi" class="week" role="row">
            <button
              v-for="day in week"
              :key="day.dateISO"
              type="button"
              :role="'gridcell'"
              :aria-selected="day.selected"
              :aria-disabled="day.disabled"
              :aria-label="day.ariaLabel"
              :class="cellCls(day)"
              :tabindex="day.focused ? 0 : -1"
              @click="selectDay(day)"
              @mouseenter="hoverDay = day.dateISO"
              @mouseleave="hoverDay = ''"
            >
              {{ day.dayNum }}
            </button>
          </div>
        </div>

        <div v-if="clearable && modelValue" class="footer">
          <button type="button" class="clearBtn" @click="clear">
            Clear
          </button>
        </div>
      </div>

    <p v-if="errorMessage" class="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Trigger ── */
.triggerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: calc(var(--agala-radius) - 2px);
  background-color: hsl(var(--agala-input-background, var(--agala-background)));
  color: hsl(var(--agala-foreground));
  cursor: pointer;
  transition: border-color var(--agala-transition-fast), box-shadow var(--agala-transition-fast);
  outline: none;
}

.triggerRow:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring));
}

.triggerRow:hover:not(.triggerRowDisabled) {
  border-color: hsl(var(--agala-border));
}

.triggerRowOpen {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 1px hsl(var(--agala-background)), 0 0 0 3px hsl(var(--agala-ring) / 0.2);
}

.triggerRowDisabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: hsl(var(--agala-muted));
}

.triggerRowError {
  border-color: hsl(var(--agala-danger));
}
.triggerRowError:focus-visible {
  border-color: hsl(var(--agala-danger));
  box-shadow: 0 0 0 1px hsl(var(--agala-background)), 0 0 0 3px hsl(var(--agala-danger) / 0.2);
}

.triggerRowSm { height: var(--agala-height-sm); padding: 0 0.5rem; font-size: var(--agala-font-size-sm); border-radius: var(--agala-radius-sm); }
.triggerRowMd { height: var(--agala-height-md); padding: 0 0.625rem; }
.triggerRowLg { height: var(--agala-height-lg); padding: 0 0.875rem; font-size: var(--agala-font-size-lg); border-radius: var(--agala-radius-lg); }

.triggerLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.triggerValue {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.triggerPlaceholder {
  color: hsl(var(--agala-muted-foreground));
}

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

/* ── Dropdown ── */
.dropdown {
  position: fixed;
  inset: auto;
  margin: 0;
  box-sizing: border-box;
  z-index: var(--agala-z-dropdown);
  display: flex;
  flex-direction: column;
  width: 280px;
  max-width: var(--agala-floating-available-width, calc(100vw - 1rem));
  max-height: var(--agala-floating-available-height, calc(100dvh - 1rem));
  background-color: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.headerSelects {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}
.selectWrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.nativeSelect {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-sm);
  padding: 0.25rem 1.5rem 0.25rem 0.5rem;
  font-size: var(--agala-font-size-sm);
  font-family: var(--agala-font-sans);
  color: hsl(var(--agala-foreground));
  cursor: pointer;
  transition: border-color var(--agala-transition-fast), background-color var(--agala-transition-fast);
  outline: none;
}
.nativeSelect:hover {
  border-color: hsl(var(--agala-border));
  background-color: hsl(var(--agala-muted));
}
.nativeSelect:focus-visible {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.2);
}
.nativeSelect option:disabled {
  opacity: 0.4;
  color: hsl(var(--agala-muted-foreground));
}
.yearSelect {
  padding-right: 1.25rem;
  min-width: 4.5rem;
}
.selectChevron {
  position: absolute;
  right: 0.375rem;
  pointer-events: none;
  color: hsl(var(--agala-muted-foreground));
}
.selectChevronOpen {
  transform: rotate(180deg);
}

.yearPanelWrapper {
  position: relative;
}
.yearTrigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.yearPanel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  background-color: hsl(var(--agala-popover));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.yearCell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 100%;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-foreground));
  font-size: var(--agala-font-size-sm);
  font-family: var(--agala-font-sans);
  cursor: pointer;
  transition: background-color var(--agala-transition-fast), color var(--agala-transition-fast);
}
.yearCell:hover:not(.yearCellDisabled):not(.yearCellSelected) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}
.yearCellSelected {
  background-color: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
  font-weight: var(--agala-font-weight-medium);
}
.yearCellSelected:hover {
  background-color: hsl(var(--agala-primary) / 0.9);
}
.yearCell:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}
.yearCellDisabled {
  cursor: default;
  opacity: 0.35;
  pointer-events: none;
}

.navBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  transition: color var(--agala-transition-fast), background-color var(--agala-transition-fast);
}

.navBtn:hover {
  color: hsl(var(--agala-foreground));
  background-color: hsl(var(--agala-muted));
}

.navBtnNext {
  transform: rotate(180deg);
}

/* Weekdays */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.125rem;
  padding: 0.25rem 0;
}

.weekday {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-muted-foreground));
  text-transform: uppercase;
  user-select: none;
}

/* Days grid */
.days {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.125rem;
}

.dayCell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 2rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-foreground));
  font-size: var(--agala-font-size-sm);
  font-family: var(--agala-font-sans);
  cursor: pointer;
  transition: background-color var(--agala-transition-fast), color var(--agala-transition-fast);
}

.dayCell:hover:not(.dayCellDisabled):not(.dayCellSelected) {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.dayCell:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

.dayCellOther {
  color: hsl(var(--agala-muted-foreground));
  opacity: 0.6;
}

.dayCellToday {
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-primary));
}

.dayCellToday:not(.dayCellSelected) {
  box-shadow: inset 0 0 0 1.5px hsl(var(--agala-primary) / 0.4);
}

.dayCellSelected {
  background-color: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
  font-weight: var(--agala-font-weight-medium);
}

.dayCellSelected:hover {
  background-color: hsl(var(--agala-primary) / 0.9);
}

.dayCellDisabled {
  cursor: default;
  opacity: 0.35;
  pointer-events: none;
}

.dayCellFocused:not(.dayCellSelected) {
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

.dayCellHover:not(.dayCellDisabled):not(.dayCellSelected):not(.dayCellFocused) {
  background-color: hsl(var(--agala-accent));
}

/* Inline panel */
.inlinePanel {
  width: 280px;
}

/* Highlighted dot */
.dayCellHighlighted::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(var(--agala-primary));
}

.dayCellHighlighted.dayCellSelected::after {
  background: hsl(var(--agala-primary-foreground));
}

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
  margin-top: 0.25rem;
  border-top: var(--agala-border-width) solid hsl(var(--agala-border));
}

.clearBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  cursor: pointer;
  transition: color var(--agala-transition-fast), background-color var(--agala-transition-fast);
}

.clearBtn:hover {
  color: hsl(var(--agala-danger));
  background-color: hsl(var(--agala-danger) / 0.05);
}

/* Error */
.errorMessage {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
  line-height: var(--agala-line-height-normal);
  margin: 0;
  padding-top: 0.25rem;
}
</style>
