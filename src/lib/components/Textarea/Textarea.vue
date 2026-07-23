<script setup lang="ts">
import { computed } from 'vue'
import type { TextareaProps, TextareaResize } from './types'

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  resize: 'vertical',
  disabled: false,
  error: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const resizeMap: Record<TextareaResize, string> = {
  none:     'resizeNone',
  vertical: 'resizeVertical',
  both:     'resizeBoth',
}

const cls = computed(() => [
  'textarea',
  resizeMap[props.resize],
  props.error ? 'textareaError' : undefined,
].filter(Boolean).join(' '))

const wrapperCls = computed(() => [
  'wrapper',
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div :class="wrapperCls">
    <textarea
      :class="cls"
      :value="modelValue"
      :rows="rows"
      :disabled="disabled"
      :aria-invalid="error"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="errorMessage" class="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.wrapper {
  display: block;
}

.textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 4rem;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: calc(var(--agala-radius) - 2px);
  background-color: hsl(var(--agala-input-background, var(--agala-background)));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-relaxed);
  padding: 0.5rem 0.75rem;
  transition:
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
  outline: none;
}

.textarea::placeholder {
  color: hsl(var(--agala-muted-foreground));
}

.textarea:focus {
  border-color: hsl(var(--agala-ring));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-ring) / 0.2);
}

.textarea:disabled {
  cursor: not-allowed;
  opacity: var(--agala-opacity-disabled);
  background-color: hsl(var(--agala-muted));
}

.textareaError {
  border-color: hsl(var(--agala-danger));
}

.textareaError:focus {
  border-color: hsl(var(--agala-danger));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-danger) / 0.2);
}

/* Resize variants */
.resizeNone     { resize: none; }
.resizeVertical { resize: vertical; }
.resizeBoth     { resize: both; }

.errorMessage {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
  line-height: var(--agala-line-height-normal);
  margin: 0.25rem 0 0;
}
</style>
