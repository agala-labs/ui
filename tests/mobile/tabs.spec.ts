import { expect, test, type Locator, type Page } from '@playwright/test'
import { openWithTheme } from './helpers'

const previewTabs = (page: Page): Locator =>
  page.getByRole('tablist', { name: 'Project sections' }).getByRole('tab')

async function openTabs(page: Page, example?: string) {
  const url = example ? `/components/tabs?example=${example}` : '/components/tabs'
  await openWithTheme(page, url)
  const tablist = page.getByRole('tablist', { name: 'Project sections' })
  await expect(tablist).toBeVisible()
  return tablist
}

async function expectSelection(page: Page, tab: Locator, name: RegExp) {
  await expect(tab).toHaveAccessibleName(name)
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  await expect(tab).toBeFocused()
  const tabId = await tab.getAttribute('id')
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabId ?? '')
}

test.describe('AgalaTabs orientation', () => {
  test('horizontal tabs expose horizontal aria and Left/Right arrow keyboard behavior', async ({ page }) => {
    const tablist = await openTabs(page)
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')

    const tabs = previewTabs(page)
    const overview = tabs.nth(0)
    const activity = tabs.nth(1)
    const milestones = tabs.nth(2)
    const settings = tabs.nth(3)
    await expect(settings).toBeDisabled()

    await expect(overview).toHaveAttribute('aria-selected', 'true')
    const panelId = await page.getByRole('tabpanel').getAttribute('id')
    await expect(overview).toHaveAttribute('aria-controls', panelId ?? '')

    await overview.focus()
    await page.keyboard.press('ArrowRight')
    await expectSelection(page, activity, /Activity/)

    await page.keyboard.press('ArrowRight')
    await expectSelection(page, milestones, /Milestones/)

    await page.keyboard.press('ArrowRight')
    await expectSelection(page, overview, /Overview/)

    await page.keyboard.press('ArrowLeft')
    await expectSelection(page, milestones, /Milestones/)

    await page.keyboard.press('Home')
    await expectSelection(page, overview, /Overview/)
    await page.keyboard.press('End')
    await expectSelection(page, milestones, /Milestones/)

    await expectSelection(page, milestones, /Milestones/)
    await page.keyboard.press('ArrowDown')
    await expectSelection(page, milestones, /Milestones/)
    await page.keyboard.press('ArrowUp')
    await expectSelection(page, milestones, /Milestones/)
  })

  test('preview example switcher drives dynamic aria-orientation on a live instance', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Dynamic orientation coverage runs once.')
    const tablist = await openTabs(page)
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')

    const switcher = page.getByRole('tablist', { name: 'Component examples' })
    await switcher.getByRole('tab', { name: 'Vertical rail' }).click()
    await expect(page.locator('[data-preview-example="vertical"]')).toBeVisible()
    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical')
    await expect(tablist).toHaveAttribute('aria-label', 'Project sections')
    await expect(page).toHaveURL(/example=vertical/)
  })

  test('vertical orientation is a genuine side rail: structure, classes, and stacking', async ({ page }) => {
    const tablist = await openTabs(page, 'vertical')
    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical')

    const root = page.locator('.tabsVertical')
    await expect(root).toHaveCount(1)
    await expect(page.locator('.tabListShellVertical')).toHaveCount(1)

    const panel = page.getByRole('tabpanel')
    const listBox = await tablist.boundingBox()
    const panelBox = await panel.boundingBox()
    expect(listBox).not.toBeNull()
    expect(panelBox).not.toBeNull()
    if (!listBox || !panelBox) return
    expect(listBox.x).toBeLessThan(panelBox.x)
    expect(panelBox.x).toBeGreaterThanOrEqual(listBox.x + listBox.width - 1)
    await expect(panel).toHaveCSS('padding-left', '20px')
    await expect(panel).toHaveCSS('padding-top', '0px')
    await expect(panel).toHaveCSS('flex-grow', '1')
    await expect(panel).toHaveCSS('flex-shrink', '1')

    const tabs = previewTabs(page)
    const boxes = await Promise.all([
      tabs.nth(0).boundingBox(),
      tabs.nth(1).boundingBox(),
      tabs.nth(2).boundingBox(),
    ])
    expect(boxes[0]).not.toBeNull()
    expect(boxes[1]).not.toBeNull()
    expect(boxes[2]).not.toBeNull()
    if (!boxes[0] || !boxes[1] || !boxes[2]) return
    expect(Math.abs(boxes[0].x - boxes[1].x)).toBeLessThanOrEqual(1)
    expect(Math.abs(boxes[1].x - boxes[2].x)).toBeLessThanOrEqual(1)
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 1)
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 1)

    const panelId = await panel.getAttribute('id')
    await expect(tabs.nth(0)).toHaveAttribute('aria-controls', panelId ?? '')
    await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', await tabs.nth(0).getAttribute('id').then(String))
  })

  test('vertical orientation uses Up/Down arrows, ignores Left/Right, and skips disabled tabs', async ({ page }) => {
    await openTabs(page, 'vertical')
    const tabs = previewTabs(page)
    const overview = tabs.nth(0)
    const activity = tabs.nth(1)
    const milestones = tabs.nth(2)
    const settings = tabs.nth(3)
    await expect(settings).toBeDisabled()

    await overview.focus()
    await expectSelection(page, overview, /Overview/)

    await page.keyboard.press('ArrowLeft')
    await expectSelection(page, overview, /Overview/)
    await page.keyboard.press('ArrowRight')
    await expectSelection(page, overview, /Overview/)

    await page.keyboard.press('ArrowDown')
    await expectSelection(page, activity, /Activity/)
    await page.keyboard.press('ArrowDown')
    await expectSelection(page, milestones, /Milestones/)
    await page.keyboard.press('ArrowDown')
    await expectSelection(page, overview, /Overview/)

    await page.keyboard.press('ArrowUp')
    await expectSelection(page, milestones, /Milestones/)

    await page.keyboard.press('Home')
    await expectSelection(page, overview, /Overview/)
    await page.keyboard.press('End')
    await expectSelection(page, milestones, /Milestones/)
  })

  test('vertical rail keeps a token-friendly side rail without document overflow', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Run the side-rail surface check once.')
    await openTabs(page, 'vertical')

    const active = page.getByRole('tab', { name: /Overview/ })
    await expect(active).toHaveCSS('border-right-style', 'solid')
    await expect(active).not.toHaveCSS('border-bottom-style', 'solid')

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})