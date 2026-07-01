export type MarkdownEditorPreview = 'tab' | 'split' | 'none'
export type MarkdownToolbarActionKey = 'bold' | 'italic' | 'link' | 'unordered-list' | 'ordered-list'

export interface MarkdownToolbarAction {
  key: MarkdownToolbarActionKey
  label: string
  icon: 'bold' | 'italic' | 'link' | 'list' | 'list-ordered'
}

export interface MarkdownEditorProps {
  modelValue?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  preview?: MarkdownEditorPreview
  toolbar?: boolean
  maxlength?: number
  showCount?: boolean
  editLabel?: string
  previewLabel?: string
  emptyPreview?: string
  previewAriaLabel?: string
  class?: string
}

export interface MarkdownPreviewProps {
  source?: string
  emptyText?: string
  ariaLabel?: string
  rows?: number
  class?: string
}
