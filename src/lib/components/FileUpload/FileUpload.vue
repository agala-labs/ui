<script setup lang="ts">
import { ref, computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { FileUploadProps, FileItem, FileStatus } from './types'
import type { IconName } from '../AgalaIcon/types'

const props = withDefaults(defineProps<FileUploadProps>(), {
  variant: 'dropzone',
  multiple: false,
  dragText: 'Drag and drop files here',
  browseText: 'or click to browse',
})

const emit = defineEmits<{
  'update:modelValue': [files: FileItem[]]
  change: [files: FileItem[]]
  remove: [file: FileItem]
  error: [message: string]
}>()

const internalFiles = ref<FileItem[]>(props.modelValue ?? [])
const isDragging = ref(false)
const inputRef = ref<HTMLInputElement>()

const files = computed({
  get: () => props.modelValue ?? internalFiles.value,
  set: (val) => {
    internalFiles.value = val
    emit('update:modelValue', val)
  },
})

const inlineButtonText = computed(() => {
  return props.buttonText ?? (props.multiple ? 'Choose files' : 'Choose file')
})

const inlineErrorCount = computed(() => {
  return files.value.filter((file) => file.status === 'error').length
})

const inlineSummaryText = computed(() => {
  const count = files.value.length
  if (!count) return ''

  const fileText = count === 1 ? 'file selected' : 'files selected'
  if (inlineErrorCount.value) {
    return `${count} ${fileText}, ${inlineErrorCount.value} with errors`
  }

  return `${count} ${fileText}`
})

const inlineSummaryTitle = computed(() => {
  return files.value
    .map((file) => `${file.name} (${formatSize(file.size)})${file.error ? ` - ${file.error}` : ''}`)
    .join('\n')
})

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function validateFile(file: File): string | null {
  if (props.maxSize && file.size > props.maxSize) {
    return `File too large. Max size: ${formatSize(props.maxSize)}.`
  }
  if (props.accept) {
    const accepted = props.accept.split(',').map((s) => s.trim())
    const isAccepted = accepted.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type || file.name.endsWith(type.replace('.', ''))
    })
    if (!isAccepted) return `File type not accepted.`
  }
  return null
}

function addFiles(fileList: FileList | null) {
  if (!fileList || props.disabled) return

  const newFiles: FileItem[] = []
  const current = files.value

  for (const file of Array.from(fileList)) {
    if (props.maxFiles && current.length + newFiles.length >= props.maxFiles) {
      emit('error', `Maximum ${props.maxFiles} files allowed.`)
      break
    }

    const error = validateFile(file)
    const item: FileItem = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: error ? 'error' : 'pending',
      progress: error ? 0 : 0,
      error: error ?? undefined,
    }
    newFiles.push(item)
  }

  if (newFiles.length) {
    const updated = props.multiple ? [...current, ...newFiles] : newFiles
    files.value = updated
    emit('change', updated)
  }
}

function removeFile(id: string) {
  const file = files.value.find((f) => f.id === id)
  if (!file) return
  const updated = files.value.filter((f) => f.id !== id)
  files.value = updated
  emit('remove', file)
}

function clearFiles() {
  const removed = files.value
  files.value = []
  removed.forEach((file) => emit('remove', file))
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  addFiles(target.files)
  target.value = ''
}

function openFileDialog() {
  inputRef.value?.click()
}

function statusIcon(status: FileStatus): IconName {
  switch (status) {
    case 'success': return 'check-circle'
    case 'error': return 'alert-circle'
    case 'uploading': return 'spinner'
    default: return 'document'
  }
}

function statusColor(status: FileStatus): string {
  switch (status) {
    case 'success': return 'hsl(var(--agala-success))'
    case 'error': return 'hsl(var(--agala-danger))'
    case 'uploading': return 'hsl(var(--agala-primary))'
    default: return 'hsl(var(--agala-muted-foreground))'
  }
}
</script>

<template>
  <div :class="['fileUpload', `fileUpload--${variant}`, props.class]">
    <!-- Dropzone -->
    <div
      v-if="variant === 'dropzone'"
      class="fileUpload__zone"
      :class="{ 'fileUpload__zone--dragging': isDragging, 'fileUpload__zone--disabled': disabled }"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="openFileDialog"
    >
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="fileUpload__input"
        @change="onInputChange"
      />
      <div class="fileUpload__zoneContent">
        <AgalaIcon name="plus" :size="24" />
        <p class="fileUpload__dragText">{{ dragText }}</p>
        <p class="fileUpload__browseText">{{ browseText }}</p>
      </div>
    </div>

    <!-- Inline picker -->
    <div v-else class="fileUpload__inline">
      <div class="fileUpload__inlineControl">
        <input
          ref="inputRef"
          type="file"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          class="fileUpload__input fileUpload__input--hidden"
          @change="onInputChange"
        />
        <button
          type="button"
          class="fileUpload__inlineButton"
          :disabled="disabled"
          @click="openFileDialog"
        >
          <AgalaIcon name="plus" :size="14" />
          <span>{{ inlineButtonText }}</span>
        </button>

        <span
          v-if="files.length"
          class="fileUpload__inlineSummary"
          :class="{ 'fileUpload__inlineSummary--error': inlineErrorCount > 0 }"
          :title="inlineSummaryTitle"
          aria-live="polite"
        >
          {{ inlineSummaryText }}
        </span>

        <button
          v-if="files.length"
          type="button"
          class="fileUpload__inlineClear"
          :disabled="disabled"
          aria-label="Clear selected files"
          @click="clearFiles"
        >
          <AgalaIcon name="x" :size="12" />
        </button>
      </div>
    </div>

    <!-- Helper text -->
    <p v-if="helper" class="fileUpload__helper">{{ helper }}</p>

    <!-- File list -->
    <ul v-if="files.length && variant === 'dropzone'" class="fileUpload__list">
      <li
        v-for="file in files"
        :key="file.id"
        class="fileUpload__item"
        :class="{ 'fileUpload__item--error': file.status === 'error' }"
      >
        <span class="fileUpload__itemIcon" :style="{ color: statusColor(file.status) }">
          <AgalaIcon :name="statusIcon(file.status)" :size="16" />
        </span>

        <div class="fileUpload__itemInfo">
          <span class="fileUpload__itemName">{{ file.name }}</span>
          <span class="fileUpload__itemMeta">{{ formatSize(file.size) }}</span>
          <p v-if="file.error" class="fileUpload__itemError">{{ file.error }}</p>

          <!-- Progress bar -->
          <div v-if="file.status === 'uploading'" class="fileUpload__progress">
            <div class="fileUpload__progressBar" :style="{ width: `${file.progress}%` }" />
          </div>
        </div>

        <button
          type="button"
          class="fileUpload__itemRemove"
          :disabled="disabled"
          :aria-label="`Remove ${file.name}`"
          @click.stop="removeFile(file.id)"
        >
          <AgalaIcon name="x" :size="14" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fileUpload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.fileUpload__zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border: 2px dashed hsl(var(--agala-border));
  border-radius: var(--agala-radius-lg);
  background: hsl(var(--agala-background));
  cursor: pointer;
  transition: border-color var(--agala-transition-fast), background var(--agala-transition-fast);
}

.fileUpload__zone:hover:not(.fileUpload__zone--disabled) {
  border-color: hsl(var(--agala-primary));
  background: hsl(var(--agala-accent));
}

.fileUpload__zone--dragging {
  border-color: hsl(var(--agala-primary));
  background: hsl(var(--agala-accent));
}

.fileUpload__zone--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fileUpload__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.fileUpload__zone--disabled .fileUpload__input {
  cursor: not-allowed;
}

.fileUpload__input--hidden {
  position: absolute;
  inset: auto;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}

.fileUpload__zoneContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  color: hsl(var(--agala-muted-foreground));
  pointer-events: none;
}

.fileUpload__dragText {
  margin: 0;
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-foreground));
}

.fileUpload__browseText {
  margin: 0;
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
}

.fileUpload__inline {
  position: relative;
  display: flex;
  align-items: center;
}

.fileUpload__inlineControl {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  max-width: 100%;
}

.fileUpload__inlineButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: var(--agala-height-sm);
  padding: 0 0.75rem;
  border: 1px solid hsl(var(--agala-input));
  border-radius: calc(var(--agala-radius) - 2px);
  background: hsl(var(--agala-background));
  color: hsl(var(--agala-foreground));
  font: inherit;
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  cursor: pointer;
  transition:
    background var(--agala-transition-fast),
    border-color var(--agala-transition-fast),
    color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
}

.fileUpload--inline {
  gap: 0.25rem;
  max-width: 18rem;
}

.fileUpload--inline .fileUpload__inlineButton {
  min-height: 1.75rem;
  padding: 0 0.5rem;
  gap: 0.25rem;
  border-radius: var(--agala-radius-sm);
  font-size: 0.6875rem;
}

.fileUpload__inlineSummary {
  min-width: 0;
  max-width: 9rem;
  overflow: hidden;
  color: hsl(var(--agala-muted-foreground));
  font-size: 0.6875rem;
  line-height: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fileUpload__inlineSummary--error {
  color: hsl(var(--agala-danger));
}

.fileUpload__inlineClear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  transition: background var(--agala-transition-fast), color var(--agala-transition-fast);
}

.fileUpload__inlineClear:hover:not(:disabled) {
  background: hsl(var(--agala-accent));
  color: hsl(var(--agala-danger));
}

.fileUpload__inlineClear:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.35);
}

.fileUpload__inlineClear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fileUpload__inlineButton:hover:not(:disabled) {
  background: hsl(var(--agala-accent));
  border-color: hsl(var(--agala-border));
}

.fileUpload__inlineButton:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.35);
}

.fileUpload__inlineButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fileUpload__helper {
  margin: 0;
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
}

.fileUpload--inline .fileUpload__helper {
  font-size: 0.6875rem;
  line-height: 1rem;
}

.fileUpload__list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fileUpload__item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-sm);
  background: hsl(var(--agala-card));
  transition: border-color var(--agala-transition-fast);
}

.fileUpload__item--error {
  border-color: hsl(var(--agala-danger) / 0.4);
  background: hsl(var(--agala-danger) / 0.05);
}

.fileUpload__itemIcon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.fileUpload__itemInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.fileUpload__itemName {
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fileUpload__itemMeta {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
}

.fileUpload__itemError {
  margin: 0;
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
}

.fileUpload__progress {
  height: 3px;
  border-radius: 2px;
  background: hsl(var(--agala-border));
  overflow: hidden;
  margin-top: 0.25rem;
}

.fileUpload__progressBar {
  height: 100%;
  border-radius: 2px;
  background: hsl(var(--agala-primary));
  transition: width 200ms ease-out;
}

.fileUpload__itemRemove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  transition: background var(--agala-transition-fast), color var(--agala-transition-fast);
}

.fileUpload__itemRemove:hover:not(:disabled) {
  background: hsl(var(--agala-accent));
  color: hsl(var(--agala-danger));
}

.fileUpload__itemRemove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 359px) {
  .fileUpload__zone {
    padding: 1rem;
  }

  .fileUpload__inlineControl {
    width: 100%;
  }

  .fileUpload__inlineSummary {
    flex: 1;
  }
}
</style>
