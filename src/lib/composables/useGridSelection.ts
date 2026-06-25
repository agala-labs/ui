import { ref, computed, type Ref } from 'vue'
import { snapToInterval, minutesFromMidnight } from '../components/Calendar/utils'

export interface UseGridSelectionOptions {
  containerRef: Ref<HTMLElement | null | undefined>
  hourHeightRef: Ref<number>
  snapMinutes: Ref<number> | number
  dayStart: Ref<string> | string
  dayEnd: Ref<string> | string
}

export interface SelectionRange {
  startMinutes: number
  endMinutes: number
}

export interface UseGridSelectionReturn {
  isSelecting: Ref<boolean>
  selectionStyle: Ref<{ top: string; height: string; display: string } | null>
  selectionRange: Ref<SelectionRange | null>
  startSelection: (e: MouseEvent) => boolean
  updateSelection: (e: MouseEvent) => void
  endSelection: () => SelectionRange | null
  cancelSelection: () => void
}

const CLICK_THRESHOLD = 5 // pixels

export function useGridSelection(options: UseGridSelectionOptions): UseGridSelectionReturn {
  const isSelecting = ref(false)
  const selectionStyle = ref<{ top: string; height: string; display: string } | null>(null)
  const selectionRange = ref<SelectionRange | null>(null)

  // Internal state
  let startY = 0
  let startMinutes = 0
  let hasMoved = false
  let moveListeners: (() => void) | null = null

  const snap = computed(() =>
    typeof options.snapMinutes === 'number' ? options.snapMinutes : options.snapMinutes.value
  )

  const dayStartMins = computed(() =>
    typeof options.dayStart === 'string' ? minutesFromMidnight(options.dayStart) : minutesFromMidnight(options.dayStart.value)
  )

  const dayEndMins = computed(() =>
    typeof options.dayEnd === 'string' ? minutesFromMidnight(options.dayEnd) : minutesFromMidnight(options.dayEnd.value)
  )

  function getRelativeY(e: MouseEvent): number {
    const container = options.containerRef.value
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    return e.clientY - rect.top + container.scrollTop
  }

  function yToMinutes(y: number): number {
    const hourHeight = options.hourHeightRef.value
    if (hourHeight <= 0) return 0
    // Grid renders only the dayStart..dayEnd window, so y=0 maps to dayStart,
    // not midnight. Offset by dayStartMins to resolve the real clicked time.
    const mins = dayStartMins.value + (y / hourHeight) * 60
    return snapToInterval(Math.round(mins), snap.value)
  }

  function clampMinutes(mins: number): number {
    return Math.max(dayStartMins.value, Math.min(dayEndMins.value, mins))
  }

  function updateOverlay(start: number, end: number) {
    const hourHeight = options.hourHeightRef.value
    if (hourHeight <= 0) return

    const topMins = Math.min(start, end)
    const bottomMins = Math.max(start, end)
    // Position relative to dayStart (grid origin), not midnight.
    const top = ((topMins - dayStartMins.value) / 60) * hourHeight
    const height = ((bottomMins - topMins) / 60) * hourHeight

    selectionStyle.value = {
      top: `${top}px`,
      height: `${Math.max(height, 1)}px`,
      display: 'block',
    }
  }

  function startSelection(e: MouseEvent): boolean {
    const container = options.containerRef.value
    if (!container) return false

    startY = getRelativeY(e)
    startMinutes = clampMinutes(yToMinutes(startY))
    hasMoved = false
    isSelecting.value = true

    selectionRange.value = { startMinutes, endMinutes: startMinutes }
    updateOverlay(startMinutes, startMinutes + snap.value)

    // Attach global listeners
    const onMouseMove = (ev: MouseEvent) => {
      const currentY = getRelativeY(ev)
      if (Math.abs(currentY - startY) > CLICK_THRESHOLD) {
        hasMoved = true
      }
      updateSelection(ev)
    }

    const onMouseUp = () => {
      endSelection()
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelSelection()
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp, { once: true })
    document.addEventListener('keydown', onKeyDown)

    moveListeners = () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('keydown', onKeyDown)
    }

    return true
  }

  function updateSelection(e: MouseEvent) {
    if (!isSelecting.value) return
    const currentY = getRelativeY(e)
    let endMins = clampMinutes(yToMinutes(currentY))

    // Ensure minimum 1 snap interval
    if (endMins === startMinutes) {
      endMins = startMinutes + snap.value
    }

    selectionRange.value = {
      startMinutes: Math.min(startMinutes, endMins),
      endMinutes: Math.max(startMinutes, endMins),
    }

    updateOverlay(startMinutes, endMins)
  }

  function endSelection(): SelectionRange | null {
    if (!isSelecting.value) return null

    const range = selectionRange.value
    cleanup()

    if (!range) return null

    // If it was a click (no significant movement), ensure at least 1 snap interval
    if (!hasMoved) {
      return {
        startMinutes: range.startMinutes,
        endMinutes: range.startMinutes + snap.value,
      }
    }

    return range
  }

  function cancelSelection() {
    cleanup()
  }

  function cleanup() {
    isSelecting.value = false
    selectionStyle.value = null
    selectionRange.value = null
    if (moveListeners) {
      moveListeners()
      moveListeners = null
    }
  }

  return {
    isSelecting,
    selectionStyle,
    selectionRange,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
  }
}
