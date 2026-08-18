export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  subtitle?: string
  group?: string
}

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps {
  options: SelectOption[]
  modelValue?: string | string[]
  multiple?: boolean
  placeholder?: string
  size?: SelectSize
  disabled?: boolean
  loading?: boolean
  searchable?: boolean
  onSearch?: (query: string) => void
  clearable?: boolean
  error?: boolean
  errorMessage?: string
  maxDisplayed?: number
  maxSelections?: number
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
  class?: string
}
