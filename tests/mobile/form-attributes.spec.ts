import { expect, test } from '@playwright/test'

const PKG_ROOT = process.cwd()
const VUE_URL = '/.vitepress/cache/deps/vue.js'
const LIB_URL = `/@fs${PKG_ROOT}/src/lib/index.ts`

test.describe('typed form attributes', () => {
  test('Input forwards form and ARIA attributes to the native input', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)
      const mountPoint = document.createElement('div')
      document.body.appendChild(mountPoint)

      const app = Vue.createApp({
        render: () => Vue.h(lib.AgalaInput, {
          id: 'email',
          name: 'email',
          required: true,
          autocomplete: 'email',
          ariaLabel: 'Email address',
          ariaDescribedby: 'email-help',
          ariaInvalid: true,
        }),
      })
      app.mount(mountPoint)
      await Vue.nextTick()

      const input = mountPoint.querySelector('input')!
      const wrapper = mountPoint.querySelector('.inputWrapper')!
      const attrs = {
        id: input.id,
        name: input.getAttribute('name'),
        required: input.required,
        autocomplete: input.getAttribute('autocomplete'),
        ariaLabel: input.getAttribute('aria-label'),
        ariaDescribedby: input.getAttribute('aria-describedby'),
        ariaInvalid: input.getAttribute('aria-invalid'),
        wrapperId: wrapper.getAttribute('id'),
        wrapperName: wrapper.getAttribute('name'),
      }
      app.unmount()
      mountPoint.remove()
      return attrs
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result).toEqual({
      id: 'email',
      name: 'email',
      required: true,
      autocomplete: 'email',
      ariaLabel: 'Email address',
      ariaDescribedby: 'email-help',
      ariaInvalid: 'true',
      wrapperId: null,
      wrapperName: null,
    })
  })

  test('custom form controls keep trigger naming and submit a native form value', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)
      const mountPoint = document.createElement('div')
      document.body.appendChild(mountPoint)

      const app = Vue.createApp({
        render: () => Vue.h('form', [
          Vue.h(lib.AgalaSelect, {
            id: 'country', name: 'country', required: true, autocomplete: 'country',
            ariaLabel: 'Country', options: [{ value: 'ar', label: 'Argentina' }],
          }),
          Vue.h(lib.AgalaCreatableSelect, {
            id: 'skills', name: 'skills', required: true, autocomplete: 'off',
            ariaLabel: 'Skills', options: [{ value: 'vue', label: 'Vue' }],
          }),
          Vue.h(lib.AgalaDatePicker, {
            id: 'birthday', name: 'birthday', required: true, autocomplete: 'bday',
            ariaLabel: 'Birthday', modelValue: '2026-08-21',
          }),
        ]),
      })
      app.mount(mountPoint)
      await Vue.nextTick()

      const controls = Array.from(mountPoint.querySelectorAll('[role="combobox"]'))
        .map(control => ({
          id: control.getAttribute('id'),
          name: control.getAttribute('name'),
          required: control.getAttribute('aria-required'),
          ariaLabel: control.getAttribute('aria-label'),
        }))
      const native = Array.from(mountPoint.querySelectorAll('select, input'))
        .map(control => ({
          tag: control.tagName,
          name: control.getAttribute('name'),
          required: control.hasAttribute('required'),
          autocomplete: control.getAttribute('autocomplete'),
        }))
      app.unmount()
      mountPoint.remove()
      return { controls, native }
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.controls).toEqual([
      { id: 'country', name: null, required: 'true', ariaLabel: 'Country' },
      { id: 'skills', name: null, required: 'true', ariaLabel: 'Skills' },
      { id: 'birthday', name: null, required: 'true', ariaLabel: 'Birthday' },
    ])
    expect(result.native).toEqual(expect.arrayContaining([
      { tag: 'SELECT', name: 'country', required: true, autocomplete: 'country' },
      { tag: 'INPUT', name: 'skills', required: true, autocomplete: 'off' },
      { tag: 'INPUT', name: 'birthday', required: true, autocomplete: 'bday' },
    ]))
  })
})
