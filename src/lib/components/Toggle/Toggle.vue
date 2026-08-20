<script setup lang="ts">
import { computed } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import type { ToggleProps, ToggleSize } from './types'

const props = withDefaults(defineProps<ToggleProps>(), {
  modelValue: false,
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeMap: Record<ToggleSize, string> = {
  sm: 'toggleSm',
  md: 'toggleMd',
  lg: 'toggleLg',
}

const cls = computed(() => [
  'toggle',
  sizeMap[props.size],
  props.modelValue ? 'toggleActive' : undefined,
  props.class,
].filter(Boolean).join(' '))

function onUpdate(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<template>
  <SwitchRoot
    :model-value="modelValue"
    :disabled="disabled"
    :class="cls"
    @update:model-value="onUpdate"
  >
    <SwitchThumb class="thumb" />
  </SwitchRoot>
</template>

<style scoped>
.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  border: none;
  border-radius: 9999px;
  background-color: hsl(var(--agala-muted));
  transition: background-color var(--agala-transition-fast);
  padding: 0;
}

.toggle:disabled {
  cursor: not-allowed;
  opacity: var(--agala-opacity-disabled);
}

.toggle:not(:disabled):focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-background)), 0 0 0 4px hsl(var(--agala-ring));
}

.toggleActive {
  background-color: hsl(var(--agala-primary));
}

/* Sizes */
.toggleSm { width: 1.75rem; height: 1rem; }
.toggleMd { width: 2.25rem; height: 1.25rem; }
.toggleLg { width: 2.75rem; height: 1.5rem; }

/* Thumb */
.thumb {
  display: block;
  border-radius: 50%;
  background-color: hsl(var(--agala-background));
  box-shadow: 0 1px 3px hsl(0 0% 0% / 0.2);
  transition: transform var(--agala-transition-fast);
  flex-shrink: 0;
}

.toggleSm .thumb { width: 0.75rem; height: 0.75rem; margin: 0.125rem; }
.toggleMd .thumb { width: 1rem;    height: 1rem;    margin: 0.125rem; }
.toggleLg .thumb { width: 1.25rem; height: 1.25rem; margin: 0.125rem; }

.toggleSm.toggleActive .thumb { transform: translateX(0.75rem); }
.toggleMd.toggleActive .thumb { transform: translateX(1rem); }
.toggleLg.toggleActive .thumb { transform: translateX(1.25rem); }
</style>
