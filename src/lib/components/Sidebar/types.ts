export interface SidebarProps {
  items?: SidebarNode[]
  activeValue?: string
  expanded?: string[]
  defaultExpanded?: string[]
  indent?: SidebarIndent
  collapsed?: boolean
  width?: string
  collapsedWidth?: string
  responsive?: boolean
  open?: boolean
  class?: string
}

export interface SidebarGroupProps {
  label?: string
  class?: string
}

export type SidebarItemBadgeVariant = 'default' | 'warning' | 'danger' | 'success'

export type SidebarItemDotVariant = 'primary' | 'danger' | 'warning' | 'success'

import type { IconName } from '../AgalaIcon/types'

export type SidebarIndent = 'compact' | 'comfortable'

export interface SidebarNavItem {
  value: string
  label: string
  icon?: IconName
  href?: string
  active?: boolean
  badge?: string | number
  badgeVariant?: SidebarItemBadgeVariant
  dot?: boolean
  dotVariant?: SidebarItemDotVariant
  disabled?: boolean
  children?: SidebarNavItem[]
  class?: string
}

export interface SidebarSection {
  label: string
  items: SidebarNavItem[]
  class?: string
}

export type SidebarNode = SidebarNavItem | SidebarSection

export interface SidebarItemProps {
  icon?: IconName
  label?: string
  active?: boolean
  badge?: string | number
  badgeVariant?: SidebarItemBadgeVariant
  dot?: boolean
  dotVariant?: SidebarItemDotVariant
  disabled?: boolean
  class?: string
}
