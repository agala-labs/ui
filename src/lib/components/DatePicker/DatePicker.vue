<script setup lang="ts">
import { computed, ref, shallowRef, useId, watch } from 'vue'
import { parseDate, type CalendarDate } from '@internationalized/date'
import type { DateValue } from 'reka-ui/date'
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  DatePickerCalendar,
  DatePickerCellTrigger,
  DatePickerContent,
  DatePickerNext,
  DatePickerPrev,
  DatePickerRoot,
  DatePickerTrigger,
  CalendarHeader,
} from 'reka-ui'
import { AgalaIcon } from '../AgalaIcon'
import type { DatePickerSize } from './types'

const instanceId = useId()
const gridId = `agala-date-grid-${instanceId}`
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
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const isOpen = ref(false)
const isYearPanelOpen = ref(false)

function parseValue(value?: string): CalendarDate | undefined {
  if (!value) return undefined
  try { return parseDate(value) } catch { return undefined }
}
function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
function monthValue(value?: string) {
  if (!value) return undefined
  return parseValue(`${value.slice(0, 7)}-01`)
}

const selectedDate = computed(() => parseValue(props.modelValue))
const minDate = computed(() => parseValue(props.min))
const maxDate = computed(() => parseValue(props.max))
const placeholderDate = shallowRef<DateValue>(monthValue(props.displayMonth) ?? selectedDate.value ?? parseValue(todayISO())!)

watch(() => props.displayMonth, value => {
  const next = monthValue(value)
  if (next) placeholderDate.value = next
}, { immediate: true })
watch(() => props.modelValue, value => {
  if (!props.displayMonth) {
    const next = parseValue(value)
    if (next) placeholderDate.value = next
  }
})
watch(isOpen, value => { if (!value) isYearPanelOpen.value = false })

const viewYear = computed({
  get: () => placeholderDate.value.year,
  set: (year: number) => setPlaceholder({ year, day: 1 }),
})
const viewMonth = computed({
  get: () => placeholderDate.value.month - 1,
  set: (month: number) => setPlaceholder({ month: month + 1, day: 1 }),
})
const yearOptions = computed(() => {
  const min = minDate.value?.year ?? new Date().getFullYear() - 100
  const max = maxDate.value?.year ?? new Date().getFullYear() + 100
  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
})
const displayValue = computed(() => {
  const date = parseValue(props.modelValue)
  if (!date) return ''
  return new Date(date.year, date.month - 1, date.day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
const triggerRowCls = computed(() => [
  'triggerRow',
  `triggerRow${props.size.charAt(0).toUpperCase()}${props.size.slice(1)}`,
  isOpen.value ? 'triggerRowOpen' : undefined,
  props.disabled ? 'triggerRowDisabled' : undefined,
  props.error ? 'triggerRowError' : undefined,
].filter(Boolean).join(' '))

function setPlaceholder(changes: { year?: number; month?: number; day?: number }) {
  const next = (placeholderDate.value as CalendarDate).set(changes)
  handlePlaceholderUpdate(next)
}
function handlePlaceholderUpdate(value: DateValue) {
  placeholderDate.value = value
  emit('update:displayMonth', `${value.year}-${String(value.month).padStart(2, '0')}`)
}
function isMonthDisabled(month: number) {
  const first = parseDate(`${viewYear.value}-${String(month + 1).padStart(2, '0')}-01`)
  const lastDay = new Date(viewYear.value, month + 1, 0).getDate()
  const last = parseDate(`${viewYear.value}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
  return !!(minDate.value && last.compare(minDate.value) < 0) || !!(maxDate.value && first.compare(maxDate.value) > 0)
}
function isYearDisabled(year: number) {
  const first = parseDate(`${year}-01-01`)
  const last = parseDate(`${year}-12-31`)
  return !!(minDate.value && last.compare(minDate.value) < 0) || !!(maxDate.value && first.compare(maxDate.value) > 0)
}
function selectYear(year: number) {
  if (isYearDisabled(year)) return
  viewYear.value = year
  isYearPanelOpen.value = false
}
function yearCellCls(year: number) {
  return ['yearCell', viewYear.value === year ? 'yearCellSelected' : undefined, isYearDisabled(year) ? 'yearCellDisabled' : undefined].filter(Boolean).join(' ')
}
function handleTriggerKeyDown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    isOpen.value = !isOpen.value
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    isOpen.value = true
  } else if (event.key === 'Escape') {
    event.preventDefault()
    isOpen.value = false
  }
}
function handleDateUpdate(value: DateValue | undefined) {
  emit('update:modelValue', value?.toString() ?? '')
  isYearPanelOpen.value = false
}
function clear() {
  emit('update:modelValue', '')
  isOpen.value = false
}
function isHighlighted(day: DateValue) {
  return props.highlightDates?.includes(day.toString())
}
function cellCls(day: DateValue, outsideView: boolean, selected: boolean, today: boolean, disabled: boolean) {
  return [
    'dayCell',
    outsideView ? 'dayCellOther' : undefined,
    selected ? 'dayCellSelected' : undefined,
    today ? 'dayCellToday' : undefined,
    disabled ? 'dayCellDisabled' : undefined,
    isHighlighted(day) ? 'dayCellHighlighted' : undefined,
  ].filter(Boolean).join(' ')
}
</script>

<template>
  <DatePickerRoot
    :model-value="selectedDate"
    :placeholder="placeholderDate"
    :min-value="minDate"
    :max-value="maxDate"
    :disabled="disabled"
    :open="inline ? undefined : isOpen"
    :close-on-select="!inline"
    prevent-deselect
    :week-starts-on="0"
    weekday-format="short"
    fixed-weeks
    @update:model-value="handleDateUpdate"
    @update:placeholder="handlePlaceholderUpdate"
    @update:open="isOpen = $event"
  >
    <DatePickerTrigger
      v-if="!inline"
      as-child
    >
      <div
        :id="inputId || undefined"
        :class="triggerRowCls"
        role="combobox"
        aria-haspopup="grid"
        :aria-expanded="isOpen"
        :aria-controls="gridId"
        :aria-disabled="disabled"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :tabindex="disabled ? -1 : 0"
        @keydown="handleTriggerKeyDown"
      >
        <span class="triggerLabel">
          <AgalaIcon
            name="calendar"
            :size="14"
          />
          <span :class="displayValue ? 'triggerValue' : 'triggerPlaceholder'">{{ displayValue || placeholder }}</span>
        </span>
        <span
          class="chevron"
          :class="isOpen ? 'chevronOpen' : undefined"
          aria-hidden="true"
        ><AgalaIcon
          name="chevron"
          :size="14"
        /></span>
      </div>
    </DatePickerTrigger>

    <template v-if="inline">
      <div
        :id="gridId"
        class="inlinePanel"
        :class="props.class"
        role="grid"
        aria-label="Calendar"
      >
        <DatePickerCalendar v-slot="{ grid }">
          <CalendarHeader
            class="header"
            as="div"
          >
            <DatePickerPrev as-child>
              <button
                type="button"
                class="navBtn"
                aria-label="Previous month"
              >
                <AgalaIcon
                  name="chevron"
                  :size="14"
                />
              </button>
            </DatePickerPrev>
            <div class="headerSelects">
              <div class="selectWrapper">
                <select
                  v-model="viewMonth"
                  class="nativeSelect monthSelect"
                >
                  <option
                    v-for="(label, index) in MONTH_LABELS"
                    :key="index"
                    :value="index"
                    :disabled="isMonthDisabled(index)"
                  >
                    {{ label }}
                  </option>
                </select><AgalaIcon
                  name="chevron"
                  :size="12"
                  class="selectChevron"
                />
              </div>
              <div class="selectWrapper yearPanelWrapper">
                <button
                  type="button"
                  class="nativeSelect yearTrigger yearSelect"
                  :aria-expanded="isYearPanelOpen"
                  aria-haspopup="listbox"
                  @click.stop="isYearPanelOpen = !isYearPanelOpen"
                >
                  {{ viewYear }}<AgalaIcon
                    name="chevron"
                    :size="12"
                    class="selectChevron"
                    :class="isYearPanelOpen ? 'selectChevronOpen' : ''"
                  />
                </button><div
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
            <DatePickerNext as-child>
              <button
                type="button"
                class="navBtn navBtnNext"
                aria-label="Next month"
              >
                <AgalaIcon
                  name="chevron"
                  :size="14"
                />
              </button>
            </DatePickerNext>
          </CalendarHeader>
          <CalendarGrid class="calendarGrid">
            <CalendarGridHead class="weekdays">
              <CalendarGridRow>
                <CalendarHeadCell
                  v-for="day in WEEKDAYS"
                  :key="day"
                  class="weekday"
                >
                  {{ day }}
                </CalendarHeadCell>
              </CalendarGridRow>
            </CalendarGridHead>
            <CalendarGridBody class="days">
              <CalendarGridRow
                v-for="(week, weekIndex) in grid[0]?.rows || []"
                :key="weekIndex"
                class="week"
              >
                <CalendarCell
                  v-for="day in week"
                  :key="day.toString()"
                  :date="day"
                  class="dayCellWrapper"
                >
                  <DatePickerCellTrigger
                    v-slot="{ dayValue, disabled: dayDisabled, selected, today, outsideView }"
                    :day="day"
                    :month="grid[0].value"
                    as-child
                  >
                    <button
                      type="button"
                      :class="cellCls(day, outsideView, selected, today, dayDisabled)"
                      :disabled="dayDisabled"
                    >
                      {{ dayValue }}
                    </button>
                  </DatePickerCellTrigger>
                </CalendarCell>
              </CalendarGridRow>
            </CalendarGridBody>
          </CalendarGrid>
          <div
            v-if="clearable && modelValue"
            class="footer"
          >
            <button
              type="button"
              class="clearBtn"
              @click="clear"
            >
              Clear
            </button>
          </div>
        </DatePickerCalendar>
      </div>
    </template>

    <DatePickerContent
      v-else
      :id="gridId"
      as-child
      side="bottom"
      align="start"
      :side-offset="4"
      :collision-padding="8"
    >
      <div
        :id="gridId"
        class="dropdown"
        role="grid"
        aria-label="Calendar"
      >
        <DatePickerCalendar v-slot="{ grid }">
          <CalendarHeader
            class="header"
            as="div"
          >
            <DatePickerPrev as-child>
              <button
                type="button"
                class="navBtn"
                aria-label="Previous month"
              >
                <AgalaIcon
                  name="chevron"
                  :size="14"
                />
              </button>
            </DatePickerPrev>
            <div class="headerSelects">
              <div class="selectWrapper">
                <select
                  v-model="viewMonth"
                  class="nativeSelect monthSelect"
                >
                  <option
                    v-for="(label, index) in MONTH_LABELS"
                    :key="index"
                    :value="index"
                    :disabled="isMonthDisabled(index)"
                  >
                    {{ label }}
                  </option>
                </select><AgalaIcon
                  name="chevron"
                  :size="12"
                  class="selectChevron"
                />
              </div>
              <div class="selectWrapper yearPanelWrapper">
                <button
                  type="button"
                  class="nativeSelect yearTrigger yearSelect"
                  :aria-expanded="isYearPanelOpen"
                  aria-haspopup="listbox"
                  @click.stop="isYearPanelOpen = !isYearPanelOpen"
                >
                  {{ viewYear }}<AgalaIcon
                    name="chevron"
                    :size="12"
                    class="selectChevron"
                    :class="isYearPanelOpen ? 'selectChevronOpen' : ''"
                  />
                </button><div
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
            <DatePickerNext as-child>
              <button
                type="button"
                class="navBtn navBtnNext"
                aria-label="Next month"
              >
                <AgalaIcon
                  name="chevron"
                  :size="14"
                />
              </button>
            </DatePickerNext>
          </CalendarHeader>
          <CalendarGrid class="calendarGrid">
            <CalendarGridHead class="weekdays">
              <CalendarGridRow>
                <CalendarHeadCell
                  v-for="day in WEEKDAYS"
                  :key="day"
                  class="weekday"
                >
                  {{ day }}
                </CalendarHeadCell>
              </CalendarGridRow>
            </CalendarGridHead>
            <CalendarGridBody class="days">
              <CalendarGridRow
                v-for="(week, weekIndex) in grid[0]?.rows || []"
                :key="weekIndex"
                class="week"
              >
                <CalendarCell
                  v-for="day in week"
                  :key="day.toString()"
                  :date="day"
                  class="dayCellWrapper"
                >
                  <DatePickerCellTrigger
                    v-slot="{ dayValue, disabled: dayDisabled, selected, today, outsideView }"
                    :day="day"
                    :month="grid[0].value"
                    as-child
                  >
                    <button
                      type="button"
                      :class="cellCls(day, outsideView, selected, today, dayDisabled)"
                      :disabled="dayDisabled"
                    >
                      {{ dayValue }}
                    </button>
                  </DatePickerCellTrigger>
                </CalendarCell>
              </CalendarGridRow>
            </CalendarGridBody>
          </CalendarGrid>
          <div
            v-if="clearable && modelValue"
            class="footer"
          >
            <button
              type="button"
              class="clearBtn"
              @click="clear"
            >
              Clear
            </button>
          </div>
        </DatePickerCalendar>
      </div>
    </DatePickerContent>

    <p
      v-if="!inline && errorMessage"
      class="errorMessage"
    >
      {{ errorMessage }}
    </p>
  </DatePickerRoot>
</template>

<style scoped>
.triggerRow { display:flex; align-items:center; justify-content:space-between; gap:.5rem; width:100%; border:var(--agala-border-width) solid hsl(var(--agala-input)); border-radius:calc(var(--agala-radius) - 2px); background-color:hsl(var(--agala-input-background, var(--agala-background))); color:hsl(var(--agala-foreground)); cursor:pointer; transition:border-color var(--agala-transition-fast), box-shadow var(--agala-transition-fast); outline:none; }
.triggerRow:focus-visible { outline:none; box-shadow:0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring)); }
.triggerRow:hover:not(.triggerRowDisabled) { border-color:hsl(var(--agala-border)); }
.triggerRowOpen { border-color:hsl(var(--agala-ring)); box-shadow:0 0 0 1px hsl(var(--agala-background)), 0 0 0 3px hsl(var(--agala-ring) / .2); }
.triggerRowDisabled { cursor:not-allowed; opacity:.5; background-color:hsl(var(--agala-muted)); }
.triggerRowError { border-color:hsl(var(--agala-danger)); }
.triggerRowError:focus-visible { border-color:hsl(var(--agala-danger)); box-shadow:0 0 0 1px hsl(var(--agala-background)), 0 0 0 3px hsl(var(--agala-danger) / .2); }
.triggerRowSm { height:var(--agala-height-sm); padding:0 .5rem; font-size:var(--agala-font-size-sm); border-radius:var(--agala-radius-sm); }
.triggerRowMd { height:var(--agala-height-md); padding:0 .625rem; }
.triggerRowLg { height:var(--agala-height-lg); padding:0 .875rem; font-size:var(--agala-font-size-lg); border-radius:var(--agala-radius-lg); }
.triggerLabel { display:flex; align-items:center; gap:.5rem; flex:1; min-width:0; overflow:hidden; }
.triggerValue { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.triggerPlaceholder { color:hsl(var(--agala-muted-foreground)); }
.chevron { display:inline-flex; align-items:center; flex-shrink:0; color:hsl(var(--agala-muted-foreground)); transition:transform var(--agala-transition-fast); }
.chevronOpen { transform:rotate(180deg); }
.dropdown { box-sizing:border-box; z-index:var(--agala-z-dropdown); display:flex; flex-direction:column; width:280px; max-width:var(--agala-floating-available-width, calc(100vw - 1rem)); max-height:var(--agala-floating-available-height, calc(100dvh - 1rem)); background-color:hsl(var(--agala-popover)); color:hsl(var(--agala-popover-foreground)); border:var(--agala-border-width) solid hsl(var(--agala-border)); border-radius:calc(var(--agala-radius) - 2px); box-shadow:var(--agala-shadow-md); overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; padding:.5rem; }
.inlinePanel { width:280px; }
.header { display:flex; align-items:center; justify-content:space-between; padding:.25rem .25rem .5rem; margin-bottom:.25rem; border-bottom:var(--agala-border-width) solid hsl(var(--agala-border)); }
.headerSelects { display:flex; align-items:center; gap:.5rem; flex:1; justify-content:center; }
.selectWrapper { position:relative; display:inline-flex; align-items:center; }
.nativeSelect { appearance:none; -webkit-appearance:none; background:transparent; border:1px solid hsl(var(--agala-border)); border-radius:var(--agala-radius-sm); padding:.25rem 1.5rem .25rem .5rem; font-size:var(--agala-font-size-sm); font-family:var(--agala-font-sans); color:hsl(var(--agala-foreground)); cursor:pointer; transition:border-color var(--agala-transition-fast), background-color var(--agala-transition-fast); outline:none; }
.nativeSelect:hover { border-color:hsl(var(--agala-border)); background-color:hsl(var(--agala-muted)); }
.nativeSelect:focus-visible { border-color:hsl(var(--agala-ring)); box-shadow:0 0 0 2px hsl(var(--agala-ring) / .2); }
.yearSelect { padding-right:1.25rem; min-width:4.5rem; }
.selectChevron { position:absolute; right:.375rem; pointer-events:none; color:hsl(var(--agala-muted-foreground)); }
.selectChevronOpen { transform:rotate(180deg); }
.yearPanelWrapper { position:relative; }
.yearTrigger { display:inline-flex; align-items:center; gap:.25rem; }
.yearPanel { position:absolute; top:calc(100% + 4px); left:0; right:0; max-height:200px; overflow-y:auto; z-index:10; background-color:hsl(var(--agala-popover)); border:var(--agala-border-width) solid hsl(var(--agala-border)); border-radius:calc(var(--agala-radius) - 2px); box-shadow:var(--agala-shadow-md); padding:.25rem; display:flex; flex-direction:column; gap:.125rem; }
.yearCell { display:flex; align-items:center; justify-content:center; height:2rem; width:100%; border:none; border-radius:var(--agala-radius-sm); background:transparent; color:hsl(var(--agala-foreground)); font-size:var(--agala-font-size-sm); font-family:var(--agala-font-sans); cursor:pointer; }
.yearCell:hover:not(.yearCellDisabled):not(.yearCellSelected) { background-color:hsl(var(--agala-accent)); color:hsl(var(--agala-accent-foreground)); }
.yearCellSelected { background-color:hsl(var(--agala-primary)); color:hsl(var(--agala-primary-foreground)); font-weight:var(--agala-font-weight-medium); }
.yearCell:focus-visible { outline:none; box-shadow:0 0 0 2px hsl(var(--agala-ring) / .3); }
.yearCellDisabled { cursor:default; opacity:.35; pointer-events:none; }
.navBtn { display:inline-flex; align-items:center; justify-content:center; width:1.75rem; height:1.75rem; border:none; border-radius:var(--agala-radius-sm); background:transparent; color:hsl(var(--agala-muted-foreground)); cursor:pointer; transition:color var(--agala-transition-fast), background-color var(--agala-transition-fast); }
.navBtn:hover:not(:disabled) { color:hsl(var(--agala-foreground)); background-color:hsl(var(--agala-muted)); }
.navBtn:disabled, .navBtn[data-disabled] { opacity:.4; cursor:not-allowed; }
.navBtnNext { transform:rotate(180deg); }
.calendarGrid { width:100%; border-collapse:separate; border-spacing:.125rem; }
.weekdays { padding:.25rem 0; }
.weekday { height:1.75rem; font-size:.6875rem; font-weight:var(--agala-font-weight-semibold); color:hsl(var(--agala-muted-foreground)); text-transform:uppercase; user-select:none; }
.days { }
.week { }
.dayCellWrapper { padding:0; text-align:center; }
.dayCell { position:relative; display:inline-flex; align-items:center; justify-content:center; height:2rem; width:2rem; border:none; border-radius:var(--agala-radius-sm); background:transparent; color:hsl(var(--agala-foreground)); font-size:var(--agala-font-size-sm); font-family:var(--agala-font-sans); cursor:pointer; transition:background-color var(--agala-transition-fast), color var(--agala-transition-fast); }
.dayCell:hover:not(:disabled):not(.dayCellSelected) { background-color:hsl(var(--agala-accent)); color:hsl(var(--agala-accent-foreground)); }
.dayCell:focus-visible { outline:none; box-shadow:0 0 0 2px hsl(var(--agala-ring) / .3); }
.dayCellOther { color:hsl(var(--agala-muted-foreground)); opacity:.6; }
.dayCellToday { font-weight:var(--agala-font-weight-semibold); color:hsl(var(--agala-primary)); box-shadow:inset 0 0 0 1.5px hsl(var(--agala-primary) / .4); }
.dayCellSelected { background-color:hsl(var(--agala-primary)); color:hsl(var(--agala-primary-foreground)); font-weight:var(--agala-font-weight-medium); }
.dayCellSelected:hover { background-color:hsl(var(--agala-primary) / .9); }
.dayCellDisabled { cursor:default; opacity:.35; pointer-events:none; }
.dayCellHighlighted::after { content:''; position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:hsl(var(--agala-primary)); }
.dayCellHighlighted.dayCellSelected::after { background:hsl(var(--agala-primary-foreground)); }
.footer { display:flex; justify-content:center; padding-top:.5rem; margin-top:.25rem; border-top:var(--agala-border-width) solid hsl(var(--agala-border)); }
.clearBtn { display:inline-flex; align-items:center; justify-content:center; padding:.25rem .75rem; border:none; border-radius:var(--agala-radius-sm); background:transparent; color:hsl(var(--agala-muted-foreground)); font-size:var(--agala-font-size-sm); font-weight:var(--agala-font-weight-medium); cursor:pointer; }
.clearBtn:hover { color:hsl(var(--agala-danger)); background-color:hsl(var(--agala-danger) / .05); }
.errorMessage { font-size:var(--agala-font-size-sm); color:hsl(var(--agala-danger)); line-height:var(--agala-line-height-normal); margin:0; padding-top:.25rem; }
</style>
