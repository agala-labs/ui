import { reactive, h, markRaw, type VNode, type Component } from 'vue'
import Modal from './Modal.vue'
import type { ModalResult, ModalOptions } from './types'

export interface ModalEntry<P = Record<string, unknown>> {
  id: number
  open: boolean
  component: Component
  props: P
  options: ModalOptions
  resolve: (result: ModalResult) => void
}

const state = reactive<{
  modals: ModalEntry[]
}>({
  modals: [],
})

class ModalManagerImpl {
  private _idCounter = 0

  /**
   * Open a modal imperatively with a Vue component.
   * Returns a Promise that resolves when the modal is closed.
   *
   * @example
   * const result = await modalManager.open(MyConfirmDialog, {
   *   props: { message: 'Delete?' },
   *   size: 'sm',
   * })
   * if (result.confirmed) { … }
   */
  open<P extends Record<string, unknown>>(
    component: Component,
    options: ModalOptions & { props?: P } = {}
  ): Promise<ModalResult> {
    return new Promise((resolve) => {
      const id = ++this._idCounter
      const entry: ModalEntry<P> = {
        id,
        open: true,
        component: markRaw(component),
        props: options.props ?? ({} as P),
        options: {
          size: options.size,
          title: options.title,
          dismissible: options.dismissible,
          escapeCloses: options.escapeCloses,
          hideHeader: options.hideHeader,
        },
        resolve,
      }
      state.modals.push(entry as ModalEntry)
    })
  }

  /** Close the top-most modal */
  close(result: ModalResult = { confirmed: false }) {
    const current = state.modals[state.modals.length - 1]
    if (!current || !current.open) return
    current.resolve(result)
    current.open = false
  }

  /** Close all modals */
  closeAll(result: ModalResult = { confirmed: false }) {
    const current = state.modals[state.modals.length - 1]
    if (!current) return
    for (const entry of state.modals) {
      if (entry.open) entry.resolve(result)
    }
    state.modals.splice(0, Math.max(0, state.modals.length - 1))
    current.open = false
  }

  /** Remove a closed entry after its visual leave completes. */
  finalize(id: number) {
    const index = state.modals.findIndex(entry => entry.id === id)
    if (index !== -1 && !state.modals[index].open) state.modals.splice(index, 1)
  }

  get modals() {
    return state.modals
  }
}

export const modalManager = new ModalManagerImpl()

/** Helper to render a modal entry with its component */
export function renderModalEntry(entry: ModalEntry): VNode {
  return h(Modal, {
    open: entry.open,
    title: entry.options.title,
    size: entry.options.size,
    dismissible: entry.options.dismissible,
    escapeCloses: entry.options.escapeCloses,
    hideHeader: entry.options.hideHeader,
    onClose: () => modalManager.close({ confirmed: false }),
    onAfterLeave: () => modalManager.finalize(entry.id),
  }, {
    default: () => h(entry.component, entry.props),
  })
}
