import { ref } from 'vue'
import type { Ref } from 'vue'

export interface DropdownPositionOptions {
  width?: 'trigger' | 'auto'
}

/**
 * Returns reactive dropdown positioning style based on the trigger element.
 * Position is fixed so it escapes overflow containers.
 *
 * ⚠️  IMPORTANT: Position must be recomputed imperatively (via `recompute()`)
 *     inside `nextTick` when opening the dropdown. Do NOT use `computed()`
 *     for layout reads — element references don't change when elements move,
 *     so Vue's computed caching returns stale coordinates.
 */
export function useDropdownPosition(
  triggerRef: Ref<HTMLElement | undefined>,
  floatingRef?: Ref<HTMLElement | null | undefined>,
  opts: DropdownPositionOptions = {}
) {
  const dropdownStyle = ref<Record<string, string>>({
    position: 'fixed',
  })

  function recompute() {
    if (!triggerRef.value) return
    const rect = triggerRef.value.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const margin = 8
    const gap = 4

    // Determine dropdown width
    let ddWidth: number
    if (opts.width !== 'auto') {
      ddWidth = Math.min(rect.width, viewportW - margin * 2)
    } else {
      ddWidth = 280
    }

    // Horizontal positioning
    let left = rect.left
    const rightEdge = left + ddWidth
    if (rightEdge > viewportW - margin) {
      // Try right-align
      const rightAligned = rect.right - ddWidth
      if (rightAligned >= margin && rect.right <= viewportW - margin) {
        left = rightAligned
      } else {
        left = Math.max(margin, viewportW - ddWidth - margin)
      }
    }
    left = Math.max(margin, left)

    // Vertical positioning — first pass: below trigger
    const top = rect.bottom + gap

    const style: Record<string, string> = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `calc(100vw - ${margin * 2}px)`,
      maxHeight: `calc(100dvh - ${margin * 2}px)`,
    }
    if (opts.width !== 'auto') {
      style.width = `${ddWidth}px`
    }

    // Apply first-pass style
    dropdownStyle.value = style

    // Second pass: measure actual dropdown and adjust vertically
    if (floatingRef?.value) {
      requestAnimationFrame(() => {
        const ddEl = floatingRef.value
        if (!ddEl) return
        const ddHeight = Math.min(ddEl.offsetHeight, viewportH - margin * 2)
        const bottomEdge = top + ddHeight

        if (bottomEdge > viewportH - margin) {
          // Try positioning above trigger
          const above = rect.top - ddHeight - gap
          if (above >= margin) {
            dropdownStyle.value = { ...dropdownStyle.value, top: `${above}px` }
          } else {
            dropdownStyle.value = {
              ...dropdownStyle.value,
              top: `${Math.max(margin, viewportH - ddHeight - margin)}px`,
            }
          }
        }
      })
    }
  }

  return { dropdownStyle, recompute }
}
