<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import EmptyState from '../EmptyState/EmptyState.vue'
import type { CalendarEvent } from './types'
import {
  formatTimeLabel,
  getDayEvents,
  getWeekDays,
  isSameDay,
  parseISO,
  toISODate,
} from './utils'
import { formatDateLabel } from '../../composables/useDateUtils'
import CalendarEventCard from './CalendarEventCard.vue'

const props = withDefaults(
  defineProps<{
    events?: CalendarEvent[]
    currentDate: string
    dayStart?: string
    dayEnd?: string
    snapMinutes?: number
    class?: string
  }>(),
  {
    events: () => [],
    dayStart: '00:00',
    dayEnd: '24:00',
    snapMinutes: 30,
    class: '',
  },
)

const emit = defineEmits<{
  select: [event: CalendarEvent]
}>()

/* ── reactive "now" clock (updates every minute) ── */
const now = ref(new Date())
let intervalId: number | undefined

onMounted(() => {
  intervalId = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId)
  }
})

/* ── helpers ── */
function safeFormatTime(iso: string): string {
  const d = parseISO(iso)
  return d ? formatTimeLabel(d) : ''
}

function getRelativeBadge(
  event: CalendarEvent,
  nowDate: Date,
): string | null {
  const start = parseISO(event.start)
  const end = parseISO(event.end)
  if (!start || !end) return null

  if (nowDate >= start && nowDate <= end) {
    return 'Now'
  }

  const diffMin = Math.round((start.getTime() - nowDate.getTime()) / 60000)
  if (diffMin > 0 && diffMin <= 60) {
    return `In ${diffMin} min`
  }

  return null
}

/* ── computed data ── */
interface ListEvent extends CalendarEvent {
  badge: string | null
}

interface DayGroup {
  date: Date
  dateISO: string
  events: ListEvent[]
  isToday: boolean
  separatorIndex: number
}

const todayDate = computed(() => {
  const d = new Date(now.value)
  d.setHours(0, 0, 0, 0)
  return d
})

const weekDates = computed(() => {
  const date = parseISO(`${props.currentDate}T00:00:00`)
  if (!date) return []
  return getWeekDays(date)
})

const groupedEvents = computed<DayGroup[]>(() => {
  return weekDates.value.map((date) => {
    const iso = toISODate(date)
    const dayEvents = getDayEvents(props.events, iso)
      .map((event) => ({
        ...event,
        badge: getRelativeBadge(event, now.value),
      }))
      .sort((a, b) => {
        const aStart = parseISO(a.start)
        const bStart = parseISO(b.start)
        if (!aStart || !bStart) return 0
        return aStart.getTime() - bStart.getTime()
      })

    const futureIndex = dayEvents.findIndex((event) => {
      const start = parseISO(event.start)
      return start ? start.getTime() > now.value.getTime() : false
    })

    return {
      date,
      dateISO: iso,
      events: dayEvents,
      isToday: isSameDay(date, todayDate.value),
      separatorIndex: futureIndex > 0 ? futureIndex : -1,
    }
  })
})

const totalEvents = computed(() => {
  return groupedEvents.value.reduce((sum, group) => sum + group.events.length, 0)
})
</script>

<template>
  <div :class="['listView', props.class]">
    <EmptyState
      v-if="totalEvents === 0"
      title="No events this week"
      description="There are no events scheduled for the selected week."
    >
      <template #icon>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </template>
    </EmptyState>

    <template v-else>
      <div
        v-for="group in groupedEvents"
        :key="group.dateISO"
        class="dayGroup"
      >
        <div
          class="dayHeader"
          :class="{ dayHeaderToday: group.isToday }"
        >
          {{ formatDateLabel(group.date) }}
        </div>

        <!-- No events for this day -->
        <div v-if="group.events.length === 0" class="noEvents">
          No events
        </div>

        <div v-else role="list" class="dayEvents">
          <template
            v-for="(event, index) in group.events"
            :key="event.id"
          >
            <!-- Now separator -->
            <div
              v-if="group.separatorIndex === index"
              class="nowSeparator"
              role="separator"
              aria-label="Now"
            >
              <span class="nowLabel">Now</span>
            </div>

            <!-- Event card -->
            <div
              role="listitem"
              class="eventListItem"
            >
              <CalendarEventCard
                :event="event"
                presentation="list"
                :time-label="event.allDay ? 'All day' : safeFormatTime(event.start)"
                :badge="event.badge"
                @select="emit('select', $event)"
              >
                <template v-if="$slots.event" #default="slotProps">
                  <slot name="event" v-bind="{ ...slotProps, view: 'list' }" />
                </template>
              </CalendarEventCard>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.listView {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background-color: hsl(var(--agala-card));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  overflow-y: auto;
  height: 100%;
}

.dayGroup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dayHeader {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.5rem 0.75rem;
  background-color: hsl(var(--agala-card));
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-foreground));
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.dayHeaderToday {
  color: hsl(var(--agala-primary));
}

.noEvents {
  padding: 1rem 0.75rem;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
  font-style: italic;
}

.dayEvents {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.eventCard {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: hsl(var(--agala-card));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-left-width: 3px;
  border-left-style: solid;
  border-left-color: hsl(var(--agala-border));
  border-radius: var(--agala-radius-md);
  cursor: pointer;
  transition: background-color var(--agala-transition-fast);
}

.eventCard:hover {
  background-color: hsl(var(--agala-accent));
}

.eventCard:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.accentPrimary {
  border-left-color: hsl(var(--agala-primary));
}

.accentDanger {
  border-left-color: hsl(var(--agala-danger));
}

.accentSuccess {
  border-left-color: hsl(var(--agala-success));
}

.accentWarning {
  border-left-color: hsl(var(--agala-warning));
}

.accentSecondary {
  border-left-color: hsl(var(--agala-secondary-foreground));
}

.accentAccent {
  border-left-color: hsl(var(--agala-accent-foreground));
}

.timeColumn {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 4rem;
  flex-shrink: 0;
}

.timeStart {
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-muted-foreground));
  line-height: 1.25;
  text-align: right;
}

.eventContent {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
}

.eventTitleRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.eventTitle {
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-semibold);
  color: hsl(var(--agala-foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.eventSubtitle {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eventBadge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  white-space: nowrap;
  line-height: 1;
  flex-shrink: 0;
}

.badgeNow {
  background-color: hsl(var(--agala-danger) / 0.15);
  color: hsl(var(--agala-danger));
}

.badgeSoon {
  background-color: hsl(var(--agala-primary) / 0.15);
  color: hsl(var(--agala-primary));
}

.nowSeparator {
  position: relative;
  height: 1px;
  margin: 0.75rem 0;
  border-top: 1px dashed hsl(var(--agala-danger));
}

.nowLabel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: hsl(var(--agala-card));
  padding: 0 0.5rem;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-danger));
  white-space: nowrap;
}

@media (max-width: 640px) {
  .listView {
    padding: 0.5rem;
    gap: 1rem;
  }

  .timeColumn {
    width: 3rem;
  }

  .eventCard {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .dayHeader {
    padding: 0.5rem;
  }
}
</style>
