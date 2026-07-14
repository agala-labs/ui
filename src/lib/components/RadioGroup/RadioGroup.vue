<script setup lang="ts">
import { computed } from 'vue'
import type { RadioGroupProps, RadioOption, RadioOrientation } from './types'

let idCounter = 0

const props = withDefaults(defineProps<RadioGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

idCounter += 1
const groupName = `agala-radio-${idCounter}`

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
  const selected = props.modelValue === option.value
  const isError = props.error
  return [
    'circle',
    selected ? 'circleSelected' : undefined,
    isError && !selected ? 'circleError' : undefined,
  ].filter(Boolean).join(' ')
}

function select(option: RadioOption) {
  if (props.disabled || option.disabled) return
  emit('update:modelValue', option.value)
}
</script>

<template>
  <div :class="cls" role="radiogroup">
    <label
      v-for="option in options"
      :key="option.value"
      :class="[
        'radioItem',
        (disabled || option.disabled) ? 'radioItemDisabled' : undefined,
      ].filter(Boolean).join(' ')"
    >
      <input
        type="radio"
        class="radioInput"
        :name="groupName"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled || option.disabled"
        @change="select(option)"
      />
      <span :class="circleCls(option)" aria-hidden="true">
        <span v-if="modelValue === option.value" class="dot" />
      </span>
      <span class="radioLabel">{{ option.label }}</span>
    </label>
  </div>
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
  cursor: pointer;
  user-select: none;
  min-width: 0;
}

.radioItemDisabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Visually hidden native input */
.radioInput {
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

.radioInput:focus-visible + .circle {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring));
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
