import { expect, test, type Locator } from '@playwright/test'
import { expectNoDocumentOverflow, openWithTheme, settleVisuals, themes } from './helpers'

async function contrastRatio(locator: Locator) {
  return locator.evaluate((element) => {
    const parseColor = (value: string) => {
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? []
      return {
        rgb: channels.slice(0, 3),
        alpha: channels[3] ?? 1,
      }
    }
    const composite = (foreground: number[], alpha: number, background: number[]) =>
      foreground.map((channel, index) => channel * alpha + background[index] * (1 - alpha))
    const backdropFor = (start: Element | null) => {
      let current = start
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor)
        if (color.rgb.length === 3 && color.alpha > 0) return color
        current = current.parentElement
      }
      return { rgb: [255, 255, 255], alpha: 1 }
    }
    const luminance = (rgb: number[]) => {
      const linear = rgb.map(channel => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
    }

    const styles = getComputedStyle(element)
    const foreground = parseColor(styles.color)
    const background = parseColor(styles.backgroundColor)
    const backdrop = backdropFor(element.parentElement)
    const effectiveForeground = composite(foreground.rgb, foreground.alpha, backdrop.rgb)
    const effectiveBackground = composite(background.rgb, background.alpha, backdrop.rgb)
    const foregroundLuminance = luminance(effectiveForeground)
    const backgroundLuminance = luminance(effectiveBackground)

    return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
      / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  })
}

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

test.describe('Kervo semantic contrast', () => {
  test('danger button keeps an AA contrast pair across interaction states', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Semantic contrast needs one representative browser viewport.')
    await openWithTheme(page, '/components/button', 'kervo')

    const danger = page.getByRole('button', { name: 'Delete' })
    await expect(danger).toBeVisible()
    expect(await contrastRatio(danger)).toBeGreaterThanOrEqual(4.5)

    await danger.focus()
    await expect(danger).toBeFocused()
    await expect(danger).not.toHaveCSS('box-shadow', 'none')

    await danger.hover()
    expect(await contrastRatio(danger)).toBeGreaterThanOrEqual(4.5)

    await danger.evaluate((button: HTMLButtonElement) => { button.disabled = true })
    await expect(danger).toBeDisabled()
    await expect(danger).toHaveCSS('opacity', '0.5')
    expect(await contrastRatio(danger)).toBeGreaterThanOrEqual(4.5)
  })
})

const criticalPages = ['alert', 'calendar', 'table', 'tabs', 'segmented-control', 'markdown-editor', 'sidebar'] as const

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
  test('list group applies semantic badges and preserves slot and keyboard behavior', async ({ page }) => {
    await openWithTheme(page, '/components/list-group')

    const variants = ['default', 'primary', 'success', 'warning', 'danger'] as const
    const tokenByVariant = {
      default: '--agala-primary',
      primary: '--agala-primary',
      success: '--agala-success',
      warning: '--agala-warning',
      danger: '--agala-danger',
    } as const

    for (const variant of variants) {
      const badge = page.locator(`.list-demo-${variant} .listBadgeInner--${variant}`)
      await expect(badge).toHaveCount(1)

      const expectedColor = await page.evaluate((token) => {
        const probe = document.createElement('span')
        probe.style.color = `hsl(var(${token}))`
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }, tokenByVariant[variant])
      await expect(badge).toHaveCSS('color', expectedColor)
    }

    await expect(page.locator('.list-demo-custom-badge .custom-list-badge')).toHaveCount(1)
    await expect(page.locator('.list-demo-custom-badge .listBadgeInner')).toHaveCount(0)
    await expect(page.locator('.list-demo-custom-trailing .custom-list-trailing')).toHaveCount(1)
    await expect(page.locator('.list-demo-custom-trailing .listBadgeInner')).toHaveCount(0)

    const defaultItem = page.locator('.list-demo-default')
    await defaultItem.focus()
    await defaultItem.press('Enter')
    await defaultItem.press('Space')
    await expect(page.locator('.interaction-status')).toHaveText('Activations: 2')

    const disabledItem = page.locator('.list-demo-disabled')
    await expect(disabledItem).toHaveAttribute('tabindex', '-1')
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    await disabledItem.dispatchEvent('click')
    await expect(page.locator('.interaction-status')).toHaveText('Activations: 2')
  })

  test('alert action is reachable and the notice treatment stays borderless', async ({ page }) => {
    await openWithTheme(page, '/components/alert')

    const plainAlert = page.getByRole('alert').first()
    await expect(plainAlert.locator(':scope > .alert__content')).toHaveCount(1)
    await expect(plainAlert.locator('.alert__message')).toHaveCount(0)
    await expect(plainAlert).toHaveCSS('border-left-width', '0px')

    const actionable = page.locator('.alert-action-demo')
    await expect(actionable.locator('.alert__action')).toHaveCount(1)
    const retry = actionable.getByRole('button', { name: 'Retry' })
    await retry.focus()
    await expect(retry).toBeFocused()
    await retry.press('Enter')
    await expect(actionable.getByRole('button', { name: 'Retry (1)' })).toBeVisible()
    await expect(actionable.locator('.alert__icon')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    const flat = page.locator('.alert-flat-action-demo')
    await expect(flat.locator('.alert__action')).toHaveCount(1)
    await expect(flat).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    if ((page.viewportSize()?.width ?? 0) >= 640) {
      const alignment = await actionable.evaluate((element) => {
        const content = element.querySelector('.alert__content')?.getBoundingClientRect()
        const action = element.querySelector('.alert__action')?.getBoundingClientRect()
        if (!content || !action) return Number.POSITIVE_INFINITY
        return Math.abs((content.top + content.height / 2) - (action.top + action.height / 2))
      })
      expect(alignment).toBeLessThanOrEqual(1)
    }

    await expectNoDocumentOverflow(page)
  })

  test('stat renders neutral secondary values before trends in every layout', async ({ page }) => {
    await openWithTheme(page, '/components/stat')

    await expect(page.locator('.stat-secondary-row .statSecondary')).toHaveText('$280,000')
    await expect(page.locator('.stat-secondary-inline-zero .statSecondary')).toHaveText('0')
    await expect(page.locator('.stat-secondary-empty .statSecondary')).toHaveText('')

    const combined = page.locator('.stat-secondary-with-trend')
    await expect(combined.locator('.statSecondary')).toHaveText('Across 18 teams')
    expect(await combined.evaluate((element) => {
      const secondary = element.querySelector('.statSecondary')
      const trend = element.querySelector('.trend')
      return Boolean(secondary && trend && (secondary.compareDocumentPosition(trend) & Node.DOCUMENT_POSITION_FOLLOWING))
    })).toBe(true)

    const trendOnly = page.locator('.agala-doc-grid > .stat').first()
    await expect(trendOnly.locator('.statSecondary')).toHaveCount(0)
    await expect(trendOnly.locator('.trendText')).toContainText('+12.4%')
  })

  test('empty state supports default and compact custom-slot layouts', async ({ page }) => {
    await openWithTheme(page, '/components/empty-state')

    const defaultState = page.locator('.empty-demo-default')
    const compactState = page.locator('.empty-demo-compact')
    await expect(defaultState).toHaveClass(/emptyStateDefault/)
    await expect(compactState).toHaveClass(/emptyStateCompact/)
    await expect(defaultState.locator('.emptyIcon svg')).toHaveCount(1)
    await expect(compactState.locator('.emptyIcon svg')).toHaveCount(1)
    await expect(defaultState.locator('.emptyAction button')).toHaveCount(1)
    await expect(compactState.locator('.emptyAction button')).toHaveCount(1)
    expect(await compactState.locator('.emptyDescription').evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    await expectNoDocumentOverflow(page)
  })

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
