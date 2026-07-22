import type { IconName } from '../AgalaIcon/types'

export type SectionNavVariant = 'panel' | 'plain'
export type SectionNavDensity = 'compact' | 'comfortable'
export type SectionNavResponsive = 'scroll' | 'stack'

export interface SectionNavItem {
  value: string
  label: string
  icon?: IconName
  href?: string
  disabled?: boolean
  badge?: string | number
}

export interface SectionNavProps {
  items: SectionNavItem[]
  modelValue: string
  variant?: SectionNavVariant
  density?: SectionNavDensity
  responsive?: SectionNavResponsive
  ariaLabel?: string
  class?: string
}
