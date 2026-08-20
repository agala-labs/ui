<script setup lang="ts">
import { computed } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
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

const rekaValue = computed<boolean | 'indeterminate'>(() => (
  props.indeterminate ? 'indeterminate' : props.modelValue
))

function onUpdate(value: boolean | 'indeterminate') {
  emit('update:modelValue', value === true || value === 'indeterminate')
}
</script>

<template>
  <div :class="cls">
    <CheckboxRoot
      :model-value="rekaValue"
      :disabled="disabled"
      :class="['checkboxInput', boxCls]"
      @update:model-value="onUpdate"
    >
      <CheckboxIndicator as-child>
        <span aria-hidden="true">
          <AgalaIcon
            v-if="indeterminate"
            name="minus"
            size="xs"
          />
          <AgalaIcon
            v-else-if="modelValue"
            name="check"
            size="xs"
          />
        </span>
      </CheckboxIndicator>
    </CheckboxRoot>
    <span
      v-if="label"
      class="checkboxLabel"
    >{{ label }}</span>
  </div>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border-radius: calc(var(--agala-radius) * 0.5);
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  background-color: hsl(var(--agala-background));
  color: hsl(var(--agala-primary-foreground));
  cursor: pointer;
  transition:
    background-color var(--agala-transition-fast),
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
}

.checkboxInput:disabled {
  cursor: not-allowed;
}

.checkboxRoot:not(.checkboxDisabled):hover .checkboxInput {
  border-color: hsl(var(--agala-primary));
}

.checkboxInput:not(:disabled):focus-visible {
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

.checkboxInput :deep(svg) {
  pointer-events: none;
}

.checkboxLabel {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-foreground));
  line-height: var(--agala-line-height-normal);
}
</style>
