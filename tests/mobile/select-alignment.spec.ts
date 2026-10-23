import { expect, test } from '@playwright/test'

for (const direction of ['ltr', 'rtl'] as const) {
  test(`select content leaves controls at the trailing edge (${direction})`, async ({ page }) => {
    await page.goto('/components/select')

    const measurements = await page.evaluate(async ({ direction, root }) => {
      const Vue = await import('/.vitepress/cache/deps/vue.js')
      const lib = await import(`/@fs${root}/src/lib/index.ts`)
      // Match Vite's versioned module so the provider shares Reka's injection symbols.
      const rekaUrl = performance.getEntriesByType('resource').find(entry => entry.name.includes('/reka-ui.js?v='))!.name
      const { ConfigProvider } = await import(rekaUrl)
      const host = document.createElement('div')
      host.style.cssText = 'position:fixed;inset:0;z-index:99999;padding:16px;background:white;overflow:auto'
      host.dir = direction
      document.body.appendChild(host)
      const options = [
        { value: 'short', label: 'Short' },
        { value: 'long', label: 'A very long option label that must never push the trailing controls outside the field'.repeat(2) },
      ]
      const app = Vue.createApp({
        render() {
          return Vue.h(ConfigProvider, { dir: direction }, () => Vue.h('div', { style: 'width:260px' }, [
            ...[false, true].flatMap(searchable => [
              { modelValue: '' },
              { modelValue: '', placeholder: options[1].label },
              { modelValue: 'short' },
              { modelValue: 'long' },
              { modelValue: ['short', 'long'], multiple: true },
            ].map(props => Vue.h(lib.AgalaSelect, { options, searchable, clearable: true, ...props }))),
            ...[
              { modelValue: [] },
              { modelValue: [], placeholder: options[1].label },
              { modelValue: ['short'] },
              { modelValue: ['short', 'long'] },
            ].map(props => Vue.h(lib.AgalaCreatableSelect, { options, ...props })),
          ]))
        },
      })
      app.mount(host)
      await Vue.nextTick()
      const results = Array.from(host.querySelectorAll<HTMLElement>('[role=combobox]')).map(trigger => {
        const style = getComputedStyle(trigger)
        const field = trigger.getBoundingClientRect()
        const chevron = trigger.querySelector('.chevron')!.getBoundingClientRect()
        const clear = trigger.querySelector('.clearBtn')?.getBoundingClientRect()
        const content = trigger.querySelector('.triggerSingleLabel, .triggerPlaceholder, .chips')!.getBoundingClientRect()
        const edgeGap = direction === 'ltr'
          ? field.right - chevron.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)
          : chevron.left - field.left - parseFloat(style.paddingLeft) - parseFloat(style.borderLeftWidth)
        const control = clear ?? chevron
        return {
          edgeGap,
          contentGap: direction === 'ltr' ? control.left - content.right : content.left - control.right,
          contentWidth: content.width,
        }
      })
      app.unmount()
      host.remove()
      return results
    }, { direction, root: process.cwd() })

    expect(measurements).toHaveLength(14)
    for (const measurement of measurements) {
      expect(Math.abs(measurement.edgeGap)).toBeLessThan(1)
      expect(measurement.contentGap).toBeGreaterThanOrEqual(3)
      expect(measurement.contentWidth).toBeGreaterThan(180)
    }
  })
}

for (const slug of ['select', 'creatable-select']) {
  test(`${slug} docs selection can still be cleared and opened with the keyboard`, async ({ page }) => {
    await page.goto(`/components/${slug}`)
    const trigger = page.locator('.demo-frame [role=combobox]').first()
    await trigger.getByRole('button', { name: 'Clear selection', exact: true }).click()
    await expect(trigger.locator('.triggerPlaceholder')).toBeVisible()
    await trigger.focus()
    await trigger.press('ArrowDown')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByPlaceholder(slug === 'select' ? 'Search…' : 'Search or create…', { exact: true }).fill(slug === 'select' ? 'Uruguay' : 'TypeScript')
    await page.getByRole('option', { name: slug === 'select' ? /Uruguay/ : 'TypeScript', exact: slug !== 'select' }).click()
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toContainText(slug === 'select' ? 'Uruguay' : 'TypeScript')
  })
}
