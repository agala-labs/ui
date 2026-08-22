export type InputVariant = 'default' | 'ghost'
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps {
  modelValue?: string
  size?: InputSize
  variant?: InputVariant
  error?: boolean
  errorMessage?: string
  disabled?: boolean
  readonly?: boolean
  iconStart?: string
  iconEnd?: string
  iconEndActionable?: boolean
  type?: string
  placeholder?: string
  /** Standard HTML id. `inputId` is kept as a backwards-compatible alias. */
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
  wrapperClass?: string
  class?: string
}
