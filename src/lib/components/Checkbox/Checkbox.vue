<script setup lang="ts">
import { computed } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import type { CheckboxProps } from './types'

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  disabled: false,
  error: false,
  indeterminate: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const cls = computed(() => [
  'checkboxRoot',
  props.disabled ? 'checkboxDisabled' : undefined,
  props.class,
].filter(Boolean).join(' '))

const boxCls = computed(() => [
  'checkboxBox',
  props.error ? 'checkboxError' : undefined,
  (props.modelValue || props.indeterminate) ? 'checkboxChecked' : undefined,
].filter(Boolean).join(' '))

function onClick() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <label :class="cls">
    <input
      type="checkbox"
      class="checkboxInput"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="indeterminate ? 'mixed' : undefined"
      @click.prevent="onClick"
    />
    <span :class="boxCls" aria-hidden="true">
      <AgalaIcon v-if="indeterminate" name="minus" size="xs" />
      <AgalaIcon v-else-if="modelValue" name="check" size="xs" />
    </span>
    <span v-if="label" class="checkboxLabel">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkboxRoot {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkboxDisabled {
  cursor: not-allowed;
  opacity: var(--agala-opacity-disabled);
}

.checkboxInput {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.checkboxBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  border-radius: calc(var(--agala-radius) * 0.5);
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  background-color: hsl(var(--agala-background));
  color: hsl(var(--agala-primary-foreground));
  transition:
    background-color var(--agala-transition-fast),
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
}

.checkboxRoot:not(.checkboxDisabled):hover .checkboxBox {
  border-color: hsl(var(--agala-primary));
}

.checkboxRoot:not(.checkboxDisabled) .checkboxInput:focus-visible + .checkboxBox {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring));
}

.checkboxChecked {
  background-color: hsl(var(--agala-primary));
  border-color: hsl(var(--agala-primary));
}

.checkboxError {
  border-color: hsl(var(--agala-danger));
}

.checkboxError.checkboxChecked {
  background-color: hsl(var(--agala-danger));
  border-color: hsl(var(--agala-danger));
}

.checkboxLabel {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-foreground));
  line-height: var(--agala-line-height-normal);
}
</style>
