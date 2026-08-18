<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import type { InputVariant, InputSize } from './types'
import type { IconName } from '../AgalaIcon/types'

const props = withDefaults(defineProps<{
  modelValue?: string
  size?: InputSize
  variant?: InputVariant
  error?: boolean
  errorMessage?: string
  disabled?: boolean
  readonly?: boolean
  iconStart?: string
  iconEnd?: string
  iconEndActionable?: boolean
  type?: string
  placeholder?: string
  wrapperClass?: string
  inputId?: string
  ariaLabel?: string
  ariaLabelledby?: string
  class?: string
}>(), {
  size: 'md',
  variant: 'default',
  error: false,
  disabled: false,
  readonly: false,
  iconStart: '',
  iconEnd: '',
  iconEndActionable: false,
  type: 'text',
  wrapperClass: '',
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'icon-end-click': []
}>()

const showPassword = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const effectiveType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text'
  return props.type
})

const endIconName = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'eye-off' : 'eye'
  return props.iconEnd as string
})

function handleEndIconClick() {
  if (props.type === 'password') {
    if (inputRef.value) {
      const value = inputRef.value.value
      showPassword.value = !showPassword.value
      if (value) {
        nextTick(() => {
          if (inputRef.value) inputRef.value.value = value
        })
      }
    }
  } else if (props.iconEndActionable) {
    emit('icon-end-click')
  }
}

const endIconCls = computed(() => {
  if (props.type === 'password') return 'iconEnd iconEndClickable'
  if (props.iconEndActionable) return 'iconEnd iconEndActionable'
  return 'iconEnd'
})

const sizeMap: Record<InputSize, string> = {
  sm: 'inputSm',
  md: 'inputMd',
  lg: 'inputLg',
}

const cls = computed(() => [
  'input',
  sizeMap[props.size],
  props.iconStart ? 'hasIconStart' : undefined,
  props.iconEnd ? 'hasIconEnd' : undefined,
  props.error ? 'inputError' : undefined,
  props.readonly ? 'inputReadonly' : undefined,
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div class="inputWrapper" :class="$props.wrapperClass">
    <div class="field">
      <span v-if="iconStart" class="iconStart" aria-hidden="true">
        <AgalaIcon :name="iconStart as IconName" size="sm" />
      </span>
      <input
        :id="inputId"
        ref="inputRef"
        :class="cls"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="error"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :type="effectiveType"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span
        v-if="iconEnd"
        :class="endIconCls"
        :aria-label="type === 'password' ? (showPassword ? 'Hide password' : 'Show password') : undefined"
        :role="type === 'password' || iconEndActionable ? 'button' : undefined"
        :tabindex="type === 'password' || iconEndActionable ? 0 : undefined"
        aria-hidden="false"
        @click="handleEndIconClick"
        @keydown.enter.prevent="handleEndIconClick"
        @keydown.space.prevent="handleEndIconClick"
      >
        <AgalaIcon :name="endIconName as IconName" size="sm" />
      </span>
    </div>
    <p v-if="errorMessage" class="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.inputWrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  height: var(--agala-height-md);
  border: var(--agala-input-border, var(--agala-border-width) solid hsl(var(--agala-input)));
  border-radius: var(--agala-input-radius, calc(var(--agala-radius) - 2px));
  background-color: var(--agala-input-bg, hsl(var(--agala-input-background, var(--agala-background))));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-normal);
  padding: var(--agala-input-padding, 0 0.75rem);
  transition:
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
  outline: none;
}

.input::placeholder {
  color: hsl(var(--agala-muted-foreground));
}

.input:focus {
  border-color: hsl(var(--agala-ring));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-ring) / 0.2);
}

.input:disabled {
  cursor: not-allowed;
  opacity: var(--agala-opacity-disabled);
  background-color: hsl(var(--agala-muted));
}

.inputReadonly {
  cursor: default;
}

/* Error */
.inputError {
  border-color: hsl(var(--agala-danger));
}
.inputError:focus {
  border-color: hsl(var(--agala-danger));
  box-shadow:
    0 0 0 1px hsl(var(--agala-background)),
    0 0 0 3px hsl(var(--agala-danger) / 0.2);
}

/* Icons */
.iconStart {
  position: absolute;
  left: 0.625rem;
  color: var(--agala-input-icon-color, hsl(var(--agala-muted-foreground)));
  pointer-events: none;
  display: inline-flex;
  align-items: center;
}

.iconEnd {
  position: absolute;
  right: 0.625rem;
  color: var(--agala-input-icon-color, hsl(var(--agala-muted-foreground)));
  display: inline-flex;
  align-items: center;
}

.iconEndClickable {
  cursor: pointer;
}
.iconEndClickable:hover {
  color: var(--agala-input-icon-color-hover, hsl(var(--agala-foreground)));
}

.iconEndActionable {
  cursor: pointer;
}
.iconEndActionable:hover {
  color: hsl(var(--agala-foreground));
}

.hasIconStart {
  padding-left: 2.25rem;
}

.hasIconEnd {
  padding-right: 2.25rem;
}

/* Sizes */
.inputSm {
  height: var(--agala-input-height-sm, var(--agala-height-sm));
  font-size: var(--agala-font-size-sm);
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}
.inputSm.hasIconStart { padding-left: 2rem; }
.inputSm.hasIconEnd   { padding-right: 2rem; }

.inputMd {
  height: var(--agala-input-height-md, var(--agala-height-md));
}

.inputLg {
  height: var(--agala-input-height-lg, var(--agala-height-lg));
  font-size: var(--agala-font-size-lg);
  padding-left: 1rem;
  padding-right: 1rem;
}
.inputLg.hasIconStart { padding-left: 2.5rem; }
.inputLg.hasIconEnd   { padding-right: 2.5rem; }

/* Error text */
.errorMessage {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
  line-height: var(--agala-line-height-normal);
}
</style>
