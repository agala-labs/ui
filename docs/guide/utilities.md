---
outline: deep
---

# Utilities

The package root exports one responsive composable and focused date helpers. Other source composables are internal implementation details.

## useMediaQuery

Use CSS for layout whenever possible. `useMediaQuery` is useful when viewport state must affect behavior, such as closing an overlay.

```ts
import { useMediaQuery } from '@el-agala/ui'

const { matches: isMobile } = useMediaQuery('(max-width: 639px)')
```

## Date helpers

```ts
import {
  parseDate,
  formatISODate,
  formatISODateTime,
  formatTime,
  formatTime24,
  formatDateLabel,
  formatMonthYear,
  formatFullDate,
  isSameDay,
  isToday,
  startOfWeek,
  addDays,
  getMonthGrid,
  getWeekDays,
} from '@el-agala/ui'
```

These helpers use the same date handling as `AgalaDatePicker` and `AgalaCalendar`. Prefer them when an application needs matching ISO formatting or calendar-grid behavior.
