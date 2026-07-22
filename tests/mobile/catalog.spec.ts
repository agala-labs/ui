import { expect, test, type Locator } from '@playwright/test'
import { expectNoDocumentOverflow, openWithTheme, themes } from './helpers'

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

test.describe('component example navigation', () => {
  test('keeps the selected preview and snippet in sync', async ({ page }) => {
    await openWithTheme(page, '/components/button')

    const examples = page.locator('.component-examples')
    await expect(page.getByRole('tablist', { name: 'Component examples' })).toBeVisible()
    await expect(examples).toHaveAttribute('data-active-example', 'variants')
    await page.getByRole('tab', { name: 'States' }).click()
    await expect(examples).toHaveAttribute('data-active-example', 'states')
    await expect(page.locator('[data-preview-example="states"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Saving' })).toBeDisabled()
    await expect(page.locator('.demo-frame__code code')).toContainText('loading')
    await expect(page).toHaveURL(/example=states/)
    await page.getByRole('button', { name: 'Copy' }).click()
    await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  })

  test('supports URL selection, keyboard navigation, and invalid fallback', async ({ page }) => {
    await openWithTheme(page, '/components/button?example=states')
    await expect(page.getByRole('tab', { name: 'States' })).toHaveAttribute('aria-selected', 'true')

    await page.getByRole('tab', { name: 'States' }).press('Home')
    await expect(page.getByRole('tab', { name: 'Variants' })).toHaveAttribute('aria-selected', 'true')
    await expect(page).not.toHaveURL(/example=/)

    await openWithTheme(page, '/components/button?example=missing')
    await expect(page.locator('.component-examples')).toHaveAttribute('data-active-example', 'variants')
    await expectNoDocumentOverflow(page)
  })

  test('keeps example tabs focusable across themes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Theme coverage needs one representative viewport.')

    for (const theme of themes) {
      await openWithTheme(page, '/components/button', theme)
      const states = page.getByRole('tab', { name: 'States' })
      await states.focus()
      await expect(states).toBeFocused()
      await expect(states).not.toHaveCSS('outline-style', 'none')
    }
  })
})

test.describe('public component mobile layout', () => {
  for (const slug of componentSlugs) {
    test(`${slug} stays inside the document viewport`, async ({ page }) => {
      await openWithTheme(page, `/components/${slug}`)
      await expect(page.locator('.component-doc')).toBeVisible()
      const exampleTabs = page.getByRole('tablist', { name: 'Component examples' }).getByRole('tab')
      expect(await exampleTabs.count()).toBeGreaterThanOrEqual(2)
      await exampleTabs.nth(1).click()
      const activeExample = await page.locator('.component-examples').getAttribute('data-active-example')
      expect(activeExample).toBeTruthy()
      await expect(page.locator(`[data-preview-example="${activeExample}"]`)).toBeVisible()
      await expect(page.locator('.demo-frame__code code')).not.toBeEmpty()
      await expectNoDocumentOverflow(page)
    })
  }

  for (const slug of componentSlugs) {
    test(`${slug} examples remain bounded at desktop width`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-390', 'Desktop catalog coverage needs one representative project.')
      await page.setViewportSize({ width: 1280, height: 900 })
      await openWithTheme(page, `/components/${slug}`)
      await page.getByRole('tablist', { name: 'Component examples' }).getByRole('tab').nth(1).click()
      await expectNoDocumentOverflow(page)
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

  test('stat layouts preserve hierarchy and intrinsic height', async ({ page }) => {
    await openWithTheme(page, '/components/stat')

    const combined = page.locator('.stat-dashboard-members')
    await expect(combined.locator('.statSecondary')).toHaveText('Across 18 teams')
    expect(await combined.evaluate((element) => {
      const secondary = element.querySelector('.statSecondary')
      const trend = element.querySelector('.trend')
      return Boolean(secondary && trend && (secondary.compareDocumentPosition(trend) & Node.DOCUMENT_POSITION_FOLLOWING))
    })).toBe(true)

    const trendOnly = page.locator('.stat-dashboard-revenue')
    await expect(trendOnly.locator('.statSecondary')).toHaveCount(0)
    await expect(trendOnly.locator('.trendText')).toContainText('+12.4%')
    await expect(trendOnly.locator('.statIcon')).toHaveCount(1)
    await expect(trendOnly).toHaveCSS('box-shadow', 'none')
    await expect(trendOnly.locator('.statLabel')).toHaveCSS('text-transform', 'none')
    await page.getByRole('tab', { name: 'Attention row' }).click()
    const row = page.locator('.stat-attention-row')
    await expect(row.locator('.statSecondary')).toHaveText('$280k at risk')
    await expect(row.locator('.statIcon')).toHaveCount(1)
    await expect(row).toHaveCSS('align-self', 'flex-start')

    await page.getByRole('tab', { name: 'Inline summary' }).click()
    const inline = page.locator('.stat-inline-summary')
    await expect(inline.locator('.statSecondary')).toHaveText('0 overdue')
    await expect(inline).toHaveCSS('flex-direction', 'row')
    await expect(inline).toHaveCSS('align-self', 'flex-start')
    await expect(inline).toHaveCSS('border-top-width', '0px')
    expect(await inline.evaluate((element) => {
      const label = element.querySelector('.statLabel')?.getBoundingClientRect()
      const value = element.querySelector('.statValue')?.getBoundingClientRect()
      const secondary = element.querySelector('.statSecondary')?.getBoundingClientRect()
      if (!label || !value || !secondary) return false
      const sharesLine = (a: DOMRect, b: DOMRect) => a.top < b.bottom && a.bottom > b.top
      return label.right <= value.left && value.right <= secondary.left
        && sharesLine(label, value) && sharesLine(value, secondary)
    })).toBe(true)

    const longInline = page.locator('.stat-inline-long')
    await expect(longInline.locator('.trendText')).toContainText('0%')
    await expect(longInline.locator('.trendIcon')).toHaveCount(0)
    await expectNoDocumentOverflow(page)
  })

  test('stat layouts remain intrinsic across themes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'Theme coverage needs one representative viewport.')

    for (const theme of themes) {
      await openWithTheme(page, '/components/stat', theme)
      await page.getByRole('tab', { name: 'Inline summary' }).click()
      const inline = page.locator('.stat-inline-summary')
      await expect(inline).toHaveCSS('align-self', 'flex-start')
      await expectNoDocumentOverflow(page)
    }
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

    const eventContentSize = (event: Locator) => event.evaluate((element) => {
      const styles = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return {
        width: rect.width
          - parseFloat(styles.paddingLeft)
          - parseFloat(styles.paddingRight)
          - parseFloat(styles.borderLeftWidth)
          - parseFloat(styles.borderRightWidth),
        height: rect.height
          - parseFloat(styles.paddingTop)
          - parseFloat(styles.paddingBottom)
          - parseFloat(styles.borderTopWidth)
          - parseFloat(styles.borderBottomWidth),
        visibleTextContained: Array.from(element.querySelectorAll<HTMLElement>('.title, .time, .subtitle'))
          .filter(node => getComputedStyle(node).display !== 'none')
          .every((node) => {
            const nodeRect = node.getBoundingClientRect()
            return nodeRect.top >= rect.top && nodeRect.bottom <= rect.bottom
              && nodeRect.left >= rect.left && nodeRect.right <= rect.right
          }),
      }
    })

    await expect(page.locator('[data-calendar-event]')).toHaveCount(4)
    const mediumEvent = page.getByRole('button', { name: /10:00 AM.*Design review.*Checkout handoff/ })
    const tallEvent = page.getByRole('button', { name: /10:30 AM.*Release readiness.*API and web/ })
    const compactEvent = page.getByRole('button', { name: /2:00 PM.*Team planning/ })

    await expect(mediumEvent).toBeVisible()
    await expect(mediumEvent.locator('.subtitle')).toHaveCount(0)
    await expect(tallEvent.locator('.subtitle')).toHaveText('API and web')
    await expect(compactEvent.locator('.time')).toHaveCount(0)
    await expect(compactEvent.locator('.subtitle')).toHaveCount(0)
    await expect(mediumEvent).toHaveCSS('border-left-width', '2px')

    const mediumSize = await eventContentSize(mediumEvent)
    const tallSize = await eventContentSize(tallEvent)
    expect(await mediumEvent.locator('.time').isVisible()).toBe(mediumSize.width > 80 && mediumSize.height > 36)
    expect(await tallEvent.locator('.time').isVisible()).toBe(tallSize.width > 80 && tallSize.height > 36)
    expect(await tallEvent.locator('.subtitle').isVisible()).toBe(tallSize.width > 96 && tallSize.height > 56)
    expect(mediumSize.visibleTextContained).toBe(true)
    expect(tallSize.visibleTextContained).toBe(true)
    await expectNoDocumentOverflow(page)
  })

  test('sidebar reserves the selected surface for the active leaf', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-768', 'The expanded desktop tree is visible from 768px.')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await openWithTheme(page, '/components/sidebar')

    const parent = page.getByRole('button', { name: 'Projects', exact: true })
    const activeLeaf = page.getByRole('button', { name: 'Active projects', exact: true })
    await expect(activeLeaf).toHaveAttribute('aria-current', 'page')
    await expect(parent).toHaveClass(/sidebarTreeItem--descendant-active/)
    await expect(parent).not.toHaveClass(/sidebarTreeItem--active/)
    await expect(parent).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    const panel = page.locator('.sidebarTreePanel').first()
    await panel.evaluate(element => element.classList.add('sidebarTreePanel-enter-active'))
    await expect(panel).toHaveCSS('transition-property', 'grid-template-rows')
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
