import { expect, test } from '@playwright/test'

const PKG_ROOT = process.cwd()
const VUE_URL = '/.vitepress/cache/deps/vue.js'
const LIB_URL = `/@fs${PKG_ROOT}/src/lib/index.ts`

test.describe('AgalaInput accessible target API', () => {
  test('inputId binds to the native input and FormField htmlFor activates it', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const div = document.createElement('div')
      div.id = 'input-id-fixture'
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h(lib.AgalaFormField, { label: 'Email address', htmlFor: 'email-input' }, {
            default: () => Vue.h(lib.AgalaInput, { inputId: 'email-input' }),
          })
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const input = div.querySelector('#email-input') as HTMLInputElement | null
      const label = div.querySelector('label') as HTMLLabelElement | null
      const wrapper = input?.closest('.inputWrapper') as HTMLElement | null

      let activated = false
      if (input && label) {
        label.click()
        await new Promise(r => setTimeout(r, 50))
        activated = document.activeElement === input
      }

      const summary = {
        inputTag: input?.tagName ?? null,
        inputId: input?.getAttribute('id') ?? null,
        labelFor: label?.getAttribute('for') ?? null,
        labelActivated: activated,
        wrapperId: wrapper?.getAttribute('id') ?? null,
        wrapperHasId: wrapper?.hasAttribute('id') ?? false,
      }

      app.unmount()
      div.remove()

      return summary
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.inputTag).toBe('INPUT')
    expect(result.inputId).toBe('email-input')
    expect(result.labelFor).toBe('email-input')
    expect(result.labelActivated).toBe(true)
    expect(result.wrapperId).toBeNull()
    expect(result.wrapperHasId).toBe(false)
  })

  test('aria-label and aria-labelledby bind to the native input only, never the wrapper', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const hint = document.createElement('span')
      hint.id = 'email-hint'
      hint.textContent = 'Enter a valid email.'
      document.body.appendChild(hint)

      const div = document.createElement('div')
      div.id = 'input-aria-fixture'
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h(lib.AgalaInput, {
            ariaLabel: 'Email address',
            ariaLabelledby: 'email-hint',
          })
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const input = div.querySelector('input') as HTMLInputElement | null
      const wrapper = input?.closest('.inputWrapper') as HTMLElement | null

      const summary = {
        inputAriaLabel: input?.getAttribute('aria-label') ?? null,
        inputAriaLabelledby: input?.getAttribute('aria-labelledby') ?? null,
        wrapperAriaLabel: wrapper?.getAttribute('aria-label') ?? null,
        wrapperAriaLabelledby: wrapper?.getAttribute('aria-labelledby') ?? null,
        wrapperHasAriaLabel: wrapper?.hasAttribute('aria-label') ?? false,
        wrapperHasAriaLabelledby: wrapper?.hasAttribute('aria-labelledby') ?? false,
      }

      app.unmount()
      div.remove()
      hint.remove()

      return summary
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.inputAriaLabel).toBe('Email address')
    expect(result.inputAriaLabelledby).toBe('email-hint')
    expect(result.wrapperAriaLabel).toBeNull()
    expect(result.wrapperAriaLabelledby).toBeNull()
    expect(result.wrapperHasAriaLabel).toBe(false)
    expect(result.wrapperHasAriaLabelledby).toBe(false)
  })

  test('absent naming props do not emit conflicting empty id/aria attributes', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const div = document.createElement('div')
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        render() {
          return Vue.h(lib.AgalaInput)
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const input = div.querySelector('input') as HTMLInputElement | null
      const summary = {
        hasId: input?.hasAttribute('id') ?? true,
        hasAriaLabel: input?.hasAttribute('aria-label') ?? true,
        hasAriaLabelledby: input?.hasAttribute('aria-labelledby') ?? true,
        ariaLabelValue: input?.getAttribute('aria-label') ?? null,
        ariaLabelledbyValue: input?.getAttribute('aria-labelledby') ?? null,
      }

      app.unmount()
      div.remove()

      return summary
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.hasId).toBe(false)
    expect(result.hasAriaLabel).toBe(false)
    expect(result.hasAriaLabelledby).toBe(false)
    expect(result.ariaLabelValue).toBeNull()
    expect(result.ariaLabelledbyValue).toBeNull()
  })

  test('model updates, password type, focus, and disabled/readonly/error semantics are preserved', async ({ page }) => {
    await page.goto('/')

    const result = await page.evaluate(async ({ vueUrl, libUrl }) => {
      const Vue = await import(vueUrl)
      const lib = await import(libUrl)

      const div = document.createElement('div')
      div.id = 'input-regression-fixture'
      div.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;padding:1rem;background:white;'
      document.body.appendChild(div)

      const app = Vue.createApp({
        setup() {
          const form = Vue.reactive({ value: 'start' })
          return () =>
            Vue.h('div', { style: 'display:flex;flex-direction:column;gap:1rem;' }, [
              Vue.h(lib.AgalaInput, {
                'modelValue': form.value,
                'onUpdate:modelValue': (v: string) => { form.value = v },
                type: 'password',
              }),
              Vue.h(lib.AgalaInput, { modelValue: 'locked', disabled: true }),
              Vue.h(lib.AgalaInput, { modelValue: 'bad', readonly: true, error: true, errorMessage: 'Invalid' }),
            ])
        },
      })

      app.mount(div)
      await Vue.nextTick()
      await new Promise(r => setTimeout(r, 200))

      const inputs = Array.from(div.querySelectorAll('input')) as HTMLInputElement[]
      const [password, disabled, locked] = inputs

      password.value = 'dispatch-me'
      password.dispatchEvent(new Event('input', { bubbles: true }))
      password.focus()
      await Vue.nextTick()

      const summary = {
        count: inputs.length,
        passwordType: password.getAttribute('type'),
        modelUpdated: password.value,
        focused: document.activeElement === password,
        disabledHasDisabled: disabled.hasAttribute('disabled'),
        disabledValue: disabled.value,
        lockedDisabled: locked.disabled,
        lockedReadonly: locked.getAttribute('readonly'),
        lockedAriaInvalid: locked.getAttribute('aria-invalid'),
        lockedHasErrorClass: locked.classList.contains('inputError'),
        lockedValue: locked.value,
      }

      app.unmount()
      div.remove()

      return summary
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    expect(result.count).toBe(3)
    expect(result.modelUpdated).toBe('dispatch-me')
    expect(result.passwordType).toBe('password')
    expect(result.focused).toBe(true)
    expect(result.disabledHasDisabled).toBe(true)
    expect(result.disabledValue).toBe('locked')
    expect(result.lockedReadonly).not.toBeNull()
    expect(result.lockedAriaInvalid).toBe('true')
    expect(result.lockedHasErrorClass).toBe(true)
    expect(result.lockedValue).toBe('bad')
  })
})