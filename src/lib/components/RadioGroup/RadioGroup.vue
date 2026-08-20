<script setup lang="ts">
import { computed, ref } from 'vue'
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import type { RadioGroupProps, RadioOption, RadioOrientation } from './types'

const props = withDefaults(defineProps<RadioGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const internalValue = ref(props.modelValue ?? '')
const selectedValue = computed(() => props.modelValue ?? internalValue.value)

const orientationMap: Record<RadioOrientation, string> = {
  vertical:   'groupVertical',
  horizontal: 'groupHorizontal',
}

const cls = computed(() => [
  'radioGroup',
  orientationMap[props.orientation],
  props.class,
].filter(Boolean).join(' '))

function circleCls(option: RadioOption) {
  const selected = selectedValue.value === option.value
  const isError = props.error
  return [
    'circle',
    selected ? 'circleSelected' : undefined,
    isError && !selected ? 'circleError' : undefined,
  ].filter(Boolean).join(' ')
}

function select(option: RadioOption) {
  if (props.disabled || option.disabled) return
  if (props.modelValue === undefined) internalValue.value = option.value
  emit('update:modelValue', option.value)
}

function onUpdate(value: unknown) {
  if (typeof value === 'string') select({ value, label: value })
}
</script>

<template>
  <RadioGroupRoot
    :model-value="selectedValue"
    :disabled="disabled"
    :orientation="orientation"
    :class="cls"
    role="radiogroup"
    @update:model-value="onUpdate"
  >
    <div
      v-for="option in options"
      :key="option.value"
      :class="[
        'radioItem',
        (disabled || option.disabled) ? 'radioItemDisabled' : undefined,
      ].filter(Boolean).join(' ')"
    >
      <RadioGroupItem
        :value="option.value"
        :disabled="disabled || option.disabled"
        class="radioInput"
      >
        <span
          :class="circleCls(option)"
          aria-hidden="true"
        >
          <span
            v-if="selectedValue === option.value"
            class="dot"
          />
        </span>
      </RadioGroupItem>
      <span class="radioLabel">{{ option.label }}</span>
    </div>
  </RadioGroupRoot>
</template>

<style scoped>
.radioGroup {
  display: flex;
  gap: 0.625rem;
}

.groupVertical   { flex-direction: column; }
.groupHorizontal { flex-direction: row; flex-wrap: wrap; gap: 1rem; }

.radioItem {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
  min-width: 0;
}

.radioItemDisabled {
  cursor: not-allowed;
  opacity: var(--agala-opacity-disabled);
}

/* Reka's radio item is the keyboard-focusable control. */
.radioInput {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

/* Custom circle */
.circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: var(--agala-border-width-thick) solid hsl(var(--agala-border));
  background-color: hsl(var(--agala-background));
  transition:
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
}

.radioItem:not(.radioItemDisabled):hover .circle {
  border-color: hsl(var(--agala-primary));
}

.radioInput:focus-visible .circle {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring));
}

.radioInput:disabled {
  cursor: not-allowed;
}

.circleSelected {
  border-color: hsl(var(--agala-primary));
}

.circleError {
  border-color: hsl(var(--agala-danger));
}

/* Inner dot */
.dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background-color: hsl(var(--agala-primary));
}

.radioLabel {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-foreground));
  line-height: var(--agala-line-height-normal);
  overflow-wrap: anywhere;
}
</style>
