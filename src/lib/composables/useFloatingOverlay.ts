import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Middleware,
  type Placement,
} from '@floating-ui/vue'
import { computed, nextTick, onBeforeUnmount, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'

export interface FloatingOverlayOptions {
  placement: Ref<Placement> | Placement
  gap?: number
  matchReferenceWidth?: boolean
  middleware?: Middleware[]
}

const VIEWPORT_PADDING = 8

/**
 * Positions an anchored overlay in the browser top layer.
 *
 * The floating element must use `popover="manual"` and be conditionally
 * rendered while `open` is true. Native popovers escape overflow and stacking
 * contexts without changing the element's logical DOM parent.
 */
export function useFloatingOverlay(
  referenceRef: Ref<HTMLElement | null | undefined>,
  floatingRef: Ref<HTMLElement | null | undefined>,
  open: Ref<boolean>,
  options: FloatingOverlayOptions,
) {
  const placement = computed<Placement>(() =>
    typeof options.placement === 'string'
      ? options.placement
      : options.placement.value
  )

  const middleware = computed<Middleware[]>(() => [
    offset(options.gap ?? 4),
    flip({ padding: VIEWPORT_PADDING, fallbackStrategy: 'bestFit' }),
    shift({ padding: VIEWPORT_PADDING }),
    size({
      padding: VIEWPORT_PADDING,
      apply({ availableHeight, availableWidth, elements, rects }) {
        const floating = elements.floating as HTMLElement
        floating.style.setProperty('--agala-floating-available-width', `${Math.max(0, availableWidth)}px`)
        floating.style.setProperty('--agala-floating-available-height', `${Math.max(0, availableHeight)}px`)
        if (options.matchReferenceWidth) {
          floating.style.width = `${Math.min(rects.reference.width, availableWidth)}px`
        }
      },
    }),
    ...(options.middleware ?? []),
  ])

  const result = useFloating(referenceRef, floatingRef, {
    open,
    placement,
    strategy: 'fixed',
    transform: false,
    middleware,
    whileElementsMounted: autoUpdate,
  })
  const floatingStyles = computed<CSSProperties>(() => ({
    ...result.floatingStyles.value,
    visibility: result.isPositioned.value ? 'visible' : 'hidden',
  }))

  function hideTopLayer(element = floatingRef.value) {
    if (element?.matches(':popover-open')) element.hidePopover()
  }

  watch(
    [open, floatingRef],
    async ([isOpen, element]) => {
      if (!element) return
      if (!isOpen) {
        hideTopLayer(element)
        return
      }

      await nextTick()
      if (!element.matches(':popover-open')) element.showPopover()
      await result.update()
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => hideTopLayer())

  return { ...result, floatingStyles }
}
