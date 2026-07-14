/**
 * Reads HSL design tokens from the document at runtime and returns
 * an ECharts-compatible theme palette.
 *
 * Tokens are read fresh on every call so theme switches are reflected
 * immediately. Falls back to sensible defaults (SSR / test).
 */
export function useChartTheme() {
  function getToken(name: string, fallback: string): string {
    if (typeof document === 'undefined') return fallback
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback
  }

  function hslVar(name: string, fallback: string): string {
    return `hsl(${getToken(name, fallback)})`
  }

  /** Read all tokens fresh each call */
  function readTokens() {
    return {
      primary:   hslVar('--agala-primary', '239 84% 57%'),
      success:   hslVar('--agala-success', '142 71% 45%'),
      warning:   hslVar('--agala-warning', '43 96% 50%'),
      danger:    hslVar('--agala-danger', '0 84.2% 60.2%'),
      muted:     hslVar('--agala-muted-foreground', '240 3.8% 46.1%'),
      bg:        hslVar('--agala-card', '0 0% 100%'),
      fg:        hslVar('--agala-foreground', '240 10% 3.9%'),
      border:    hslVar('--agala-border', '240 5.9% 90%'),
    }
  }

  function getColorPalette(): string[] {
    const t = readTokens()
    return [t.primary, t.success, t.warning, t.danger, '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']
  }

  function getBaseOption(type: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'gauge') {
    const t = readTokens()
    const colorPalette = getColorPalette()
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const base: Record<string, unknown> = {
      color: colorPalette,
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: getToken('--agala-font-sans', 'system-ui, sans-serif'),
        color: t.fg,
      },
      animation: !reduceMotion,
      animationDuration: 500,
    }

    if (type === 'pie') {
      return {
        ...base,
        tooltip: {
          trigger: 'item' as const,
          confine: true,
          backgroundColor: t.bg,
          borderColor: t.border,
          borderWidth: 1,
          textStyle: { color: t.fg },
        },
        legend: {
          textStyle: { color: t.fg },
          type: 'scroll' as const,
        },
      }
    }

    if (type === 'radar') {
      return {
        ...base,
        tooltip: {
          trigger: 'item' as const,
          confine: true,
          backgroundColor: t.bg,
          borderColor: t.border,
          borderWidth: 1,
          textStyle: { color: t.fg },
        },
        legend: {
          textStyle: { color: t.fg },
          bottom: 0,
          type: 'scroll' as const,
        },
        splitLineColor: t.border,
        axisLineColor: t.border,
      }
    }

    if (type === 'gauge') {
      return {
        ...base,
        tooltip: { show: false },
      }
    }

    /* ─── Shared axis config (line, bar, scatter) ─── */
    const isScatter = type === 'scatter'

    return {
      ...base,
      tooltip: {
        trigger: isScatter ? ('item' as const) : ('axis' as const),
        confine: true,
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        textStyle: { color: t.fg },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: isScatter ? ('value' as const) : ('category' as const),
        axisLine: { lineStyle: { color: t.border } },
        axisLabel: { color: t.muted },
        splitLine: isScatter ? { lineStyle: { color: t.border, type: 'dashed' as const } } : { show: false },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { show: false },
        axisLabel: { color: t.muted },
        splitLine: {
          lineStyle: { color: t.border, type: 'dashed' as const },
        },
      },
    }
  }

  return { getBaseOption, getColorPalette }
}
