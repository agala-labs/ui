<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import Textarea from '../Textarea/Textarea.vue'
import MarkdownPreview from './MarkdownPreview.vue'
import type { MarkdownEditorProps, MarkdownToolbarAction } from './types'

const props = withDefaults(defineProps<MarkdownEditorProps>(), {
  modelValue: '',
  placeholder: '',
  rows: 8,
  disabled: false,
  error: false,
  preview: 'tab',
  toolbar: true,
  showCount: false,
  editLabel: 'Edit',
  previewLabel: 'Preview',
  emptyPreview: 'Nothing to preview yet.',
  previewAriaLabel: 'Markdown preview',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref<'edit' | 'preview'>('edit')
const rootRef = ref<HTMLElement | null>(null)

const value = computed(() => props.modelValue || '')
const shouldShowTabs = computed(() => props.preview === 'tab')
const shouldShowSplit = computed(() => props.preview === 'split')
const shouldShowEditor = computed(() => props.preview !== 'tab' || activeTab.value === 'edit')
const shouldShowPreview = computed(() => props.preview !== 'none' && (props.preview === 'split' || activeTab.value === 'preview'))
const shouldShowToolbar = computed(() => props.toolbar && shouldShowEditor.value)
const shouldShowCount = computed(() => props.showCount || props.maxlength !== undefined)
const countText = computed(() => props.maxlength === undefined ? String(value.value.length) : `${value.value.length}/${props.maxlength}`)

const wrapperCls = computed(() => [
  'markdownEditor',
  props.error ? 'markdownEditorError' : undefined,
  props.disabled ? 'markdownEditorDisabled' : undefined,
  props.class,
].filter(Boolean).join(' '))

const bodyCls = computed(() => [
  'body',
  shouldShowSplit.value ? 'bodySplit' : undefined,
].filter(Boolean).join(' '))

const toolbarActions: MarkdownToolbarAction[] = [
  { key: 'bold', label: 'Bold', icon: 'bold' },
  { key: 'italic', label: 'Italic', icon: 'italic' },
  { key: 'link', label: 'Link', icon: 'link' },
  { key: 'unordered-list', label: 'Bulleted list', icon: 'list' },
  { key: 'ordered-list', label: 'Numbered list', icon: 'list-ordered' },
]

function clampValue(nextValue: string) {
  if (props.maxlength === undefined) return nextValue
  return nextValue.slice(0, props.maxlength)
}

function setValue(nextValue: string) {
  emit('update:modelValue', clampValue(nextValue))
}

function setTab(tab: 'edit' | 'preview') {
  activeTab.value = tab
}

function getTextarea() {
  return rootRef.value?.querySelector<HTMLTextAreaElement>('.editorInput textarea') || null
}

function replaceSelection(replacement: string, selectionStart: number, selectionEnd: number, nextCursorStart: number, nextCursorEnd = nextCursorStart) {
  const nextValue = clampValue(`${value.value.slice(0, selectionStart)}${replacement}${value.value.slice(selectionEnd)}`)
  emit('update:modelValue', nextValue)

  nextTick(() => {
    const textarea = getTextarea()
    if (!textarea) return
    textarea.focus()
    const safeStart = Math.min(nextCursorStart, nextValue.length)
    const safeEnd = Math.min(nextCursorEnd, nextValue.length)
    textarea.setSelectionRange(safeStart, safeEnd)
  })
}

function wrapSelection(prefix: string, suffix: string, placeholder: string) {
  const textarea = getTextarea()
  const selectionStart = textarea?.selectionStart ?? value.value.length
  const selectionEnd = textarea?.selectionEnd ?? value.value.length
  const selected = value.value.slice(selectionStart, selectionEnd) || placeholder
  const replacement = `${prefix}${selected}${suffix}`
  replaceSelection(replacement, selectionStart, selectionEnd, selectionStart + prefix.length, selectionStart + prefix.length + selected.length)
}

function linePrefixSelection(marker: string) {
  const textarea = getTextarea()
  const selectionStart = textarea?.selectionStart ?? value.value.length
  const selectionEnd = textarea?.selectionEnd ?? value.value.length
  const lineStart = value.value.lastIndexOf('\n', selectionStart - 1) + 1
  const selectedBlock = value.value.slice(lineStart, selectionEnd) || 'List item'
  const lines = selectedBlock.split('\n')
  const replacement = lines.map((line, index) => {
    const prefix = marker === '1. ' ? `${index + 1}. ` : marker
    return line.startsWith(prefix) ? line : `${prefix}${line}`
  }).join('\n')

  replaceSelection(replacement, lineStart, selectionEnd, lineStart + replacement.length)
}

function applyAction(action: MarkdownToolbarAction['key']) {
  if (props.disabled) return

  switch (action) {
    case 'bold':
      wrapSelection('**', '**', 'bold text')
      break
    case 'italic':
      wrapSelection('_', '_', 'italic text')
      break
    case 'link':
      wrapSelection('[', '](https://example.com)', 'link text')
      break
    case 'unordered-list':
      linePrefixSelection('- ')
      break
    case 'ordered-list':
      linePrefixSelection('1. ')
      break
  }
}
</script>

<template>
  <div
    ref="rootRef"
    :class="wrapperCls"
  >
    <div
      v-if="shouldShowToolbar || shouldShowTabs"
      class="topbar"
    >
      <div
        v-if="shouldShowToolbar"
        class="formatToolbar"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        <button
          v-for="action in toolbarActions"
          :key="action.key"
          type="button"
          class="toolButton"
          :aria-label="action.label"
          :title="action.label"
          :disabled="disabled"
          @click="applyAction(action.key)"
        >
          <AgalaIcon
            :name="action.icon"
            :size="14"
          />
        </button>
      </div>

      <div
        v-if="shouldShowTabs"
        class="viewTabs"
        role="tablist"
        aria-label="Markdown editor view"
      >
        <button
          type="button"
          class="tabButton"
          :class="{ tabButtonActive: activeTab === 'edit' }"
          role="tab"
          :aria-selected="activeTab === 'edit'"
          :tabindex="activeTab === 'edit' ? 0 : -1"
          :disabled="disabled"
          @click="setTab('edit')"
        >
          {{ editLabel }}
        </button>
        <button
          type="button"
          class="tabButton"
          :class="{ tabButtonActive: activeTab === 'preview' }"
          role="tab"
          :aria-selected="activeTab === 'preview'"
          :tabindex="activeTab === 'preview' ? 0 : -1"
          :disabled="disabled"
          @click="setTab('preview')"
        >
          {{ previewLabel }}
        </button>
      </div>
    </div>

    <div :class="bodyCls">
      <Textarea
        v-if="shouldShowEditor"
        :model-value="value"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :error="error"
        resize="vertical"
        class="editorInput"
        @update:model-value="setValue"
      />

      <MarkdownPreview
        v-if="shouldShowPreview"
        :source="value"
        :empty-text="emptyPreview"
        :aria-label="previewAriaLabel"
        :rows="rows"
        :class="error ? 'previewError' : undefined"
      />
    </div>

    <div
      v-if="errorMessage || shouldShowCount"
      class="footer"
    >
      <p
        v-if="errorMessage"
        class="errorMessage"
      >
        {{ errorMessage }}
      </p>
      <p
        v-if="shouldShowCount"
        class="count"
        :class="{ countOverLimit: maxlength !== undefined && value.length >= maxlength }"
      >
        {{ countText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.markdownEditor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
}

.markdownEditorDisabled {
  opacity: 0.72;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.formatToolbar,
.viewTabs {
  display: inline-flex;
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  background: hsl(var(--agala-muted) / 0.45);
  padding: 0.125rem;
}

.formatToolbar {
  gap: 0.125rem;
}

.toolButton,
.tabButton {
  border: 0;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  cursor: pointer;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-sm);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  transition:
    background-color var(--agala-transition-fast),
    color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
}

.toolButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  padding: 0;
}

.tabButton {
  min-width: 4.5rem;
  padding: 0.5rem 0.75rem;
}

.toolButton:hover:not(:disabled),
.tabButton:hover:not(:disabled):not(.tabButtonActive) {
  color: hsl(var(--agala-foreground));
}

.toolButton:focus-visible,
.tabButton:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.toolButton:disabled,
.tabButton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tabButtonActive {
  background: hsl(var(--agala-background));
  color: hsl(var(--agala-foreground));
  box-shadow: var(--agala-shadow-sm);
}

.body {
  display: grid;
  gap: 0.75rem;
}

.bodySplit {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: stretch;
}

.editorInput {
  min-width: 0;
}

.previewError {
  border-color: hsl(var(--agala-danger));
}

.footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: -0.25rem;
}

.errorMessage,
.count {
  font-size: var(--agala-font-size-sm);
  line-height: var(--agala-line-height-normal);
  margin: 0;
}

.errorMessage {
  color: hsl(var(--agala-danger));
}

.count {
  margin-left: auto;
  color: hsl(var(--agala-muted-foreground));
  white-space: nowrap;
}

.countOverLimit {
  color: hsl(var(--agala-danger));
}

@media (max-width: 767px) {
  .bodySplit {
    grid-template-columns: 1fr;
  }
}
</style>
