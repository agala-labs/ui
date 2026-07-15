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

const criticalPages = ['calendar', 'table', 'tabs', 'segmented-control', 'markdown-editor', 'sidebar'] as const

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

test.describe('refined component interactions', () => {
  test('table exposes deterministic sort, selection, and interactive rows', async ({ page }) => {
    await openWithTheme(page, '/components/table')

    const memberHeader = page.locator('th').filter({ hasText: 'Member' })
    await expect(memberHeader).toHaveAttribute('aria-sort', 'ascending')
    await memberHeader.getByRole('button', { name: 'Member' }).click()
    await expect(memberHeader).toHaveAttribute('aria-sort', 'descending')

    const rows = page.locator('tbody tr')
    await expect(rows.first()).toHaveAttribute('aria-selected', 'true')
    await expect(rows.first()).toHaveAttribute('tabindex', '0')
    await expect(page.locator('.skeletonLine')).toHaveCount(0)
  })

  test('tabs move focus, skip disabled items, and keep pills scoped to the strip', async ({ page }) => {
    await openWithTheme(page, '/components/tabs')

    const overview = page.getByRole('tab', { name: 'Overview' })
    await overview.focus()
    await overview.press('ArrowRight')
    const activity = page.getByRole('tab', { name: 'Activity' })
    await expect(activity).toBeFocused()
    await expect(activity).toHaveAttribute('aria-selected', 'true')

    await activity.press('End')
    await expect(page.getByRole('tab', { name: 'Milestones' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeDisabled()
    await expect(page.locator('.tabList.tabsPills')).toHaveCount(1)
    await expect(page.locator('.tabs.tabsPills')).toHaveCount(0)
  })

  test('calendar event cards expose complete labels in the detailed day view', async ({ page }) => {
    await openWithTheme(page, '/components/calendar')

    await expect(page.locator('[data-calendar-event]')).toHaveCount(4)
    await expect(page.getByRole('button', { name: /Design review/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /10:00 AM.*Design review.*Checkout handoff/ })).toBeVisible()
    await expectNoDocumentOverflow(page)
  })

  test('segmented control keeps radio focus local and skips disabled choices', async ({ page }) => {
    await openWithTheme(page, '/components/segmented-control')

    const group = page.getByRole('radiogroup', { name: 'View mode' })
    await expect(group).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(group).toHaveClass(/segControlBlock/)

    const board = page.getByRole('radio', { name: 'Board' })
    await expect(board).toHaveAttribute('aria-checked', 'true')
    await board.focus()
    await board.press('ArrowRight')

    const list = page.getByRole('radio', { name: 'List' })
    await expect(list).toBeFocused()
    await expect(list).toHaveAttribute('aria-checked', 'true')
    await list.press('End')
    await expect(list).toBeFocused()
    await expect(page.getByRole('radio', { name: 'Timeline' })).toBeDisabled()
    await list.press('ArrowRight')
    await expect(board).toBeFocused()
    await expect(group.locator('svg')).toHaveCount(3)
  })

  test('refined surfaces remain bounded with the default dark preference', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'One representative viewport covers default dark preference behavior.')
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })

    for (const slug of ['table', 'tabs', 'calendar', 'segmented-control']) {
      await openWithTheme(page, `/components/${slug}`)
      await expect(page.locator('.component-doc')).toBeVisible()
      await expectNoDocumentOverflow(page)
      expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(true)
    }
  })
})
