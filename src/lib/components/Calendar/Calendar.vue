<script setup lang="ts">
import { ref, computed, provide, watch, markRaw, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import { Button } from '../Button'
import { AgalaIcon } from '../AgalaIcon'
import CalendarMonthView from './CalendarMonthView.vue'
import CalendarWeekView from './CalendarWeekView.vue'
import CalendarDayView from './CalendarDayView.vue'
import CalendarListView from './CalendarListView.vue'
import type { CalendarEvent, CalendarView, CalendarProps, CalendarEmits } from './types'
import { addDays, parseISO, toISODate } from './utils'
import { formatMonthYear, formatFullDate } from '../../composables/useDateUtils'

/* ── Props / Emits ── */
const props = withDefaults(defineProps<CalendarProps>(), {
  events: () => [],
  view: 'month',
  currentDate: () => toISODate(new Date()),
  dayStart: '00:00',
  dayEnd: '24:00',
  snapMinutes: 30,
  availableViews: undefined,
  hideHeader: false,
  class: '',
})

const emit = defineEmits<CalendarEmits>()

/* ── Internal state ── */
const internalView = ref<CalendarView>(props.view)
const internalDate = ref<string>(props.currentDate)

watch(() => props.view, (v) => {
  if (!v) return
  const allowed = effectiveViews.value.map(o => o.value)
  if (allowed.includes(v)) {
    if (v !== internalView.value) internalView.value = v
  } else {
    // Override to first allowed view when parent sets an excluded view
    const fallback = allowed[0]
    if (fallback && fallback !== internalView.value) {
      internalView.value = fallback
    }
  }
})

watch(() => props.currentDate, (v) => {
  if (v && v !== internalDate.value) internalDate.value = v
})

watch(internalView, (v) => {
  if (v !== props.view) emit('update:view', v)
})

/* ── availableViews changed at runtime ── */
watch(() => props.availableViews, () => {
  const allowed = effectiveViews.value.map(o => o.value)
  if (!allowed.includes(internalView.value)) {
    const fallback = allowed[0]
    if (fallback) {
      internalView.value = fallback
    }
  }
})

watch(internalDate, (v) => {
  if (v !== props.currentDate) emit('update:currentDate', v)
})

/* ── View map ── */
const viewComponents: Record<CalendarView, Component> = {
  month: markRaw(CalendarMonthView),
  week: markRaw(CalendarWeekView),
  day: markRaw(CalendarDayView),
  list: markRaw(CalendarListView),
}

const viewComponent = computed(() => viewComponents[internalView.value])

/* ── View options ── */
interface ViewOption {
  value: CalendarView
  label: string
  icon: 'grid' | 'columns' | 'clock' | 'list'
}

const viewOptions: ViewOption[] = [
  { value: 'month', label: 'Month', icon: 'grid' },
  { value: 'week', label: 'Week', icon: 'columns' },
  { value: 'day', label: 'Day', icon: 'clock' },
  { value: 'list', label: 'List', icon: 'list' },
]

/* ── Effective views (filtered by availableViews) ── */
const ALL_VIEWS: CalendarView[] = ['month', 'week', 'day', 'list']

const effectiveViews = computed<ViewOption[]>(() => {
  if (!props.availableViews || props.availableViews.length === 0) {
    return viewOptions
  }

  const warned = new Set<string>()
  const allowed = new Set<CalendarView>()

  for (const v of props.availableViews) {
    if (ALL_VIEWS.includes(v)) {
      allowed.add(v)
    } else if (!warned.has(v)) {
      warned.add(v)
      console.warn(`[Agala UI] Calendar: invalid view "${v}" in availableViews. Valid values are: month, week, day, list.`)
    }
  }

  // If all values were invalid (allowed is empty), fall back to all views
  if (allowed.size === 0) {
    return viewOptions
  }

  return viewOptions.filter(option => allowed.has(option.value))
})

/* ── Title ── */
const title = computed(() => {
  const date = parseISO(`${internalDate.value}T00:00:00`)
  if (!date) return ''

  switch (internalView.value) {
    case 'month':
      return formatMonthYear(date)
    case 'week': {
      const sunday = new Date(date)
      sunday.setDate(date.getDate() - date.getDay())
      sunday.setHours(0, 0, 0, 0)
      const saturday = new Date(sunday)
      saturday.setDate(sunday.getDate() + 6)
      const sameMonth = sunday.getMonth() === saturday.getMonth()
      const sameYear = sunday.getFullYear() === saturday.getFullYear()
      if (sameMonth && sameYear) {
        return `${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${saturday.toLocaleDateString(undefined, { day: 'numeric' })}, ${saturday.getFullYear()}`
      } else if (sameYear) {
        return `${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${saturday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${saturday.getFullYear()}`
      } else {
        return `${sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – ${saturday.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
    }
    case 'day':
      return formatFullDate(date)
    case 'list':
      return 'Upcoming'
    default:
      return ''
  }
})

/* ── Current time ── */
const now = ref(new Date())
let nowInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = new Date()
  nowInterval = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (nowInterval) clearInterval(nowInterval)
})

provide('calendar-now', now)

/* ── Navigation helpers ── */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() !== day) {
    d.setDate(0)
  }
  return d
}

function shiftDate(direction: -1 | 1) {
  const date = parseISO(`${internalDate.value}T00:00:00`)
  if (!date) return

  let next: Date
  switch (internalView.value) {
    case 'month':
      next = addMonths(date, direction)
      break
    case 'week':
    case 'list':
      next = addDays(date, direction * 7)
      break
    case 'day':
      next = addDays(date, direction)
      break
  }

  internalDate.value = toISODate(next)
}

function goPrev() {
  shiftDate(-1)
}

function goNext() {
  shiftDate(1)
}

/* ── Event forwarding ── */
function handleSelect(event: CalendarEvent) {
  emit('select', event)
}

function handleDayClick(date: string) {
  emit('day-click', date)
}

function handleSlotSelect(payload: { start: string; end: string }) {
  emit('slot-select', payload)
}
</script>

<template>
  <div :class="['calendar', props.class]">
    <!-- Header -->
    <slot name="header">
      <template v-if="!hideHeader">
      <div class="calendarHeader">
        <!-- Left: nav + title -->
        <div class="calendarNav">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous period"
            @click="goPrev"
          >
            <AgalaIcon name="chevron-left" :size="16" />
          </Button>
          <h2 class="calendarTitle">{{ title }}</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next period"
            @click="goNext"
          >
            <AgalaIcon name="chevron-right" :size="16" />
          </Button>
        </div>

        <!-- Right: view switcher -->
        <div
          class="calendarViews"
          role="group"
          aria-label="Calendar views"
        >
          <Button
            v-for="option in effectiveViews"
            :key="option.value"
            :variant="internalView === option.value ? 'default' : 'outline'"
            size="sm"
            :aria-label="`${option.label} view`"
            @click="internalView = option.value"
          >
            <AgalaIcon :name="option.icon" :size="14" />
            <span class="viewLabel">{{ option.label }}</span>
          </Button>
        </div>
      </div>
      </template>
    </slot>

    <!-- Body -->
    <div class="calendarBody">
      <component
        :is="viewComponent"
        :events="props.events"
        :current-date="internalDate"
        :day-start="props.dayStart"
        :day-end="props.dayEnd"
        :snap-minutes="props.snapMinutes"
        @select="handleSelect"
        @day-click="handleDayClick"
        @slot-select="handleSlotSelect"
      >
        <template v-if="$slots.event" #event="slotProps">
          <slot name="event" v-bind="slotProps" />
        </template>
        <template v-if="$slots['empty-day'] && internalView !== 'list'" #empty-day="slotProps">
          <slot name="empty-day" v-bind="slotProps" />
        </template>
      </component>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: var(--agala-font-sans);
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-card));
}

.calendarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: var(--agala-calendar-header-padding, 0.75rem 1rem);
  border-bottom: var(--agala-calendar-header-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.calendarNav {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.25rem;
}

.calendarTitle {
  min-width: 0;
  font-size: var(--agala-calendar-title-size, var(--agala-font-size-lg));
  font-weight: var(--agala-calendar-title-weight, var(--agala-font-weight-semibold));
  color: hsl(var(--agala-foreground));
  line-height: 1.25;
  margin: 0 0.5rem;
}

.calendarViews {
  display: flex;
  align-items: center;
  gap: var(--agala-calendar-views-gap, 0.25rem);
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.calendarViews::-webkit-scrollbar {
  display: none;
}

.viewLabel {
  display: none;
}

@media (min-width: 768px) {
  .viewLabel {
    display: inline;
  }
}

@media (max-width: 639px) {
  .calendarHeader {
    align-items: stretch;
    padding: 0.625rem;
  }

  .calendarNav {
    width: 100%;
    justify-content: space-between;
  }

  .calendarTitle {
    flex: 1;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .calendarViews {
    width: 100%;
  }

  .calendarViews > :deep(*) {
    flex: 1 0 auto;
  }
}

.calendarBody {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
</style>
