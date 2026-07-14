import { expect, test } from '@playwright/test'
import { expectInsideViewport, expectNoDocumentOverflow, openWithTheme, settleVisuals, themes } from './helpers'

for (const theme of themes) {
  test.describe(`${theme} Drawer`, () => {
    test('contains focus, locks scroll, restores focus, and matches its baseline', async ({ page }) => {
      await openWithTheme(page, '/components/drawer', theme)
      const trigger = page.getByRole('button', { name: 'Open filters' })
      await trigger.click()

      const drawer = page.getByRole('dialog', { name: 'Filters' })
      await expect(drawer).toBeVisible()
      await settleVisuals(page)
      await expectInsideViewport(page, drawer)
      await expect(page.locator('body')).toHaveCSS('position', 'fixed')
      await expectNoDocumentOverflow(page)

      for (let index = 0; index < 8; index += 1) {
        await page.keyboard.press('Tab')
        await expect(drawer.locator(':focus')).toHaveCount(1)
      }

      await settleVisuals(page)
      await expect(page).toHaveScreenshot(`${theme}-drawer-open.png`)
      await page.keyboard.press('Escape')
      await expect(drawer).toBeHidden()
      await expect(trigger).toBeFocused()
    })
  })
}

test('Modal remains bounded and restores its opener', async ({ page }) => {
  await openWithTheme(page, '/components/modal')
  const trigger = page.getByRole('button', { name: 'Open modal' })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expectInsideViewport(page, dialog, 8)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

const floatingCases = [
  { path: '/components/select', trigger: '[role="combobox"]', floating: '[role="listbox"]' },
  { path: '/components/creatable-select', trigger: '[role="combobox"]', floating: '[role="listbox"]' },
  { path: '/components/date-picker', trigger: '[role="combobox"]', floating: '.dropdown' },
  { path: '/components/color-picker', trigger: '[role="combobox"][aria-haspopup="dialog"]', floating: '[role="dialog"]' },
] as const

for (const floatingCase of floatingCases) {
  test(`${floatingCase.path} floating panel stays in the viewport`, async ({ page }) => {
    await openWithTheme(page, floatingCase.path)
    const trigger = page.locator('.demo-frame__preview').locator(floatingCase.trigger).first()
    await trigger.focus()
    await trigger.press('ArrowDown')
    const floating = page.locator(floatingCase.floating).last()
    await expect(floating).toBeVisible()
    await settleVisuals(page)
    await expectInsideViewport(page, floating, 8)
    await expectNoDocumentOverflow(page)
  })
}

test('Dropdown menu stays bounded on narrow screens', async ({ page }) => {
  await openWithTheme(page, '/components/dropdown-menu')
  await page.locator('.demo-frame__preview').getByRole('button').first().click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expectInsideViewport(page, menu)
  await expectNoDocumentOverflow(page)
})
