/* ─── Color math utilities ─── */
/* Pure functions, zero dependencies. All conversions return or accept:
 *   RGB  → { r, g, b }  (0-255)
 *   HSL  → { h, s, l }  (h: 0-360, s: 0-100, l: 0-100)
 *   HSB  → { h, s, b }  (h: 0-360, s: 0-100, b: 0-100)
 *   HEX  → "#rrggbb"    (lowercase, 7 chars)
 */

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface HSB { h: number; s: number; b: number }

const HEX_RE = /^#?([0-9a-fA-F]{6})$/
const HEX_SHORT_RE = /^#?([0-9a-fA-F]{3})$/

/** Parse hex string → RGB. Accepts "#ff6600", "ff6600", "#f60". Returns null on invalid input. */
export function hexToRgb(hex: string): RGB | null {
  const h = hex.trim()

  const short = h.match(HEX_SHORT_RE)
  if (short) {
    const [r, g, b] = short[1].split('').map(c => parseInt(c + c, 16))
    return { r, g, b }
  }

  const long = h.match(HEX_RE)
  if (long) {
    return {
      r: parseInt(long[1].slice(0, 2), 16),
      g: parseInt(long[1].slice(2, 4), 16),
      b: parseInt(long[1].slice(4, 6), 16),
    }
  }

  return null
}

/** RGB (0-255) → HSL (h: 0-360, s: 0-100, l: 0-100) */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    if (max === rn) {
      h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6
    } else if (max === gn) {
      h = ((bn - rn) / delta + 2) / 6
    } else {
      h = ((rn - gn) / delta + 4) / 6
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** HSL (h: 0-360, s: 0-100, l: 0-100) → RGB (0-255) */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const hn = h / 360
  const sn = s / 100
  const ln = l / 100

  if (s === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  }
}

/** RGB (0-255) → hex string "#rrggbb" (lowercase) */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Hex string → HSL. Returns null on invalid input. */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

/** HSL → hex string */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/** Validate hex string — accepts "#ff6600", "ff6600", "#f60", "f60" */
export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex) || HEX_SHORT_RE.test(hex)
}

/** HSB → HSL (used when converting square cursor position to internal color model) */
export function hsbToHsl(hsb: HSB): HSL {
  const s = hsb.s / 100
  const v = hsb.b / 100
  const l = v * (1 - s / 2)
  const sl = (l === 0 || l === 1) ? 0 : (v - l) / Math.min(l, 1 - l)
  return {
    h: hsb.h,
    s: Math.round(sl * 100),
    l: Math.round(l * 100),
  }
}

/** HSL → HSB (for converting to square cursor position) */
export function hslToHsb(hsl: HSL): HSB {
  const l = hsl.l / 100
  const s = hsl.s / 100

  const b = l + s * Math.min(l, 1 - l)
  const hsbS = b === 0 ? 0 : 2 * (1 - l / b)

  return {
    h: hsl.h,
    s: Math.round(hsbS * 100),
    b: Math.round(b * 100),
  }
}

/** Parse an HSL token value string like "239 84% 57%" → HSL | null */
export function parseHslToken(val: string): HSL | null {
  const parts = val.trim().split(/\s+/)
  if (parts.length < 3) return null
  const h = parseInt(parts[0], 10)
  const s = parseInt(parts[1].replace('%', ''), 10)
  const l = parseInt(parts[2].replace('%', ''), 10)
  if (isNaN(h) || isNaN(s) || isNaN(l)) return null
  return { h, s, l }
}
