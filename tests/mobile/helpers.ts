import { expect, type Locator, type Page } from '@playwright/test'

export type AuditTheme = 'default' | 'main' | 'smaltt' | 'kervo'

export const themes: AuditTheme[] = ['default', 'main', 'smaltt', 'kervo']

export async function openWithTheme(page: Page, path: string, theme: AuditTheme = 'default') {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('agala-docs-theme', selectedTheme)
  }, theme)
  await page.goto(path)
  await settleVisuals(page)
}

export async function settleVisuals(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 1ms !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 1ms !important;
      }
    `,
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  await page.waitForTimeout(120)
}

export async function expectNoDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

export async function expectInsideViewport(page: Page, locator: Locator, margin = 0) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()
  if (!viewport) return

  expect(box.x).toBeGreaterThanOrEqual(margin - 1)
  expect(box.y).toBeGreaterThanOrEqual(margin - 1)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - margin + 1)
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - margin + 1)
}

export async function expectHorizontallyInsideViewport(page: Page, locator: Locator, margin = 0) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()
  if (!viewport) return

  expect(box.x).toBeGreaterThanOrEqual(margin - 1)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - margin + 1)
}
