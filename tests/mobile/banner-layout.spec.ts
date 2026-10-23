import { expect, test } from '@playwright/test'
import { expectNoDocumentOverflow, openWithTheme, themes } from './helpers'

const VUE_URL = '/.vitepress/cache/deps/vue.js'
const LIB_URL = `/@fs${process.cwd()}/src/lib/index.ts`

for (const palette of [...themes, 'dark'] as const) {
  test(`banner geometry and contrast in ${palette}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: palette === 'dark' ? 'dark' : 'light' })
    await openWithTheme(page, '/', palette === 'dark' ? 'default' : palette)
    await page.evaluate(async ({ vueUrl, libUrl }) => {
      const { createApp, h } = await import(vueUrl)
      const { AgalaAlert, AgalaButton } = await import(libUrl)
      const fixture = document.createElement('main')
      fixture.style.cssText = 'padding:16px;box-sizing:border-box;width:100%;background:hsl(var(--agala-card))'
      document.body.replaceChildren(fixture)
      createApp({
        render: () => h('div', { style: 'display:grid;gap:16px' },
          ['info', 'success', 'warning', 'danger'].flatMap(variant =>
            [false, true].map(flat => h(AgalaAlert, {
              variant,
              flat,
              icon: flat ? false : undefined,
              title: 'This account needs attention before the next scheduled update',
              dismissible: true,
            }, {
              default: () => 'Review the pending changes for workspace-with-a-very-long-unbroken-identifier-0123456789 before continuing.',
              action: () => h(AgalaButton, { size: 'sm', variant: 'outline' },
                () => 'Review the pending changes for this workspace'),
            }))),
        ),
      }).mount(fixture)
    }, { vueUrl: VUE_URL, libUrl: LIB_URL })

    await expect(page.locator('.alert')).toHaveCount(8)
    const measurements = await page.locator('.alert').evaluateAll((banners) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const context = canvas.getContext('2d')!
      const luminance = (color: string) => {
        context.clearRect(0, 0, 1, 1)
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const [r, g, b] = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map(channel => {
          const value = channel / 255
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        })
        return r * 0.2126 + g * 0.7152 + b * 0.0722
      }
      const contrast = (foreground: string, background: string) => {
        const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
        return (values[0] + 0.05) / (values[1] + 0.05)
      }
      return banners.map(banner => {
        const box = banner.getBoundingClientRect()
        const content = banner.querySelector('.alert__content')!.getBoundingClientRect()
        const action = banner.querySelector('.alert__action')!.getBoundingClientRect()
        const button = banner.querySelector('.alert__action button')!
        const dismiss = banner.querySelector('.alert__dismiss')!.getBoundingClientRect()
        const icon = banner.querySelector('.alert__icon')
        const styles = getComputedStyle(banner)
        const flat = banner.classList.contains('alert--flat')
        const background = flat ? getComputedStyle(document.querySelector('main')!).backgroundColor : styles.backgroundColor
        return {
          fits: [content, action, dismiss].every(region => region.left >= box.left && region.top >= box.top && region.right <= box.right + 1 && region.bottom <= box.bottom + 1),
          actionBelow: innerWidth >= 640 || (action.top >= content.bottom && Math.abs(action.left - content.left) <= 1),
          actionTextFits: button.scrollHeight <= button.clientHeight + 1,
          flatPadding: !flat || (styles.paddingLeft === '0px' && styles.paddingRight === '0px'),
          bodyContrast: contrast(getComputedStyle(banner.querySelector('.alert__body')!).color, background),
          iconContrast: icon ? contrast(getComputedStyle(icon).color, background) : 21,
          dismissContrast: contrast(getComputedStyle(banner.querySelector('.alert__dismiss')!).color, background),
        }
      })
    })

    for (const measurement of measurements) {
      expect(measurement.fits).toBe(true)
      expect(measurement.actionBelow).toBe(true)
      expect(measurement.actionTextFits).toBe(true)
      expect(measurement.flatPadding).toBe(true)
      expect(measurement.bodyContrast).toBeGreaterThanOrEqual(4.5)
      expect(measurement.iconContrast).toBeGreaterThanOrEqual(3)
      expect(measurement.dismissContrast).toBeGreaterThanOrEqual(3)
    }
    await expectNoDocumentOverflow(page)
  })
}
