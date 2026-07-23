import type { iconNames } from './catalog'

/** Vendor-neutral icon names supported by Agala UI. */
export type IconName = (typeof iconNames)[number]

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type IconMotion = 'none' | 'hover' | 'active'

export interface AgalaIconProps {
  name: IconName
  size?: IconSize | number | string
  strokeWidth?: number
  motion?: IconMotion
  active?: boolean
}
