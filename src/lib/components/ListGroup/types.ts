export type ListGroupRadius = 'none' | 'sm' | 'md' | 'lg'

export interface ListGroupProps {
  gap?: string
  borderless?: boolean
  dividers?: boolean
  variant?: 'divided' | 'cards'
  class?: string
}

export type ListGroupItemVariant = 'default' | 'danger'
export type ListGroupItemElement = 'div' | 'button' | 'a'

export interface ListGroupItemProps {
  label: string
  subtitle?: string
  icon?: string
  badge?: string | number
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  variant?: ListGroupItemVariant
  radius?: ListGroupRadius
  actionIcon?: string
  /** Render an actionable item as a native button or link. */
  as?: ListGroupItemElement
  /** Enables native button semantics when `as` is not specified. */
  interactive?: boolean
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  class?: string
}
