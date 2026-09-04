export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'
export type AlertRole = 'alert' | 'status' | 'region'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  role?: AlertRole
  dismissible?: boolean
  flat?: boolean
  icon?: string | false
  dismissLabel?: string
  ariaLabel?: string
  class?: string
}
