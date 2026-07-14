import { onUnmounted, watch, type Ref } from 'vue'

interface SavedBodyStyles {
  left: string
  overflow: string
  paddingRight: string
  position: string
  right: string
  top: string
  width: string
}

const activeLocks = new Set<symbol>()
let savedBodyStyles: SavedBodyStyles | null = null
let savedScrollY = 0

function lockBody(token: symbol) {
  if (typeof document === 'undefined' || activeLocks.has(token)) return

  if (activeLocks.size === 0) {
    const body = document.body
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    const computedPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0

    savedBodyStyles = {
      left: body.style.left,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
      width: body.style.width,
    }
    savedScrollY = window.scrollY

    body.style.overflow = 'hidden'
    body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`
    body.style.position = 'fixed'
    body.style.left = '0'
    body.style.right = '0'
    body.style.top = `-${savedScrollY}px`
    body.style.width = 'auto'
  }

  activeLocks.add(token)
}

function unlockBody(token: symbol) {
  if (typeof document === 'undefined' || !activeLocks.delete(token)) return
  if (activeLocks.size > 0 || !savedBodyStyles) return

  const body = document.body
  body.style.left = savedBodyStyles.left
  body.style.overflow = savedBodyStyles.overflow
  body.style.paddingRight = savedBodyStyles.paddingRight
  body.style.position = savedBodyStyles.position
  body.style.right = savedBodyStyles.right
  body.style.top = savedBodyStyles.top
  body.style.width = savedBodyStyles.width
  savedBodyStyles = null

  window.scrollTo(0, savedScrollY)
}

export function useBodyScrollLock(active: Ref<boolean>) {
  const token = Symbol('agala-body-scroll-lock')

  watch(active, (shouldLock) => {
    if (shouldLock) lockBody(token)
    else unlockBody(token)
  }, { immediate: true })

  onUnmounted(() => unlockBody(token))
}
