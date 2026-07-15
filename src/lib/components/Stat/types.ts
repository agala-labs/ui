export type StatTrend = 'up' | 'down' | 'neutral'

export interface StatProps {
  label: string
  value: string | number
  secondaryValue?: string | number
  trend?: number
  trendLabel?: string
  icon?: string
  iconBg?: 'primary' | 'danger' | 'success' | 'warning' | 'info'
  layout?: 'vertical' | 'row' | 'inline'
  bordered?: boolean
  labelTransform?: string
  class?: string
}
