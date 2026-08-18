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
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
  class?: string
}
