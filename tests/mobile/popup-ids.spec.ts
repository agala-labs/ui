import { expect, test } from '@playwright/test'

const PKG_ROOT = process.cwd()
const VUE_URL = '/.vitepress/cache/deps/vue.js'
const LIB_URL = `/@fs${PKG_ROOT}/src/lib/index.ts`

test.describe('per-instance popup IDs', () => {
  test('Select: two instances have unique aria-controls and listbox IDs', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const id = 'sel-fixture'
      const div = document.createElement('div')
      div.id = id
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h('div', { style: 'display:flex;flex-direction:column;gap:2rem;' }, [
            Vue.h('div', [
              Vue.h(lib.AgalaSelect, {
                options: [
                  { value: 'a', label: 'Argentina', subtitle: 'South America' },
                  { value: 'b', label: 'Brazil', subtitle: 'South America' },
                ],
              }),
            ]),
            Vue.h('div', [
              Vue.h(lib.AgalaSelect, {
                options: [
                  { value: 'c', label: 'Chile', subtitle: 'South America' },
                  { value: 'd', label: 'Denmark', subtitle: 'Europe' },
                ],
              }),
            ]),
          ])
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const comboboxes = Array.from(div.querySelectorAll('[role="combobox"]'))
      const controlIds: string[] = []
      const foundIds: string[] = []

      for (const cb of comboboxes) {
        const cid = cb.getAttribute('aria-controls') ?? ''
        controlIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 150))

        const target = document.getElementById(cid)
        if (target) foundIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 100))
      }

      app.unmount()
      div.remove()

      return { count: comboboxes.length, controlIds, foundIds }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.count).toBe(2)
    expect(result.controlIds[0]).toMatch(/^agala-select-listbox-/)
    expect(result.controlIds[1]).toMatch(/^agala-select-listbox-/)
    expect(result.controlIds[0]).not.toBe(result.controlIds[1])
    expect(result.foundIds).toEqual(result.controlIds)
  })

  test('CreatableSelect: two instances have unique aria-controls and listbox IDs', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const id = 'cs-fixture'
      const div = document.createElement('div')
      div.id = id
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h('div', { style: 'display:flex;flex-direction:column;gap:2rem;' }, [
            Vue.h('div', [
              Vue.h(lib.AgalaCreatableSelect, {
                options: [
                  { value: 'vue', label: 'Vue' },
                  { value: 'ts', label: 'TypeScript' },
                ],
              }),
            ]),
            Vue.h('div', [
              Vue.h(lib.AgalaCreatableSelect, {
                options: [
                  { value: 'go', label: 'Go' },
                  { value: 'rs', label: 'Rust' },
                ],
              }),
            ]),
          ])
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const comboboxes = Array.from(div.querySelectorAll('[role="combobox"]'))
      const controlIds: string[] = []
      const foundIds: string[] = []

      for (const cb of comboboxes) {
        const cid = cb.getAttribute('aria-controls') ?? ''
        controlIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 150))

        const target = document.getElementById(cid)
        if (target) foundIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 100))
      }

      app.unmount()
      div.remove()

      return { count: comboboxes.length, controlIds, foundIds }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.count).toBe(2)
    expect(result.controlIds[0]).toMatch(/^agala-creatable-listbox-/)
    expect(result.controlIds[1]).toMatch(/^agala-creatable-listbox-/)
    expect(result.controlIds[0]).not.toBe(result.controlIds[1])
    expect(result.foundIds).toEqual(result.controlIds)
  })

  test('DatePicker: two dropdown instances have unique grid IDs and matching aria-controls', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const id = 'dp-fixture'
      const div = document.createElement('div')
      div.id = id
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h('div', { style: 'display:flex;flex-direction:column;gap:2rem;' }, [
            Vue.h('div', [Vue.h(lib.AgalaDatePicker)]),
            Vue.h('div', [Vue.h(lib.AgalaDatePicker)]),
          ])
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const comboboxes = Array.from(div.querySelectorAll('[role="combobox"]'))
      const controlIds: string[] = []
      const foundIds: string[] = []

      for (const cb of comboboxes) {
        const cid = cb.getAttribute('aria-controls') ?? ''
        controlIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 150))

        const target = document.getElementById(cid)
        if (target) foundIds.push(cid)

        ;(cb as HTMLElement).click()
        await new Promise(r => setTimeout(r, 100))
      }

      app.unmount()
      div.remove()

      return { count: comboboxes.length, controlIds, foundIds }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.count).toBe(2)
    expect(result.controlIds[0]).toMatch(/^agala-date-grid-/)
    expect(result.controlIds[1]).toMatch(/^agala-date-grid-/)
    expect(result.controlIds[0]).not.toBe(result.controlIds[1])
    expect(result.foundIds).toEqual(result.controlIds)
  })

  test('Select/CreatableSelect/DatePicker: inputId and accessible naming props bind to the combobox trigger', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const id = 'label-fixture'
      const div = document.createElement('div')
      div.id = id
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h('div', { style: 'display:flex;flex-direction:column;gap:2rem;' }, [
            Vue.h(lib.AgalaSelect, {
              inputId: 'my-select',
              ariaLabel: 'Select country',
              ariaLabelledby: 'country-label',
              options: [
                { value: 'a', label: 'Argentina' },
                { value: 'b', label: 'Brazil' },
              ],
            }),
            Vue.h(lib.AgalaCreatableSelect, {
              inputId: 'my-creatable',
              ariaLabel: 'Creatable tags',
              ariaLabelledby: 'tags-label',
              options: [
                { value: 'vue', label: 'Vue' },
              ],
            }),
            Vue.h(lib.AgalaDatePicker, {
              inputId: 'my-date',
              ariaLabel: 'Pick a date',
              ariaLabelledby: 'date-label',
            }),
          ])
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const comboboxes = Array.from(div.querySelectorAll('[role="combobox"]'))
      const summary: Record<string, { inputId: string | null; ariaLabel: string | null; ariaLabelledby: string | null; controls: string | null }> = {}

      for (const cb of comboboxes) {
        summary[(cb as HTMLElement).getAttribute('id') ?? 'none'] = {
          inputId: cb.getAttribute('id'),
          ariaLabel: cb.getAttribute('aria-label'),
          ariaLabelledby: cb.getAttribute('aria-labelledby'),
          controls: cb.getAttribute('aria-controls'),
        }
      }

      app.unmount()
      div.remove()

      return { count: comboboxes.length, summary }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.count).toBe(3)

    const sel = result.summary['my-select']
    expect(sel?.inputId).toBe('my-select')
    expect(sel?.ariaLabel).toBe('Select country')
    expect(sel?.ariaLabelledby).toBe('country-label')
    expect(sel?.controls).toMatch(/^agala-select-listbox-/)

    const cre = result.summary['my-creatable']
    expect(cre?.inputId).toBe('my-creatable')
    expect(cre?.ariaLabel).toBe('Creatable tags')
    expect(cre?.ariaLabelledby).toBe('tags-label')
    expect(cre?.controls).toMatch(/^agala-creatable-listbox-/)

    const dp = result.summary['my-date']
    expect(dp?.inputId).toBe('my-date')
    expect(dp?.ariaLabel).toBe('Pick a date')
    expect(dp?.ariaLabelledby).toBe('date-label')
    expect(dp?.controls).toMatch(/^agala-date-grid-/)
  })

  test('Select: absent naming props do not emit empty id/aria attributes', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const div = document.createElement('div')
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h(lib.AgalaSelect, {
            ariaLabel: undefined,
            ariaLabelledby: undefined,
            options: [{ value: 'a', label: 'A' }],
          })
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const cb = div.querySelector('[role="combobox"]')
      const attrs = {
        hasId: cb!.hasAttribute('id'),
        hasAriaLabel: cb!.hasAttribute('aria-label'),
        hasAriaLabelledby: cb!.hasAttribute('aria-labelledby'),
      }

      app.unmount()
      div.remove()

      return attrs
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.hasId).toBe(false)
    expect(result.hasAriaLabel).toBe(false)
    expect(result.hasAriaLabelledby).toBe(false)
  })
})