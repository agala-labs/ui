export type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'

export type TagSize = 'sm' | 'md'

export interface TagProps {
  label?: string
  variant?: TagVariant
  size?: TagSize
  removable?: boolean
  interactive?: boolean
  disabled?: boolean
  color?: string
  class?: string
}
