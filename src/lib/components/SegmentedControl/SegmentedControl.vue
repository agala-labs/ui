<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import type { SegmentedControlProps, SegmentedControlOption } from './types'

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  size: 'md',
  disabled: false,
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const sizeMap: Record<string, string> = {
  sm: 'segSm',
  md: 'segMd',
  lg: 'segLg',
}

const enabledOptions = computed(() => props.options.filter((o) => !o.disabled))

const wrapperCls = computed(() => [
  'segControl',
  sizeMap[props.size],
  props.disabled ? 'segControlDisabled' : undefined,
  props.class,
].filter(Boolean).join(' '))

// Auto-select first enabled option when modelValue doesn't match any option
watch(() => props.options, () => {
  const valid = props.options.find(o => o.value === props.modelValue && !o.disabled)
  if (!valid) {
    const first = props.options.find(o => !o.disabled)
    if (first) emit('update:modelValue', first.value)
  }
}, { immediate: true })

function optionCls(opt: SegmentedControlOption): string {
  const classes = ['segOption']
  if (props.modelValue === opt.value) {
    classes.push('segOptionActive')
    if (opt.variant) classes.push(`segOption--${opt.variant}`)
  }
  if (props.disabled || opt.disabled) classes.push('segOptionDisabled')
  return classes.join(' ')
}

function select(opt: SegmentedControlOption) {
  if (props.disabled || opt.disabled) return
  emit('update:modelValue', opt.value)
  nextTick(() => {
    const el = document.querySelector<HTMLElement>(`[data-seg="${opt.value}"]`)
    el?.focus()
  })
}

function handleKeyDown(e: KeyboardEvent) {
  const opts = enabledOptions.value
  if (opts.length <= 1) return

  const idx = opts.findIndex((o) => o.value === props.modelValue)
  if (idx === -1) return

  let next = -1

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      next = (idx - 1 + opts.length) % opts.length
      break
    case 'ArrowRight':
      e.preventDefault()
      next = (idx + 1) % opts.length
      break
    case 'Home':
      e.preventDefault()
      next = 0
      break
    case 'End':
      e.preventDefault()
      next = opts.length - 1
      break
  }

  if (next !== -1) {
    emit('update:modelValue', opts[next].value)
    nextTick(() => {
      const el = document.querySelector<HTMLElement>(`[data-seg="${opts[next].value}"]`)
      el?.focus()
    })
  }
}
</script>

<template>
  <div
    :class="wrapperCls"
    role="radiogroup"
    :aria-disabled="disabled || undefined"
    @keydown="handleKeyDown"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      :data-seg="opt.value"
      role="radio"
      type="button"
      :aria-checked="modelValue === opt.value"
      :tabindex="modelValue === opt.value ? 0 : -1"
      :disabled="disabled || opt.disabled"
      :class="optionCls(opt)"
      @click="select(opt)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.segControl {
  display: inline-flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.segControl::-webkit-scrollbar {
  display: none;
}

.segControlDisabled {
  opacity: 0.5;
  pointer-events: none;
}

.segOption {
  position: relative;
  z-index: 0;
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  border: var(--agala-border-width) solid var(--agala-seg-border, hsl(var(--agala-border)));
  background: transparent;
  color: var(--agala-seg-inactive-color, hsl(var(--agala-muted-foreground)));
  cursor: pointer;
  outline: none;
  user-select: none;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: var(--agala-seg-padding, 0 14px);
  transition:
    background-color var(--agala-transition-fast),
    color var(--agala-transition-fast),
    border-color var(--agala-transition-fast);
}

.segOption:hover:not(.segOptionDisabled):not(.segOptionActive) {
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-foreground));
}

.segSm {
  height: var(--agala-seg-height, 2rem);
  font-size: var(--agala-seg-font-size-sm, 0.813rem);
  line-height: 2rem;
}

.segMd {
  height: var(--agala-seg-height, 2.25rem);
  font-size: var(--agala-seg-font-size-md, 0.875rem);
  line-height: 2.25rem;
}

.segLg {
  height: var(--agala-seg-height, 2.5rem);
  font-size: var(--agala-seg-font-size-lg, 1rem);
  line-height: 2.5rem;
}

.segOption:first-child {
  border-radius: var(--agala-radius) 0 0 var(--agala-radius);
}

.segOption:last-child {
  border-radius: 0 var(--agala-radius) var(--agala-radius) 0;
}

.segOption:only-child {
  border-radius: var(--agala-radius);
}

.segOption + .segOption {
  border-left: none;
}

.segOptionActive {
  background: var(--agala-seg-active-bg, hsl(var(--agala-primary)));
  color: var(--agala-seg-active-color, hsl(var(--agala-primary-foreground)));
  border-color: transparent;
  z-index: 1;
}

.segOptionActive.segOption--danger {
  background: hsl(var(--agala-danger));
  color: hsl(var(--agala-danger-foreground));
}

.segOptionActive.segOption--success {
  background: hsl(var(--agala-success));
  color: hsl(var(--agala-success-foreground));
}

.segOptionActive.segOption--warning {
  background: hsl(var(--agala-warning));
  color: hsl(var(--agala-warning-foreground));
}

.segOptionActive.segOption--info {
  background: hsl(var(--agala-accent));
  color: hsl(var(--agala-accent-foreground));
}

.segOption:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
  border-radius: var(--agala-radius);
  z-index: 2;
}

.segOptionDisabled {
  opacity: 0.4;
  pointer-events: none;
}

@media (max-width: 639px) {
  .segOption {
    min-width: max-content;
  }
}
</style>
