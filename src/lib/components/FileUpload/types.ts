export type FileStatus = 'pending' | 'uploading' | 'success' | 'error'
export type FileUploadVariant = 'dropzone' | 'inline'

export interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: FileStatus
  progress: number
  error?: string
}

export interface FileUploadProps {
  modelValue?: FileItem[]
  variant?: FileUploadVariant
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  label?: string
  helper?: string
  dragText?: string
  browseText?: string
  buttonText?: string
  class?: string
}
