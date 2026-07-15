import type { IconName } from '../AgalaIcon/types'

export type SegmentedControlVariant = 'primary' | 'danger' | 'success' | 'warning' | 'info'

export type SegmentedControlSize = 'sm' | 'md' | 'lg'

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: IconName
  variant?: SegmentedControlVariant
  disabled?: boolean
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  modelValue: string
  size?: SegmentedControlSize
  disabled?: boolean
  block?: boolean
  ariaLabel?: string
  class?: string
}
