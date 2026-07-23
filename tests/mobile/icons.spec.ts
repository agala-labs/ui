import { expect, test } from '@playwright/test'
import { expectNoDocumentOverflow, openWithTheme, themes } from './helpers'

test.describe('AgalaIcon registry', () => {
  test('renders the complete searchable registry and compatibility aliases', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'The exhaustive registry needs one representative viewport.')
    await openWithTheme(page, '/components/icon')

    const cards = page.locator('.icon-card')
    expect(await cards.count()).toBeGreaterThan(90)
    await expect(cards.locator('.icon-card__preview svg')).toHaveCount(await cards.count())
    await expect(page.locator('.icon-card__alias svg')).toHaveCount(7)
    await expect(page.locator('.icon-card svg').first()).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('.icon-card svg').first()).toHaveAttribute('focusable', 'false')

    const search = page.getByRole('searchbox', { name: 'Search icons' })
    await search.fill('linked-diagnosis')
    await expect(cards).toHaveCount(1)
    await expect(cards.first()).toContainText('diagnosis-link')
    await expect(cards.first().locator('[data-icon="diagnosis-link"]')).toHaveCount(2)

    await search.fill('stock')
    await expect(cards).toHaveCount(1)
    await expect(cards.first()).toContainText('stock-location')
    await expectNoDocumentOverflow(page)
  })

  test('uses named size and stroke tokens across product themes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Theme token coverage needs one representative viewport.')

    for (const theme of themes) {
      await openWithTheme(page, '/components/icon', theme)
      const icon = page.locator('.icon-card__preview [data-icon="search"]')
      await expect(icon).toHaveCSS('width', '20px')
      await expect(icon).toHaveCSS('height', '20px')
      await expect(icon).toHaveCSS('stroke-width', '2px')

      const tokens = await page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement)
        return ['--agala-space-4', '--agala-font-size-4xl', '--agala-info', '--agala-input-background', '--agala-layer-tooltip']
          .map(name => styles.getPropertyValue(name).trim())
      })
      expect(tokens.every(Boolean)).toBe(true)
    }
  })

  test('keeps optional motion contextual and respects reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Motion behavior needs one representative viewport.')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openWithTheme(page, '/components/icon')

    const externalLink = page.getByRole('button', { name: 'Open report' }).locator('svg')
    await page.getByRole('button', { name: 'Open report' }).hover()
    await expect(externalLink).not.toHaveCSS('transform', 'none')

    const activeChevron = page.getByRole('button', { name: 'Expanded' }).locator('svg')
    await expect(activeChevron).not.toHaveCSS('transform', 'none')

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(externalLink).toHaveCSS('transform', 'none')
    await expect(activeChevron).toHaveCSS('transform', 'none')
  })
})
