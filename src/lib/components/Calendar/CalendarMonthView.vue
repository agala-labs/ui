<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { CalendarEvent } from './types'
import { getMonthGrid, getDayEvents, isSameDay, toISODate, parseISO, formatEventTime } from './utils'
import CalendarEventCard from './CalendarEventCard.vue'

/* ── Props / Emits ── */
const props = withDefaults(defineProps<{
  events?: CalendarEvent[]
  currentDate?: string
  dayStart?: string
  dayEnd?: string
  snapMinutes?: number
}>(), {
  events: () => [],
  currentDate: () => toISODate(new Date()),
  dayStart: '00:00',
  dayEnd: '24:00',
  snapMinutes: 30,
})

const emit = defineEmits<{
  select: [event: CalendarEvent]
  'day-click': [date: string]
}>()

/* ── Constants ── */
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MAX_VISIBLE = 3

/* ── State ── */
const gridRef = ref<HTMLDivElement>()
const focusedDate = ref(props.currentDate)

watch(() => props.currentDate, (v) => {
  focusedDate.value = v || toISODate(new Date())
})

/* ── Types ── */
interface DayCellData {
  date: Date
  iso: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
  visibleAllDay: CalendarEvent[]
  visibleTimed: CalendarEvent[]
  hiddenCount: number
}

/* ── Computed ── */
const today = new Date()

const grid = computed((): DayCellData[] => {
  const current = parseISO(props.currentDate)
  if (!current) return []

  return getMonthGrid(current).map((date) => {
    const iso = toISODate(date)
    const events = getDayEvents(props.events, iso)
    const allDayEvents = events.filter((e) => e.allDay)
    const timedEvents = events.filter((e) => !e.allDay)

    const visibleAllDay = allDayEvents.slice(0, MAX_VISIBLE)
    const remainingSlots = MAX_VISIBLE - visibleAllDay.length
    const visibleTimed = timedEvents.slice(0, remainingSlots)
    const hiddenCount = events.length - visibleAllDay.length - visibleTimed.length

    return {
      date,
      iso,
      dayNum: date.getDate(),
      isCurrentMonth: date.getMonth() === current.getMonth(),
      isToday: isSameDay(date, today),
      events,
      visibleAllDay,
      visibleTimed,
      hiddenCount,
    }
  })
})

const weeks = computed((): DayCellData[][] => {
  const result: DayCellData[][] = []
  const flat = grid.value
  for (let i = 0; i < flat.length; i += 7) {
    result.push(flat.slice(i, i + 7))
  }
  return result
})

/* ── Helpers ── */
function dayCellClass(cell: DayCellData): string {
  return [
    'dayCell',
    !cell.isCurrentMonth ? 'dayCellOther' : undefined,
    cell.isToday ? 'dayCellToday' : undefined,
  ].filter(Boolean).join(' ')
}

/* ── Handlers ── */
function handleDayClick(cell: DayCellData) {
  emit('day-click', cell.iso)
}

function handleEventClick(event: CalendarEvent) {
  emit('select', event)
}

function handleGridKeyDown(e: KeyboardEvent) {
  const active = document.activeElement
  const cellEl = active?.closest('[data-date]') as HTMLElement | null
  const currentIso = cellEl?.dataset.date
  if (!currentIso) return

  const current = parseISO(currentIso)
  if (!current) return

  let next = new Date(current)
  let changed = false

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      next.setDate(next.getDate() - 1)
      changed = true
      break
    case 'ArrowRight':
      e.preventDefault()
      next.setDate(next.getDate() + 1)
      changed = true
      break
    case 'ArrowUp':
      e.preventDefault()
      next.setDate(next.getDate() - 7)
      changed = true
      break
    case 'ArrowDown':
      e.preventDefault()
      next.setDate(next.getDate() + 7)
      changed = true
      break
    case 'Home':
      e.preventDefault()
      next.setDate(1)
      changed = true
      break
    case 'End':
      e.preventDefault()
      next.setDate(new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate())
      changed = true
      break
  }

  if (changed) {
    const nextIso = toISODate(next)
    focusedDate.value = nextIso
    nextTick(() => {
      const el = gridRef.value?.querySelector(`[data-date="${nextIso}"]`) as HTMLElement | null
      el?.focus({ preventScroll: true })
    })
  }
}
</script>

<template>
  <div
    ref="gridRef"
    class="monthView"
    role="grid"
    aria-label="Calendar month view"
    @keydown="handleGridKeyDown"
  >
    <!-- Weekday headers -->
    <div class="weekdays" role="row">
      <div
        v-for="d in WEEKDAYS"
        :key="d"
        class="weekday"
        role="columnheader"
        :aria-label="d"
      >
        {{ d }}
      </div>
    </div>

    <!-- Days grid -->
    <div class="days" role="rowgroup">
      <div v-for="(week, wi) in weeks" :key="wi" class="week" role="row">
        <div
          v-for="cell in week"
          :key="cell.iso"
          :class="dayCellClass(cell)"
          role="gridcell"
          :data-date="cell.iso"
          :tabindex="focusedDate === cell.iso ? 0 : -1"
          :aria-label="cell.date.toDateString()"
          @click="handleDayClick(cell)"
        >
          <span class="dayNumber" :class="{ dayNumberToday: cell.isToday }">
            {{ cell.dayNum }}
          </span>

          <div class="eventsArea">
            <!-- All-day events -->
            <CalendarEventCard
              v-for="event in cell.visibleAllDay"
              :key="event.id"
              :event="event"
              presentation="all-day"
              :time-label="formatEventTime(event)"
              :show-time="false"
              @select="handleEventClick"
            >
              <template v-if="$slots.event" #default="slotProps">
                <slot name="event" v-bind="{ ...slotProps, view: 'month' }" />
              </template>
            </CalendarEventCard>

            <!-- Timed events: desktop bars -->
            <CalendarEventCard
              v-for="event in cell.visibleTimed"
              :key="event.id"
              class="timedBarDesktop"
              :event="event"
              presentation="month"
              :time-label="formatEventTime(event)"
              :show-subtitle="false"
              @select="handleEventClick"
            >
              <template v-if="$slots.event" #default="slotProps">
                <slot name="event" v-bind="{ ...slotProps, view: 'month' }" />
              </template>
            </CalendarEventCard>

            <!-- Timed events: mobile dots -->
            <div class="timedDotsMobile">
              <CalendarEventCard
                v-for="event in cell.visibleTimed"
                :key="event.id"
                :event="event"
                presentation="month"
                :time-label="formatEventTime(event)"
                compact
                @select="handleEventClick"
              >
                <template v-if="$slots.event" #default="slotProps">
                  <slot name="event" v-bind="{ ...slotProps, view: 'month' }" />
                </template>
              </CalendarEventCard>
            </div>

            <button
              v-if="cell.hiddenCount > 0"
              type="button"
              class="moreLabel"
              @click.stop="handleDayClick(cell)"
            >
              +{{ cell.hiddenCount }} more
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monthView {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Weekday headers ── */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.125rem;
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

/* ── Days grid ── */
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.25rem;
  border: var(--agala-border-width) solid transparent;
  border-radius: var(--agala-radius-sm);
  background-color: hsl(var(--agala-card));
  color: hsl(var(--agala-foreground));
  cursor: pointer;
  outline: none;
  min-height: 4rem;
  transition: background-color var(--agala-transition-fast);
}

.dayCellOther {
  background-color: hsl(var(--agala-muted) / 0.4);
}

.dayCellToday {
  box-shadow: inset 0 0 0 2px hsl(var(--agala-primary));
}

.dayCell:hover {
  background-color: hsl(var(--agala-accent));
}

.dayCell:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

.dayCellToday:focus-visible {
  box-shadow:
    inset 0 0 0 2px hsl(var(--agala-primary)),
    0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

.dayNumber {
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-foreground));
  line-height: 1;
  padding: 0.125rem;
}

.dayNumberToday {
  color: hsl(var(--agala-primary));
  font-weight: var(--agala-font-weight-bold);
}

/* ── Events area ── */
.eventsArea {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  width: 100%;
  margin-top: 0.25rem;
  overflow: hidden;
  flex: 1;
}

.eventBar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  min-height: 1.25rem;
  padding: 0.125rem 0.375rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-medium);
  cursor: pointer;
  overflow: hidden;
  transition: opacity var(--agala-transition-fast);
  text-align: left;
}

.eventBar:hover {
  opacity: 0.85;
}

.eventBar:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.5);
}

.eventTime {
  font-weight: var(--agala-font-weight-semibold);
  flex-shrink: 0;
  opacity: 0.8;
}

.eventBarText {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.allDayBar {
  font-weight: var(--agala-font-weight-semibold);
}

.timedBarDesktop {
  display: none;
}

.timedDotsMobile {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  align-items: center;
}

.eventDot {
  display: inline-flex;
  width: 0.375rem;
  height: 0.375rem;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.moreLabel {
  display: inline-flex;
  align-items: center;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-muted-foreground));
  padding: 0.125rem 0.375rem;
  line-height: 1.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--agala-radius-sm);
  transition: background-color var(--agala-transition-fast);
  text-align: left;
}

.moreLabel:hover {
  background-color: hsl(var(--agala-accent));
  color: hsl(var(--agala-foreground));
}

.moreLabel:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.5);
}

/* ── Token color classes ── */
.eventPrimary { background-color: hsl(var(--agala-primary) / 0.12); color: hsl(var(--agala-primary)); border-left: 3px solid hsl(var(--agala-primary)); }
.eventSecondary { background-color: hsl(var(--agala-secondary) / 0.5); color: hsl(var(--agala-secondary-foreground)); border-left: 3px solid hsl(var(--agala-secondary-foreground) / 0.5); }
.eventMuted { background-color: hsl(var(--agala-muted)); color: hsl(var(--agala-muted-foreground)); border-left: 3px solid hsl(var(--agala-muted-foreground) / 0.5); }
.eventDanger { background-color: hsl(var(--agala-danger) / 0.12); color: hsl(var(--agala-danger)); border-left: 3px solid hsl(var(--agala-danger)); }
.eventWarning { background-color: hsl(var(--agala-warning) / 0.15); color: hsl(var(--agala-warning)); border-left: 3px solid hsl(var(--agala-warning)); }
.eventSuccess { background-color: hsl(var(--agala-success) / 0.12); color: hsl(var(--agala-success)); border-left: 3px solid hsl(var(--agala-success)); }
.eventAccent { background-color: hsl(var(--agala-accent) / 0.5); color: hsl(var(--agala-accent-foreground)); border-left: 3px solid hsl(var(--agala-accent-foreground) / 0.5); }

/* ── Desktop ── */
@media (min-width: 768px) {
  .dayCell {
    min-height: 6rem;
  }

  .timedBarDesktop {
    display: flex;
  }

  .timedDotsMobile {
    display: none;
  }
}
</style>
