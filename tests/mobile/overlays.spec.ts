import { expect, test } from '@playwright/test'
import { expectInsideViewport, expectNoDocumentOverflow, openWithTheme, settleVisuals, themes } from './helpers'

for (const theme of themes) {
  test.describe(`${theme} Drawer`, () => {
    test('contains focus, locks scroll, and restores focus', async ({ page }) => {
      await openWithTheme(page, '/components/drawer', theme)
      await page.addStyleTag({
        content: '.drawer-backdrop.drawer-leave-active { transition-duration: 180ms !important; } .drawer-backdrop.drawer-leave-active .drawer { transition-duration: 180ms !important; }',
      })
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

      await page.keyboard.press('Escape')
      await expect(page.locator('.drawer-backdrop')).toHaveClass(/drawer-leave-active/)
      await expect(page.locator('body')).toHaveCSS('position', 'fixed')
      await expect(trigger).not.toBeFocused()
      await expect(drawer).toBeHidden()
      await expect(trigger).toBeFocused()
      await expect.poll(() => page.locator('body').evaluate(element => getComputedStyle(element).position)).not.toBe('fixed')
    })
  })
}

test('Drawer leaves toward every configured edge and survives a rapid reopen', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Placement and interruption coverage runs once.')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openWithTheme(page, '/components/drawer')
  await page.addStyleTag({
    content: '.drawer-backdrop.drawer-leave-active { transition-duration: 180ms !important; } .drawer-backdrop.drawer-leave-active .drawer { transition-duration: 180ms !important; }',
  })

  const placements = [
    { trigger: 'Open filters', className: 'drawer--right', closedTransform: 'translate3d(100%, 0, 0)' },
    { trigger: 'Open left drawer', className: 'drawer--left', closedTransform: 'translate3d(-100%, 0, 0)' },
    { trigger: 'Open top drawer', className: 'drawer--top', closedTransform: 'translate3d(0, -100%, 0)' },
    { trigger: 'Open bottom drawer', className: 'drawer--bottom', closedTransform: 'translate3d(0, 100%, 0)' },
  ]

  for (const placement of placements) {
    const trigger = page.getByRole('button', { name: placement.trigger })
    await trigger.click()
    const drawer = page.getByRole('dialog', { name: 'Filters' })
    await expect(drawer).toHaveClass(new RegExp(placement.className))
    expect(await drawer.evaluate(element => getComputedStyle(element).getPropertyValue('--agala-drawer-closed-transform').trim())).toBe(placement.closedTransform)
    await page.keyboard.press('Escape')
    await expect(page.locator('.drawer-backdrop')).toHaveClass(/drawer-leave-active/)
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()
  }

  const trigger = page.getByRole('button', { name: 'Open filters' })
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.drawer-backdrop')).toHaveClass(/drawer-leave-active/)
  await trigger.evaluate(element => element.click())
  const reopened = page.getByRole('dialog', { name: 'Filters' })
  await expect(reopened).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('position', 'fixed')
  await expect(reopened.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(reopened).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Drawer removes meaningful travel for reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Reduced-motion lifecycle coverage runs once.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openWithTheme(page, '/components/drawer')
  const trigger = page.getByRole('button', { name: 'Open filters' })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Filters' })
  const backdrop = page.locator('.drawer-backdrop')
  await backdrop.evaluate(element => element.classList.add('drawer-leave-active', 'drawer-leave-to'))
  await expect(backdrop).toHaveCSS('transition-duration', '0.001s')
  await expect(drawer).toHaveCSS('transition-duration', '0.001s')
  await expect(drawer).toHaveCSS('transform', 'none')
  await backdrop.evaluate(element => element.classList.remove('drawer-leave-active', 'drawer-leave-to'))
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
})

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

test('Tooltip uses collision-aware top-layer positioning for hover and focus', async ({ page }) => {
  await openWithTheme(page, '/components/tooltip')
  const trigger = page.getByRole('button', { name: 'Copy link' })
  await trigger.hover()

  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toBeVisible()
  const shell = tooltip.locator('..')
  expect(await shell.evaluate(element => element.matches(':popover-open'))).toBe(true)
  await expectInsideViewport(page, shell, 8)
  expect(await shell.evaluate(element => element.parentElement?.classList.contains('tooltipWrapper'))).toBe(true)

  await page.mouse.move(0, 0)
  await expect(tooltip).toBeHidden()
  await trigger.focus()
  await expect(tooltip).toBeVisible()
})

test('Dropdown menu stays bounded on narrow screens', async ({ page }) => {
  await openWithTheme(page, '/components/dropdown-menu')
  await page.locator('.demo-frame__preview').getByRole('button').first().click()
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expectInsideViewport(page, menu)
  await expectNoDocumentOverflow(page)
})

test('Dropdown menu escapes overflow, flips above the final table row, and tracks scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Run the full collision fixture at one representative viewport.')
  await openWithTheme(page, '/components/dropdown-menu')

  const container = page.getByTestId('dropdown-scroll-container')
  const dimensionsBefore = await container.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  await container.evaluate(element => { element.scrollTop = element.scrollHeight })

  const trigger = page.getByRole('button', { name: 'Actions for Team member 7' })
  await trigger.evaluate(element => {
    const delta = element.getBoundingClientRect().bottom - window.innerHeight + 12
    window.scrollBy(0, delta)
  })
  await trigger.click()

  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expectInsideViewport(page, menu, 8)
  await expect(menu).toHaveJSProperty('popover', 'manual')
  expect(await menu.evaluate(element => element.matches(':popover-open'))).toBe(true)

  const flipped = await Promise.all([trigger.boundingBox(), menu.boundingBox()])
  expect(flipped[0]).not.toBeNull()
  expect(flipped[1]).not.toBeNull()
  expect(flipped[1]!.y + flipped[1]!.height).toBeLessThanOrEqual(flipped[0]!.y - 3)

  const dimensionsOpen = await container.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(dimensionsOpen).toEqual(dimensionsBefore)

  const initialOffset = flipped[0]!.y - (flipped[1]!.y + flipped[1]!.height)
  await container.evaluate(element => { element.scrollTop -= 24 })
  await page.waitForTimeout(50)
  await expect(menu).toBeVisible()
  const tracked = await Promise.all([trigger.boundingBox(), menu.boundingBox()])
  const trackedOffset = tracked[0]!.y - (tracked[1]!.y + tracked[1]!.height)
  expect(Math.abs(trackedOffset - initialOffset)).toBeLessThanOrEqual(1)
})

test('Dropdown placements align and overflow-hidden ancestors do not clip the menu', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Run the full collision fixture at one representative viewport.')
  await openWithTheme(page, '/components/dropdown-menu')

  const startTrigger = page.getByRole('button', { name: 'Start aligned' })
  await startTrigger.click()
  let menu = page.getByRole('menu')
  let boxes = await Promise.all([startTrigger.boundingBox(), menu.boundingBox()])
  expect(Math.abs(boxes[0]!.x - boxes[1]!.x)).toBeLessThanOrEqual(1)
  await page.keyboard.press('Escape')

  const endTrigger = page.getByRole('button', { name: 'End aligned' })
  await endTrigger.click()
  menu = page.getByRole('menu')
  boxes = await Promise.all([endTrigger.boundingBox(), menu.boundingBox()])
  expect(Math.abs((boxes[0]!.x + boxes[0]!.width) - (boxes[1]!.x + boxes[1]!.width))).toBeLessThanOrEqual(1)
  await page.keyboard.press('Escape')

  const hiddenContainer = page.getByTestId('dropdown-hidden-container')
  await hiddenContainer.getByRole('button', { name: 'Overflow hidden' }).click()
  menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  const escapes = await Promise.all([hiddenContainer.boundingBox(), menu.boundingBox()])
  expect(escapes[1]!.y + escapes[1]!.height).toBeGreaterThan(escapes[0]!.y + escapes[0]!.height)
  expect(await menu.evaluate(element => {
    const rect = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2))
  })).toBe(true)
})

test('Dropdown mouse and keyboard dismissal remain functional', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Run interaction coverage once.')
  await openWithTheme(page, '/components/dropdown-menu')
  const trigger = page.getByRole('button', { name: 'Start aligned' })

  await trigger.focus()
  await trigger.press('ArrowDown')
  await trigger.press('ArrowDown')
  await trigger.press('Enter')
  await expect(page.getByTestId('dropdown-activations')).toHaveText('Activations: 1')
  await expect(page.getByRole('menu')).toBeHidden()

  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toBeHidden()

  await trigger.click()
  await trigger.press('Tab')
  await expect(page.getByRole('menu')).toBeHidden()

  await trigger.click()
  await page.getByRole('heading', { name: 'Dropdown Menu' }).click()
  await expect(page.getByRole('menu')).toBeHidden()
})

test('Dropdown menu enters the top layer above modal and drawer overlays', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Run overlay stacking coverage once.')
  await openWithTheme(page, '/components/dropdown-menu')

  for (const surface of ['modal', 'drawer'] as const) {
    await page.getByRole('button', { name: `Open dropdown ${surface}` }).click()
    const overlay = surface === 'modal'
      ? page.getByRole('dialog', { name: 'Dropdown modal' })
      : page.getByRole('dialog', { name: 'Dropdown drawer' })
    await expect(overlay).toBeVisible()
    await overlay.getByRole('button', { name: `${surface === 'modal' ? 'Modal' : 'Drawer'} actions` }).click()

    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    expect(await menu.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return element.matches(':popover-open') && element.contains(hit)
    })).toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await page.keyboard.press('Escape')
    await expect(overlay).toBeHidden()
  }
})
