import type { CalendarEvent } from './types'
import { formatEventTimeRange } from './utils'

export type CalendarEventPresentation = 'month' | 'time-grid' | 'all-day' | 'list'

const tokenAccents: Record<string, string> = {
  primary: 'hsl(var(--agala-primary))',
  secondary: 'hsl(var(--agala-secondary-foreground))',
  muted: 'hsl(var(--agala-muted-foreground))',
  danger: 'hsl(var(--agala-danger))',
  warning: 'hsl(var(--agala-warning))',
  success: 'hsl(var(--agala-success))',
  accent: 'hsl(var(--agala-accent-foreground))',
}

export function resolveCalendarEventAccent(color?: string): string {
  if (!color) return tokenAccents.primary
  return tokenAccents[color] ?? color
}

export function getCalendarEventLabel(event: CalendarEvent, timeLabel?: string): string {
  const resolvedTime = timeLabel || formatEventTimeRange(event)
  return [resolvedTime, event.title, event.subtitle].filter(Boolean).join(', ')
}
