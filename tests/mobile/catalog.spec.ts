import { expect, test } from '@playwright/test'
import { expectNoDocumentOverflow, openWithTheme, settleVisuals, themes } from './helpers'

const componentSlugs = [
  'button', 'input', 'form-field', 'select', 'creatable-select', 'date-picker',
  'color-picker', 'checkbox', 'radio-group', 'textarea', 'markdown-editor',
  'toggle', 'file-upload', 'segmented-control', 'alert', 'badge', 'drawer',
  'modal', 'toast', 'tooltip', 'progress', 'skeleton', 'empty-state',
  'dev-env-banner', 'accordion', 'dropdown-menu', 'navbar', 'pagination',
  'sidebar', 'table', 'tabs', 'calendar', 'list-group', 'avatar', 'card',
  'center', 'divider', 'stack', 'spacer', 'stat', 'tag', 'icon',
] as const

test.describe('public component mobile layout', () => {
  for (const slug of componentSlugs) {
    test(`${slug} stays inside the document viewport`, async ({ page }) => {
      await openWithTheme(page, `/components/${slug}`)
      await expect(page.locator('.component-doc')).toBeVisible()
      await expectNoDocumentOverflow(page)
    })
  }
})

test.describe('default-theme component baselines', () => {
  for (const slug of componentSlugs) {
    test(`${slug} visual baseline`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-390', 'Catalog baselines use the representative 390px viewport.')
      await openWithTheme(page, `/components/${slug}`)
      await expect(page.locator('.component-doc')).toBeVisible()
      await expect(page).toHaveScreenshot(`${slug}.png`, { fullPage: true })
    })
  }
})

const criticalPages = ['calendar', 'table', 'tabs', 'markdown-editor', 'sidebar'] as const

for (const theme of themes) {
  test.describe(`${theme} critical visual surfaces`, () => {
    for (const slug of criticalPages) {
      test(`${slug} baseline`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'mobile-390', 'Cross-theme baselines use the representative 390px viewport.')
        await openWithTheme(page, `/components/${slug}`, theme)
        await settleVisuals(page)
        await expect(page).toHaveScreenshot(`${theme}-${slug}.png`, { fullPage: true })
      })
    }

    test('chart gallery baseline', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-390', 'Cross-theme baselines use the representative 390px viewport.')
      await openWithTheme(page, '/charts/', theme)
      await expect(page.locator('.chart-gallery canvas')).toHaveCount(8)
      await settleVisuals(page)
      await expectNoDocumentOverflow(page)
      await expect(page).toHaveScreenshot(`${theme}-charts.png`, { fullPage: true })
    })
  })
}
