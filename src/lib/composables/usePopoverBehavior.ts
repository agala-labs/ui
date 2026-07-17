import { watch, type Ref } from 'vue'

export interface PopoverBehaviorOptions {
  closeOnScroll?: boolean
}

/**
 * Shared popover behavior: click-outside close and optional scroll close.
 *
 * Must be called inside a component's `<script setup>` block.
 *
 * @param isOpen       Reactive ref controlling popover visibility
 * @param wrapperRef   Ref to the trigger/wrapper element
 * @param floatingRef  Ref to the floating popover element
 * @param close        Callback to close the popover
 * @param options      Dismissal options; anchored menus may remain open on scroll
 */
export function usePopoverBehavior(
  isOpen: Ref<boolean>,
  wrapperRef: Ref<HTMLElement | undefined | null>,
  floatingRef: Ref<HTMLElement | undefined | null>,
  close: () => void,
  options: PopoverBehaviorOptions = {},
) {
  watch(isOpen, (open) => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        !wrapperRef.value?.contains(target) &&
        !floatingRef.value?.contains(target)
      ) {
        close()
      }
    }

    const handleScroll = (e: Event) => {
      if (!floatingRef.value?.contains(e.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClick)
    if (options.closeOnScroll !== false) {
      window.addEventListener('scroll', handleScroll, true)
    }

    watch(isOpen, (newOpen) => {
      if (!newOpen) {
        document.removeEventListener('mousedown', handleClick)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }, { once: true })
  })
}
