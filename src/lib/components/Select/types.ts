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
  /** Standard HTML id for the combobox trigger. */
  id?: string
  inputId?: string
  name?: string
  required?: boolean
  autocomplete?: string
  ariaLabel?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
  ariaDetails?: string
  ariaErrorMessage?: string
  ariaInvalid?: boolean | 'grammar' | 'spelling' | 'false' | 'true'
  ariaRequired?: boolean | 'false' | 'true'
  class?: string
}
