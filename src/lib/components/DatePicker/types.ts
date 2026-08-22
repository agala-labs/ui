export type DatePickerSize = 'sm' | 'md' | 'lg'
export type DatePickerView = 'days' | 'months' | 'years'

export interface DatePickerProps {
  modelValue?: string
  size?: DatePickerSize
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  placeholder?: string
  min?: string
  max?: string
  clearable?: boolean
  inline?: boolean
  highlightDates?: string[]
  displayMonth?: string
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
