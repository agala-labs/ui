<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { SegmentedControlProps, SegmentedControlOption } from './types'

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  size: 'md',
  disabled: false,
  block: false,
  ariaLabel: 'Options',
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
const rovingValue = computed(() => {
  const selected = enabledOptions.value.find(option => option.value === props.modelValue)
  return selected?.value ?? enabledOptions.value[0]?.value
})

const rootRef = ref<HTMLDivElement | null>(null)
const optionRefs = new Map<string, HTMLButtonElement>()
const canScrollStart = ref(false)
const canScrollEnd = ref(false)
const { matches: reduceMotion } = useMediaQuery('(prefers-reduced-motion: reduce)')
let resizeObserver: ResizeObserver | undefined

function setOptionRef(value: string, element: unknown) {
  if (element instanceof HTMLButtonElement) optionRefs.set(value, element)
  else optionRefs.delete(value)
}

function updateOverflow() {
  const root = rootRef.value
  if (!root) return
  const tolerance = 2
  canScrollStart.value = root.scrollLeft > tolerance
  canScrollEnd.value = root.scrollLeft + root.clientWidth < root.scrollWidth - tolerance
}

function revealOption(value: string) {
  optionRefs.get(value)?.scrollIntoView({
    behavior: reduceMotion.value ? 'auto' : 'smooth',
    inline: 'nearest',
    block: 'nearest',
  })
}

const wrapperCls = computed(() => [
  'segControl',
  sizeMap[props.size],
  props.disabled ? 'segControlDisabled' : undefined,
  props.block ? 'segControlBlock' : undefined,
  canScrollStart.value ? 'canScrollStart' : undefined,
  canScrollEnd.value ? 'canScrollEnd' : undefined,
  props.class,
].filter(Boolean).join(' '))

// Auto-select first enabled option when modelValue doesn't match any option
watch([() => props.options, () => props.modelValue], () => {
  const valid = props.options.find(o => o.value === props.modelValue && !o.disabled)
  if (!valid) {
    const first = props.options.find(o => !o.disabled)
    if (first) emit('update:modelValue', first.value)
  }
}, { immediate: true, deep: true })

watch(() => props.options, () => nextTick(updateOverflow), { deep: true })

watch(() => props.modelValue, (value) => {
  nextTick(() => {
    revealOption(value)
    updateOverflow()
  })
})

onMounted(() => {
  updateOverflow()
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(rootRef.value)
  }
})

onUnmounted(() => resizeObserver?.disconnect())

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
    optionRefs.get(opt.value)?.focus({ preventScroll: true })
    revealOption(opt.value)
  })
}

function handleKeyDown(e: KeyboardEvent, currentValue: string) {
  const opts = enabledOptions.value
  if (opts.length <= 1) return

  const idx = opts.findIndex((o) => o.value === currentValue)
  if (idx === -1) return

  let next = -1

  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      next = (idx - 1 + opts.length) % opts.length
      break
    case 'ArrowRight':
    case 'ArrowDown':
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
    select(opts[next])
  }
}

const iconSize = computed(() => props.size === 'lg' ? 16 : 14)
</script>

<template>
  <div
    ref="rootRef"
    :class="wrapperCls"
    role="radiogroup"
    aria-orientation="horizontal"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    @scroll="updateOverflow"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      :ref="element => setOptionRef(opt.value, element)"
      :data-seg="opt.value"
      role="radio"
      type="button"
      :aria-label="opt.label"
      :aria-checked="modelValue === opt.value"
      :tabindex="rovingValue === opt.value ? 0 : -1"
      :disabled="disabled || opt.disabled"
      :class="optionCls(opt)"
      @click="select(opt)"
      @keydown="handleKeyDown($event, opt.value)"
    >
      <AgalaIcon
        v-if="opt.icon"
        :name="opt.icon"
        :size="iconSize"
      />
      <span class="segLabel">
        <slot
          :name="`option-${opt.value}`"
          :option="opt"
          :selected="modelValue === opt.value"
        >
          {{ opt.label }}
        </slot>
      </span>
    </button>
  </div>
</template>

<style scoped>
.segControl {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  gap: var(--agala-seg-gap, 0.125rem);
  padding: var(--agala-seg-group-padding, 0.1875rem);
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  border: var(--agala-border-width) solid var(--agala-seg-border, hsl(var(--agala-border)));
  border-radius: var(--agala-seg-radius, var(--agala-radius));
  background: var(--agala-seg-group-bg, hsl(var(--agala-muted) / 0.55));
  scrollbar-width: none;
}

.segControl::-webkit-scrollbar {
  display: none;
}

.segControlDisabled {
  opacity: var(--agala-opacity-disabled);
  pointer-events: none;
}

.segControlBlock {
  width: 100%;
}

.segOption {
  --seg-accent: var(--agala-seg-active-accent, hsl(var(--agala-primary)));
  position: relative;
  z-index: 0;
  display: inline-flex;
  flex: 0 0 auto;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: var(--agala-seg-height, 2.25rem);
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  line-height: 1.2;
  border: var(--agala-border-width) solid transparent;
  border-radius: calc(var(--agala-seg-radius, var(--agala-radius)) - 0.1875rem);
  background: transparent;
  color: var(--agala-seg-inactive-color, hsl(var(--agala-muted-foreground)));
  cursor: pointer;
  outline: none;
  user-select: none;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: var(--agala-seg-padding, 0 0.75rem);
  transition:
    background-color var(--agala-transition-fast),
    color var(--agala-transition-fast),
    border-color var(--agala-transition-fast);
}

.segOption:hover:not(.segOptionDisabled):not(.segOptionActive) {
  background: hsl(var(--agala-card) / 0.6);
  color: hsl(var(--agala-foreground));
}

.segSm {
  --agala-seg-height: 2rem;
  --agala-seg-padding: 0 0.625rem;
  font-size: var(--agala-seg-font-size-sm, 0.813rem);
}

.segMd {
  --agala-seg-height: 2.25rem;
  font-size: var(--agala-seg-font-size-md, 0.875rem);
}

.segLg {
  --agala-seg-height: 2.5rem;
  --agala-seg-padding: 0 1rem;
  font-size: var(--agala-seg-font-size-lg, 1rem);
}

.segControlBlock .segOption {
  flex: 1 1 0;
}

.segOptionActive {
  background: var(--agala-seg-active-bg, hsl(var(--agala-card)));
  color: var(--agala-seg-active-color, hsl(var(--agala-foreground)));
  border-color: hsl(var(--agala-border) / 0.7);
  box-shadow:
    var(--agala-shadow-xs),
    inset 0 0 0 1px color-mix(in srgb, var(--seg-accent) 18%, transparent);
  z-index: 1;
}

.segOptionActive.segOption--danger {
  --seg-accent: hsl(var(--agala-danger));
}

.segOptionActive.segOption--success {
  --seg-accent: hsl(var(--agala-success));
}

.segOptionActive.segOption--warning {
  --seg-accent: hsl(var(--agala-warning));
}

.segOptionActive.segOption--info {
  --seg-accent: hsl(var(--agala-accent-foreground));
}

.segOption:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
  z-index: 2;
}

.segOptionDisabled {
  opacity: 0.4;
  pointer-events: none;
}

.segLabel {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 639px) {
  .segControl:not(.segControlBlock) .segOption {
    min-width: max-content;
  }

  .canScrollEnd:not(.canScrollStart) {
    mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent);
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 1rem), transparent);
  }

  .canScrollStart:not(.canScrollEnd) {
    mask-image: linear-gradient(to right, transparent, black 1rem);
    -webkit-mask-image: linear-gradient(to right, transparent, black 1rem);
  }

  .canScrollStart.canScrollEnd {
    mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent);
  }
}

@media (pointer: coarse) {
  .segOption {
    min-height: max(var(--agala-seg-height, 2.25rem), 2.75rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .segOption {
    transition: none;
  }
}
</style>
