import { expect, test } from '@playwright/test'

const PKG_ROOT = process.cwd()
const VUE_URL = '/.vitepress/cache/deps/vue.js'
const LIB_URL = `/@fs${PKG_ROOT}/src/lib/index.ts`

test.describe('Textarea and ListGroup semantics', () => {
  test('Textarea forwards native identifiers, ARIA/data attributes and readonly', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)
      const mountPoint = document.createElement('div')
      document.body.appendChild(mountPoint)

      const app = Vue.createApp({
        render: () => Vue.h(lib.AgalaFormField, {
          label: 'Notes',
          htmlFor: 'notes',
        }, {
          default: () => Vue.h(lib.AgalaTextarea, {
            id: 'notes',
            name: 'notes',
            required: true,
            readonly: true,
            ariaDescribedby: 'notes-help',
            ariaLabelledby: 'notes-label',
            'data-testid': 'notes-control',
          }),
        }),
      })
      app.mount(mountPoint)
      await Vue.nextTick()

      const textarea = mountPoint.querySelector('textarea')!
      const wrapper = mountPoint.querySelector('.wrapper')!
      const label = mountPoint.querySelector('label')!
      const attrs = {
        id: textarea.id,
        name: textarea.getAttribute('name'),
        required: textarea.required,
        readOnly: textarea.readOnly,
        ariaLabelledby: textarea.getAttribute('aria-labelledby'),
        ariaDescribedby: textarea.getAttribute('aria-describedby'),
        dataTestid: textarea.getAttribute('data-testid'),
        labelFor: label.htmlFor,
        wrapperId: wrapper.getAttribute('id'),
        wrapperDataTestid: wrapper.getAttribute('data-testid'),
      }
      app.unmount()
      mountPoint.remove()
      return attrs
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result).toEqual({
      id: 'notes',
      name: 'notes',
      required: true,
      readOnly: true,
      ariaLabelledby: 'notes-label',
      ariaDescribedby: 'notes-help',
      dataTestid: 'notes-control',
      labelFor: 'notes',
      wrapperId: null,
      wrapperDataTestid: null,
    })
  })

  test('ListGroupItem keeps listitem semantics by default and supports native actions', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)
      const mountPoint = document.createElement('div')
      document.body.appendChild(mountPoint)

      const app = Vue.createApp({
        render: () => Vue.h('div', [
          Vue.h(lib.AgalaListGroupItem, { label: 'Record', 'data-testid': 'record' }),
          Vue.h(lib.AgalaListGroupItem, { label: 'Save', interactive: true, 'data-testid': 'save' }),
          Vue.h(lib.AgalaListGroupItem, { label: 'Open', as: 'a', href: '/open', 'data-testid': 'open' }),
          Vue.h(lib.AgalaListGroupItem, { label: 'Disabled link', as: 'a', href: '/blocked', disabled: true, 'data-testid': 'blocked' }),
        ]),
      })
      app.mount(mountPoint)
      await Vue.nextTick()

      const describe = (selector: string) => {
        const element = mountPoint.querySelector(selector) as HTMLElement
        return {
          tag: element.tagName,
          role: element.getAttribute('role'),
          tabIndex: element.tabIndex,
          type: element.getAttribute('type'),
          href: element.getAttribute('href'),
          disabled: (element as HTMLButtonElement).disabled || false,
          ariaDisabled: element.getAttribute('aria-disabled'),
        }
      }
      const semantics = {
        record: describe('[data-testid="record"]'),
        save: describe('[data-testid="save"]'),
        open: describe('[data-testid="open"]'),
        blocked: describe('[data-testid="blocked"]'),
      }
      const blocked = mountPoint.querySelector('[data-testid="blocked"]')!
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })
      blocked.dispatchEvent(click)
      app.unmount()
      mountPoint.remove()
      return { semantics, blockedClickPrevented: click.defaultPrevented }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result).toEqual({
      semantics: {
        record: { tag: 'DIV', role: 'listitem', tabIndex: 0, type: null, href: null, disabled: false, ariaDisabled: null },
        save: { tag: 'BUTTON', role: null, tabIndex: 0, type: 'button', href: null, disabled: false, ariaDisabled: null },
        open: { tag: 'A', role: null, tabIndex: 0, type: null, href: '/open', disabled: false, ariaDisabled: null },
        blocked: { tag: 'A', role: null, tabIndex: -1, type: null, href: '/blocked', disabled: false, ariaDisabled: 'true' },
      },
      blockedClickPrevented: true,
    })
  })
})
