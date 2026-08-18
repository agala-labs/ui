export interface TabItem {
  value: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  modelValue: string
  tabs: TabItem[]
  variant?: 'underline' | 'pills'
  orientation?: 'horizontal' | 'vertical'
  ariaLabel?: string
  class?: string
}
