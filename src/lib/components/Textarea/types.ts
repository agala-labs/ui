export type TextareaResize = 'none' | 'vertical' | 'both'

export interface TextareaProps {
  modelValue?: string
  rows?: number
  resize?: TextareaResize
  disabled?: boolean
  readonly?: boolean
  error?: boolean
  errorMessage?: string
  placeholder?: string
  /** Standard HTML id for the native textarea. */
  id?: string
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
