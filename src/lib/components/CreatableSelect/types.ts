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
