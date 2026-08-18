export interface CreatableSelectOption {
  [key: string]: unknown
  value: string
  label: string
  disabled?: boolean
}

export interface CreatableSelectProps {
  modelValue?: string[]
  options: CreatableSelectOption[]
  placeholder?: string
  disabled?: boolean
  creatable?: boolean
  labelKey?: string
  idKey?: string
  maxDisplayed?: number
  debounce?: number
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
  class?: string
}
