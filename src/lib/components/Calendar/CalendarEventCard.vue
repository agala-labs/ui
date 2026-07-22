<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from './types'
import {
  getCalendarEventLabel,
  resolveCalendarEventAccent,
  type CalendarEventPresentation,
} from './eventPresentation'

const props = withDefaults(defineProps<{
  event: CalendarEvent
  presentation: CalendarEventPresentation
  timeLabel?: string
  showTime?: boolean
  showSubtitle?: boolean
  badge?: string | null
  compact?: boolean
}>(), {
  timeLabel: '',
  showTime: true,
  showSubtitle: true,
  badge: null,
  compact: false,
})

const emit = defineEmits<{
  select: [event: CalendarEvent]
}>()

const cardStyle = computed(() => ({
  '--agala-calendar-event-accent': resolveCalendarEventAccent(props.event.color),
}))

const accessibleLabel = computed(() => getCalendarEventLabel(props.event, props.timeLabel))

const presentationClass = computed(() =>
  `presentation${props.presentation
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`,
)
</script>

<template>
  <button
    type="button"
    data-calendar-event
    :class="['calendarEventCard', presentationClass, { isCompact: compact }]"
    :style="cardStyle"
    :aria-label="accessibleLabel"
    @click.stop="emit('select', event)"
  >
    <slot
      :event="event"
      :presentation="presentation"
      :time-label="timeLabel"
      :is-compact="compact"
    >
      <span v-if="compact" class="compactDot" aria-hidden="true" />

      <template v-else-if="presentation === 'list'">
        <span class="listTime">{{ timeLabel }}</span>
        <span class="content">
          <span class="titleRow">
            <span class="title">{{ event.title }}</span>
            <span v-if="badge" :class="['badge', badge === 'Now' ? 'badgeNow' : 'badgeSoon']">
              {{ badge }}
            </span>
          </span>
          <span v-if="event.subtitle && showSubtitle" class="subtitle">{{ event.subtitle }}</span>
        </span>
      </template>

      <template v-else>
        <span class="content">
          <span class="title">{{ event.title }}</span>
          <span v-if="showTime && timeLabel" class="time">{{ timeLabel }}</span>
          <span v-if="event.subtitle && showSubtitle" class="subtitle">{{ event.subtitle }}</span>
        </span>
      </template>
    </slot>
  </button>
</template>

<style scoped>
.calendarEventCard {
  --event-accent: var(--agala-calendar-event-accent, hsl(var(--agala-primary)));
  --event-surface: var(
    --agala-calendar-event-surface,
    color-mix(in srgb, var(--event-accent) 7%, hsl(var(--agala-card)))
  );
  --event-border: var(
    --agala-calendar-event-border,
    color-mix(in srgb, var(--event-accent) 24%, hsl(var(--agala-border)))
  );
  display: flex;
  min-width: 0;
  margin: 0;
  border: var(--agala-border-width) solid var(--event-border);
  border-left: 2px solid var(--event-accent);
  border-radius: var(--agala-calendar-event-radius, var(--agala-radius-sm));
  background: var(--event-surface);
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  box-sizing: border-box;
  overflow: hidden;
  transition: background-color var(--agala-transition-fast), border-color var(--agala-transition-fast);
}

.calendarEventCard:hover {
  background: color-mix(in srgb, var(--event-accent) 12%, hsl(var(--agala-card)));
}

.calendarEventCard:focus-visible {
  outline: none;
  z-index: 12;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.title,
.time,
.subtitle {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  font-weight: var(--agala-font-weight-medium);
}

.time,
.subtitle,
.listTime {
  color: hsl(var(--agala-muted-foreground));
}

.presentationMonth {
  width: 100%;
  min-height: 1.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  line-height: 1rem;
}

.presentationMonth .content {
  flex-direction: row;
  gap: 0.25rem;
  justify-content: flex-start;
}

.presentationMonth .time {
  order: -1;
  flex: 0 0 auto;
  font-weight: var(--agala-font-weight-medium);
}

.presentationAllDay {
  width: 100%;
  min-height: 1.5rem;
  padding: 0.125rem 0.5rem;
  font-size: var(--agala-font-size-sm);
  line-height: 1rem;
}

.presentationTimeGrid {
  position: absolute;
  z-index: 2;
  container: calendar-event / size;
  min-height: 1.75rem;
  padding: var(--agala-calendar-event-padding, 0.25rem 0.375rem);
  font-size: 0.6875rem;
  line-height: 1.2;
}

@container calendar-event (max-width: 6rem) {
  .presentationTimeGrid .subtitle {
    display: none;
  }
}

@container calendar-event (max-width: 5rem) {
  .presentationTimeGrid .time {
    display: none;
  }
}

@container calendar-event (max-height: 3.5rem) {
  .presentationTimeGrid .subtitle {
    display: none;
  }
}

@container calendar-event (max-height: 2.25rem) {
  .presentationTimeGrid .time {
    display: none;
  }
}

.presentationTimeGrid .time {
  margin-top: 0.0625rem;
  font-size: 0.625rem;
}

.presentationTimeGrid .subtitle {
  margin-top: 0.125rem;
  font-size: 0.625rem;
}

.presentationList {
  width: 100%;
  min-height: 3.25rem;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
}

.listTime {
  width: 4rem;
  flex: 0 0 4rem;
  padding-top: 0.0625rem;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  text-align: right;
}

.titleRow {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.titleRow .title {
  flex: 1;
  font-size: var(--agala-font-size-base);
}

.presentationList .subtitle {
  margin-top: 0.125rem;
  font-size: var(--agala-font-size-sm);
}

.badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
  line-height: 1;
}

.badgeNow {
  background: hsl(var(--agala-danger) / 0.12);
  color: hsl(var(--agala-danger));
}

.badgeSoon {
  background: hsl(var(--agala-primary) / 0.12);
  color: hsl(var(--agala-primary));
}

.isCompact {
  width: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
}

.isCompact:hover {
  background: hsl(var(--agala-accent));
}

.compactDot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--event-accent);
}

@media (max-width: 640px) {
  .presentationList {
    min-height: 2.75rem;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .listTime {
    width: 3rem;
    flex-basis: 3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .calendarEventCard {
    transition: none;
  }
}
</style>
