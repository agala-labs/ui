<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CalendarEvent } from './types'
import {
  getWeekDays,
  getDayEvents,
  getEventPosition,
  detectOverlap,
  getHoursRange,
  isSameDay,
  toISODate,
  formatTimeLabel,
  parseISO,
  parseTime,
  minutesToTimeString,
  formatEventTimeRange,
} from './utils'
import { useGridSelection } from '../../composables/useGridSelection'
import CalendarEventCard from './CalendarEventCard.vue'

const props = withDefaults(defineProps<{
  events: CalendarEvent[]
  currentDate: string
  dayStart?: string
  dayEnd?: string
  snapMinutes?: number
}>(), {
  dayStart: '00:00',
  dayEnd: '24:00',
  snapMinutes: 30,
})

const emit = defineEmits<{
  select: [event: CalendarEvent]
  'day-click': [date: string]
  'slot-select': [payload: { start: string; end: string }]
}>()

/* ─── Responsive hour height ─── */
const hourHeight = ref(48)

function updateHourHeight() {
  if (typeof window === 'undefined') return
  if (window.innerWidth < 768) {
    hourHeight.value = 40
  } else if (window.innerWidth < 1024) {
    hourHeight.value = 44
  } else {
    hourHeight.value = 48
  }
}

onMounted(() => {
  updateHourHeight()
  window.addEventListener('resize', updateHourHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHourHeight)
})

/* ─── Grid selection (per day column) ─── */
const dayGridRefs = ref<(HTMLDivElement | null)[]>([])

function getDayGridRef(dayIndex: number) {
  return computed(() => dayGridRefs.value[dayIndex])
}

function createSelectionForDay(dayIndex: number) {
  return useGridSelection({
    containerRef: getDayGridRef(dayIndex),
    hourHeightRef: hourHeight,
    snapMinutes: props.snapMinutes,
    dayStart: props.dayStart,
    dayEnd: props.dayEnd,
  })
}

const selections = Array.from({ length: 7 }, (_, i) => createSelectionForDay(i))

const anySelecting = computed(() => selections.some(s => s.isSelecting.value))

function handleGridMouseDown(e: MouseEvent, dayIndex: number) {
  if ((e.target as HTMLElement).closest('[data-calendar-event]')) return
  selections[dayIndex].startSelection(e)
}

function handleGridMouseUp(dayIndex: number) {
  const range = selections[dayIndex].endSelection()
  if (range) {
    const date = toISODate(weekDays.value[dayIndex])
    const startTime = minutesToTimeString(range.startMinutes)
    const endTime = minutesToTimeString(range.endMinutes)
    emit('slot-select', {
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
    })
  }
}

function formatSelectionTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const d = new Date(2000, 0, 1, h, m)
  return formatTimeLabel(d)
}

/* ─── Week days ─── */
const weekDays = computed(() => {
  const date = parseISO(`${props.currentDate}T00:00:00`)
  if (!date) return []
  return getWeekDays(date)
})

/* ─── Hours ─── */
const hours = computed(() => getHoursRange(props.dayStart, props.dayEnd))

const slotsPerHour = computed(() => 60 / props.snapMinutes)

/* ─── Current time ─── */
const now = ref(new Date())
let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timeInterval = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

const currentTimeData = computed(() => {
  const dayIndex = weekDays.value.findIndex(day => isSameDay(day, now.value))
  if (dayIndex === -1) return null

  const start = parseTime(props.dayStart)
  const end = parseTime(props.dayEnd)
  const dayStartMins = start.hours * 60 + start.minutes
  const dayEndMins = end.hours * 60 + end.minutes
  const currentMins = now.value.getHours() * 60 + now.value.getMinutes()

  if (currentMins < dayStartMins || currentMins >= dayEndMins) return null

  return {
    top: (currentMins - dayStartMins) * (hourHeight.value / 60),
    dayIndex,
  }
})

/* ─── All-day events ─── */
const allDayEventsByDay = computed(() => {
  return weekDays.value.map(day => {
    const dateStr = toISODate(day)
    return getDayEvents(props.events, dateStr).filter(e => e.allDay)
  })
})

/* ─── Timed events ─── */
const timedEventsList = computed(() => props.events.filter(e => !e.allDay))

const timedEventsByDay = computed(() => {
  return weekDays.value.map(day => {
    const dateStr = toISODate(day)
    const overlapInfo = detectOverlap(
      timedEventsList.value,
      dateStr,
    )

    return overlapInfo
      .map(({ event, column, totalColumns }) => {
        const position = getEventPosition(
          event,
          props.dayStart,
          props.dayEnd,
          hourHeight.value,
        )
        if (!position) return null

        return {
          event,
          ...position,
          column,
          totalColumns,
          showTime: position.height >= 36,
          showSubtitle: position.height >= 56,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  })
})

/* ─── Helpers ─── */
function getEventStyle(
  top: number,
  height: number,
  column: number,
  totalColumns: number,
): Record<string, string> {
  const style: Record<string, string> = {
    top: `${top}px`,
    height: `${Math.max(height, 28)}px`,
    left: `${(column / totalColumns) * 100 + 0.5}%`,
    width: `${(1 / totalColumns) * 100 - 1}%`,
  }
  return style
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  })
}

function formatHourLabel(hour: number): string {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  return formatTimeLabel(d)
}

function handleEventClick(event: CalendarEvent) {
  emit('select', event)
}
</script>

<template>
  <div
    class="weekView"
    :class="{ isSelecting: anySelecting }"
    role="region"
  >
    <div class="scrollWrapper">
      <!-- Time axis column -->
      <div class="timeAxisCol">
        <div class="corner"></div>
        <div class="allDayLabel"></div>
        <div class="hourLabels">
          <div
            v-for="hour in hours"
            :key="hour"
            class="hourLabel"
          >
            {{ formatHourLabel(hour) }}
          </div>
          <div
            v-if="currentTimeData"
            class="currentTimeDot"
            :style="{ top: `${currentTimeData.top}px` }"
          />
        </div>
      </div>

      <!-- Day columns -->
      <div
        v-for="(day, dayIndex) in weekDays"
        :key="toISODate(day)"
        class="dayCol"
        :class="{ dayColToday: isSameDay(day, now) }"
      >
        <div class="dayHeader">
          {{ formatDayHeader(day) }}
        </div>

        <div class="allDayCell">
          <CalendarEventCard
            v-for="event in allDayEventsByDay[dayIndex]"
            :key="event.id"
            :event="event"
            presentation="all-day"
            :show-time="false"
            @select="handleEventClick"
          >
            <template v-if="$slots.event" #default="slotProps">
              <slot name="event" v-bind="{ ...slotProps, view: 'week' }" />
            </template>
          </CalendarEventCard>
        </div>

        <div
          :ref="(el) => { if (el) dayGridRefs[dayIndex] = el as HTMLDivElement }"
          class="dayGrid"
          :style="{ minHeight: `${hours.length * hourHeight}px` }"
          @mousedown="(e) => handleGridMouseDown(e, dayIndex)"
          @mouseup="() => handleGridMouseUp(dayIndex)"
        >
          <div
            v-for="hour in hours"
            :key="hour"
            class="hourRow"
          >
            <div
              v-for="s in slotsPerHour"
              :key="s"
              class="timeSlot"
            ></div>
          </div>

          <!-- Selection overlay -->
          <div
            v-if="selections[dayIndex].selectionStyle.value"
            class="selectionOverlay"
            aria-hidden="true"
            :style="selections[dayIndex].selectionStyle.value"
          >
            <span
              v-if="selections[dayIndex].selectionRange.value"
              class="selectionLabel selectionLabelStart"
            >
              {{ formatSelectionTime(selections[dayIndex].selectionRange.value.startMinutes) }}
            </span>
            <span
              v-if="selections[dayIndex].selectionRange.value && selections[dayIndex].selectionRange.value.endMinutes - selections[dayIndex].selectionRange.value.startMinutes >= 30"
              class="selectionLabel selectionLabelEnd"
            >
              {{ formatSelectionTime(selections[dayIndex].selectionRange.value.endMinutes) }}
            </span>
          </div>

          <CalendarEventCard
            v-for="eventInfo in timedEventsByDay[dayIndex]"
            :key="eventInfo.event.id"
            :event="eventInfo.event"
            presentation="time-grid"
            :time-label="formatEventTimeRange(eventInfo.event)"
            :show-time="eventInfo.showTime"
            :show-subtitle="eventInfo.showSubtitle"
            :style="getEventStyle(
              eventInfo.top,
              eventInfo.height,
              eventInfo.column,
              eventInfo.totalColumns,
            )"
            @select="handleEventClick"
          >
            <template v-if="$slots.event" #default="slotProps">
              <slot name="event" v-bind="{ ...slotProps, view: 'week' }" />
            </template>
          </CalendarEventCard>

          <div
            v-if="currentTimeData && currentTimeData.dayIndex === dayIndex"
            class="currentTimeLine"
            :style="{ top: `${currentTimeData.top}px` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weekView {
  font-family: var(--agala-font-sans);
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-card));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: var(--agala-radius);
  overflow: hidden;
}

.scrollWrapper {
  display: flex;
  overflow-x: auto;
}

/* ─── Time axis column ─── */
.timeAxisCol {
  width: 4.5rem;
  flex-shrink: 0;
  position: sticky;
  left: 0;
  z-index: 3;
  background: hsl(var(--agala-card));
  border-right: var(--agala-border-width) solid hsl(var(--agala-border));
}

.corner {
  height: 2.5rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  position: sticky;
  top: 0;
  background: hsl(var(--agala-card));
  z-index: 4;
}

.allDayLabel {
  min-height: 2.5rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  position: sticky;
  top: 2.5rem;
  background: hsl(var(--agala-card));
  z-index: 4;
}

.hourLabels {
  position: relative;
}

.hourLabel {
  height: 3rem;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 0.5rem;
  padding-top: 0.25rem;
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
  box-sizing: border-box;
}

/* ─── Day columns ─── */
.dayCol {
  flex: 1;
  min-width: 7.5rem;
  border-right: var(--agala-border-width) solid hsl(var(--agala-border));
  display: flex;
  flex-direction: column;
}

.dayCol:last-child {
  border-right: none;
}

.dayHeader {
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  background: hsl(var(--agala-muted) / 0.3);
  position: sticky;
  top: 0;
  z-index: 2;
}

.dayColToday .dayHeader {
  background: hsl(var(--agala-primary) / 0.1);
  color: hsl(var(--agala-primary));
  font-weight: var(--agala-font-weight-semibold);
}

.allDayCell {
  min-height: 2.5rem;
  max-height: 5rem;
  overflow-y: auto;
  padding: 0.25rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  position: sticky;
  top: 2.5rem;
  background: hsl(var(--agala-card));
  z-index: 2;
}

.dayGrid {
  flex: 1;
  position: relative;
}

.hourRow {
  height: 3rem;
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border) / 0.4);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.timeSlot {
  flex: 1;
  min-height: 0;
}
.timeSlot:not(:last-child) {
  border-bottom: 1px solid hsl(var(--agala-border) / 0.12);
}
.timeSlot:hover {
  background: hsl(var(--agala-primary) / 0.06);
}

/* ─── Events ─── */
.event {
  position: absolute;
  border: 1px solid hsl(var(--agala-border));
  border-left: 4px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-sm);
  padding: 0.25rem 0.375rem;
  font-size: 0.6875rem;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.125rem;
  z-index: 1;
  box-sizing: border-box;
  background: hsl(var(--agala-card));
  color: hsl(var(--agala-foreground));
  transition:
    box-shadow var(--agala-transition-fast),
    transform var(--agala-transition-fast);
}

.event:hover {
  box-shadow: var(--agala-shadow-md);
  z-index: 5;
  transform: scale(1.02);
}

.event:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.eventTitle {
  font-weight: var(--agala-font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
}

.eventSubtitle {
  font-size: 0.5625rem;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eventShort {
  font-size: 0;
  padding: 0;
  min-height: 2px;
  border-radius: 1px;
}

.eventShort .eventTitle,
.eventShort .eventSubtitle {
  display: none;
}

/* ─── All-day event chips ─── */
.allDayEvent {
  border: 1px solid hsl(var(--agala-border));
  border-left: 3px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-sm);
  padding: 0.125rem 0.25rem;
  font-size: var(--agala-font-size-sm);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  width: 100%;
}

.allDayEvent:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}

/* ─── Token color classes ─── */
.eventPrimary {
  border-left-color: hsl(var(--agala-primary));
}

.eventDanger {
  border-left-color: hsl(var(--agala-danger));
}

.eventSuccess {
  border-left-color: hsl(var(--agala-success));
}

.eventWarning {
  border-left-color: hsl(var(--agala-warning));
}

.eventSecondary {
  border-left-color: hsl(var(--agala-secondary-foreground) / 0.5);
}

.eventAccent {
  border-left-color: hsl(var(--agala-accent-foreground) / 0.5);
}

/* ─── Current time indicator ─── */
.currentTimeLine {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: hsl(var(--agala-danger));
  z-index: 2;
  pointer-events: none;
}

.currentTimeDot {
  position: absolute;
  right: 0.25rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: hsl(var(--agala-danger));
  transform: translateY(-50%);
  z-index: 4;
}

/* ─── Selection overlay ─── */
.weekView.isSelecting {
  cursor: crosshair;
}

.selectionOverlay {
  position: absolute;
  left: 2px;
  right: 2px;
  background: hsl(var(--agala-primary) / 0.15);
  border: 2px dashed hsl(var(--agala-primary) / 0.5);
  border-radius: var(--agala-radius-sm);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1px 2px;
  box-sizing: border-box;
  overflow: hidden;
}

.selectionLabel {
  display: block;
  font-size: 0.5rem;
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-primary));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.selectionLabelEnd {
  align-self: flex-start;
}

/* ─── Tablet ─── */
@media (max-width: 1023px) {
  .hourLabel {
    height: 2.75rem;
  }

  .hourRow {
    height: 2.75rem;
  }
}

/* ─── Mobile ─── */
@media (max-width: 767px) {
  .hourLabel {
    height: 2.5rem;
  }

  .hourRow {
    height: 2.5rem;
  }

  .scrollWrapper {
    scroll-snap-type: x mandatory;
    scroll-padding-left: 4.5rem;
  }

  .dayCol {
    scroll-snap-align: start;
  }
}
</style>
