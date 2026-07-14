import { expect, test } from '@playwright/test'
import { expectHorizontallyInsideViewport, expectInsideViewport, expectNoDocumentOverflow, openWithTheme } from './helpers'

test('all chart families resize within their mobile containers', async ({ page }) => {
  await openWithTheme(page, '/charts/')
  const charts = page.locator('.chart-gallery article')
  await expect(charts).toHaveCount(8)

  for (let index = 0; index < 8; index += 1) {
    const article = charts.nth(index)
    const canvas = article.locator('canvas')
    await expect(canvas).toBeVisible()
    await expectHorizontallyInsideViewport(page, article)

    const sizes = await article.evaluate((element) => {
      const articleRect = element.getBoundingClientRect()
      const canvasRect = element.querySelector('canvas')?.getBoundingClientRect()
      return { articleWidth: articleRect.width, canvasWidth: canvasRect?.width || 0 }
    })
    expect(sizes.canvasWidth).toBeLessThanOrEqual(sizes.articleWidth)
  }

  await expectNoDocumentOverflow(page)
})

test('chart tooltip is confined after touch interaction', async ({ page }) => {
  await openWithTheme(page, '/charts/')
  const canvas = page.locator('.chart-gallery article canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5)
  const tooltip = page.locator('div').filter({ hasText: /2026|2025/ }).last()
  if (await tooltip.isVisible()) await expectInsideViewport(page, tooltip)
  await expectNoDocumentOverflow(page)
})
