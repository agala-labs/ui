<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import Input from '../Input/Input.vue'
import { useDropdownPosition } from '../../composables/useDropdownPosition'
import { usePopoverBehavior } from '../../composables/usePopoverBehavior'
import ColorSquare from './ColorSquare.vue'
import HueSlider from './HueSlider.vue'
import {
  hexToHsl,
  hslToHex,
  isValidHex,
  parseHslToken,
} from './colorUtils'
import type { HSL } from './colorUtils'
import type { ColorPickerProps, ColorPickerSize } from './types'

const props = withDefaults(defineProps<ColorPickerProps>(), {
  size: 'md' as ColorPickerSize,
  disabled: false,
  error: false,
  errorMessage: '',
  placeholder: 'Pick a color',
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/* ─── Refs ─── */
const triggerRef = ref<HTMLDivElement>()
const wrapperRef = ref<HTMLDivElement>()
const floatingRef = ref<HTMLDivElement>()
const colorSquareRef = ref<InstanceType<typeof ColorSquare>>()

/* ─── Popover positioning ─── */
const { dropdownStyle, recompute } = useDropdownPosition(triggerRef, floatingRef, { width: 'auto' })

/* ─── State ─── */
const isOpen = ref(false)
const internalColor = ref<HSL>({ h: 0, s: 0, l: 100 })
const hexInputText = ref('')
const hexError = ref(false)
const presetColors = ref<string[]>([])

/* ─── Presets (on mount) ─── */
const TOKEN_NAMES = [
  '--agala-primary',
  '--agala-secondary',
  '--agala-accent',
  '--agala-danger',
  '--agala-success',
  '--agala-warning',
  '--agala-muted',
] as const

const CURATED_PALETTE: string[] = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#2563eb', '#7c3aed', '#db2777',
  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
]

function readThemePresets(): string[] {
  const result: string[] = []
  const style = getComputedStyle(document.documentElement)
  for (const name of TOKEN_NAMES) {
    const val = style.getPropertyValue(name).trim()
    if (!val) continue
    const hsl = parseHslToken(val)
    if (hsl) result.push(hslToHex(hsl))
  }
  return result
}

onMounted(() => {
  const theme = readThemePresets()
  presetColors.value = [...theme, ...CURATED_PALETTE]
})

/* ─── Computed ─── */
const hasValue = computed(() => props.modelValue && isValidHex(props.modelValue))

const currentHex = computed(() => hslToHex(internalColor.value))

const triggerLabel = computed(() => {
  if (hasValue.value) return currentHex.value
  return props.placeholder
})

const swatchStyle = computed(() => {
  if (hasValue.value) return { backgroundColor: currentHex.value }
  return {}
})

const swatchEmpty = computed(() => !hasValue.value)

/* Size classes */
const sizeMap: Record<ColorPickerSize, string> = {
  sm: 'triggerSm',
  md: 'triggerMd',
  lg: 'triggerLg',
}

const triggerCls = computed(() => [
  'trigger',
  sizeMap[props.size],
  isOpen.value ? 'triggerOpen' : undefined,
  props.disabled ? 'triggerDisabled' : undefined,
  props.error ? 'triggerError' : undefined,
  props.class,
].filter(Boolean).join(' '))

/* ─── Syncing ─── */
function syncFromModel() {
  if (props.modelValue && isValidHex(props.modelValue)) {
    const hsl = hexToHsl(props.modelValue)
    if (hsl) internalColor.value = hsl
    hexInputText.value = props.modelValue.replace(/^#/, '')
    hexError.value = false
  } else {
    internalColor.value = { h: 0, s: 0, l: 100 }
    hexInputText.value = ''
    hexError.value = false
  }
}

watch(() => props.modelValue, () => {
  if (!isOpen.value) syncFromModel()
})

/* Sync from internalColor → hexInputText (one-way) */
watch(internalColor, () => {
  const hex = hslToHex(internalColor.value)
  hexInputText.value = hex.replace(/^#/, '')
}, { deep: true })

/* ─── Open / Close ─── */
function open() {
  if (props.disabled) return
  syncFromModel()
  isOpen.value = true
  nextTick(() => {
    requestAnimationFrame(() => recompute())
    colorSquareRef.value?.$el?.focus?.({ preventScroll: true })
  })
}

function close(opts?: { revert?: boolean }) {
  if (opts?.revert) syncFromModel()
  isOpen.value = false
  hexError.value = false
}

function toggle() {
  if (isOpen.value) close({ revert: true })
  else open()
}

/* ─── Triggers ─── */
function handleTriggerClick() {
  toggle()
}

function handleTriggerKeyDown(e: KeyboardEvent) {
  if (props.disabled) return
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      toggle()
      break
    case 'ArrowDown':
      e.preventDefault()
      if (!isOpen.value) open()
      break
    case 'Escape':
      e.preventDefault()
      if (isOpen.value) close({ revert: true })
      break
  }
}

/* ─── Color interaction ─── */
function emitColor() {
  const hex = hslToHex(internalColor.value)
  emit('update:modelValue', hex)
  hexError.value = false
}

function onSquareSatUpdate(s: number) {
  internalColor.value = { ...internalColor.value, s }
}

function onSquareLumUpdate(l: number) {
  internalColor.value = { ...internalColor.value, l }
}

function onSquareCommit() {
  emitColor()
}

function onHueCommit() {
  emitColor()
}

/* ─── Presets ─── */
function selectPreset(hex: string) {
  const hsl = hexToHsl(hex)
  if (!hsl) return
  internalColor.value = hsl
  emitColor()
  // Do NOT close — user may want to tweak
}

/* ─── HEX input ─── */
function handleHexInput(text: string) {
  hexInputText.value = text
  hexError.value = false

  // If valid 6-char hex (without #), update color in real-time
  if (/^[0-9a-fA-F]{6}$/.test(text)) {
    const hsl = hexToHsl(`#${text}`)
    if (hsl) {
      internalColor.value = hsl
      emit('update:modelValue', `#${text.toLowerCase()}`)
    }
  }
}

function commitHex() {
  const text = hexInputText.value.trim()
  // Auto-prefix # if missing
  const hex = text.startsWith('#') ? text : `#${text}`
  if (isValidHex(hex)) {
    const fullHex = hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex.toLowerCase()
    const hsl = hexToHsl(fullHex)
    if (hsl) {
      internalColor.value = hsl
      emit('update:modelValue', fullHex)
      hexError.value = false
      close()
      return
    }
  }
  // Invalid hex — show error
  hexError.value = true
}

/* ─── Clear ─── */
function handleClear() {
  emit('update:modelValue', '')
  close()
}

/* ─── Popover behavior (click-outside, scroll-close, resize-reposition) ─── */
usePopoverBehavior(isOpen, wrapperRef, floatingRef, () => close(), recompute)

/* ─── Tab trapping ─── */
function handlePopoverKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close({ revert: true })
    triggerRef.value?.focus()
    return
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(floatingRef.value?.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])'
    ) || [])
    if (!focusable || focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

</script>

<template>
  <div ref="wrapperRef" class="wrapper">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      :class="triggerCls"
      role="combobox"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      tabindex="0"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeyDown"
    >
      <span
        class="swatch"
        :class="{ swatchEmpty }"
        :style="swatchStyle"
        aria-hidden="true"
      />
      <span class="triggerLabel">{{ triggerLabel }}</span>
      <span class="chevron" :class="{ chevronOpen: isOpen }" aria-hidden="true">
        <AgalaIcon name="chevron" :size="14" />
      </span>
    </div>

    <!-- Error message -->
    <p v-if="error && errorMessage" class="errorMsg">{{ errorMessage }}</p>

    <!-- Popover -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="floatingRef"
        class="dropdown"
        :style="dropdownStyle"
        role="dialog"
        aria-label="Color picker"
        @keydown="handlePopoverKeyDown"
      >
        <!-- Square + Slider -->
        <ColorSquare
          ref="colorSquareRef"
          :hue="internalColor.h"
          :saturation="internalColor.s"
          :luminance="internalColor.l"
          @update:saturation="onSquareSatUpdate"
          @update:luminance="onSquareLumUpdate"
          @commit="onSquareCommit"
        />

        <HueSlider
          v-model="internalColor.h"
          @commit="onHueCommit"
        />

        <!-- Presets -->
        <div class="presets" role="listbox" aria-label="Preset colors">
          <button
            v-for="color in presetColors"
            :key="color"
            type="button"
            role="option"
            :aria-label="`Color ${color}`"
            :aria-selected="currentHex === color"
            class="presetBtn"
            :class="{ presetBtnSelected: currentHex === color }"
            :style="{ backgroundColor: color }"
            @click="selectPreset(color)"
          >
            <span v-if="currentHex === color" class="presetCheck">
              <AgalaIcon name="check" :size="10" />
            </span>
          </button>
        </div>

        <!-- HEX input -->
        <div class="hexRow">
          <span class="hexPrefix">#</span>
          <Input
            v-model="hexInputText"
            size="sm"
            :error="hexError"
            placeholder="ff6600"
            :maxlength="6"
            @update:model-value="handleHexInput"
            @keydown.enter.prevent="commitHex"
            @blur="commitHex"
          />
        </div>

        <!-- Clear -->
        <div v-if="clearable && hasValue" class="footer">
          <button type="button" class="clearBtn" @click="handleClear">
            × Clear
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ─── Wrapper ─── */
.wrapper {
  position: relative;
}

/* ─── Trigger ─── */
.trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  border: var(--agala-border-width) solid hsl(var(--agala-input));
  border-radius: var(--agala-radius);
  background: hsl(var(--agala-input-background, var(--agala-background)));
  font-family: var(--agala-font-sans);
  color: hsl(var(--agala-foreground));
  cursor: pointer;
  text-align: left;
  transition:
    border-color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
  outline: none;
  user-select: none;
}

.trigger:hover {
  border-color: hsl(var(--agala-border));
}

.trigger:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--agala-background)),
              0 0 0 4px hsl(var(--agala-ring));
}

.triggerOpen {
  border-color: hsl(var(--agala-ring));
  box-shadow: 0 0 0 1px hsl(var(--agala-background)),
              0 0 0 3px hsl(var(--agala-ring) / 0.2);
}

.triggerError {
  border-color: hsl(var(--agala-danger));
}

.triggerError:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--agala-background)),
              0 0 0 4px hsl(var(--agala-danger));
}

.triggerDisabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  background: hsl(var(--agala-muted));
}

/* Trigger sizes */
.triggerSm {
  height: var(--agala-height-sm, 2rem);
  padding: 0 0.5rem;
  font-size: var(--agala-font-size-sm);
  border-radius: var(--agala-radius-sm);
}

.triggerMd {
  height: var(--agala-height-md, 2.25rem);
  padding: 0 0.625rem;
}

.triggerLg {
  height: var(--agala-height-lg, 2.5rem);
  padding: 0 0.875rem;
  font-size: var(--agala-font-size-lg);
  border-radius: var(--agala-radius-lg);
}

/* Swatch */
.swatch {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: calc(var(--agala-radius) - 2px);
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  flex-shrink: 0;
}

.swatchEmpty {
  background-image:
    linear-gradient(45deg, hsl(var(--agala-border)) 25%, transparent 25%),
    linear-gradient(-45deg, hsl(var(--agala-border)) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, hsl(var(--agala-border)) 75%),
    linear-gradient(-45deg, transparent 75%, hsl(var(--agala-border)) 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

.triggerSm .swatch {
  width: 1rem;
  height: 1rem;
}

.triggerLg .swatch {
  width: 1.5rem;
  height: 1.5rem;
}

/* Trigger label */
.triggerLabel {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: hsl(var(--agala-muted-foreground));
}

/* Chevron */
.chevron {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform var(--agala-transition-fast);
}

.chevronOpen {
  transform: rotate(180deg);
}

/* Error message */
.errorMsg {
  margin: 0.25rem 0 0;
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-danger));
}

/* ─── Dropdown / Popover ─── */
.dropdown {
  box-sizing: border-box;
  z-index: var(--agala-z-dropdown);
  width: 280px;
  padding: 0.75rem;
  background: hsl(var(--agala-popover));
  color: hsl(var(--agala-popover-foreground));
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  box-shadow: var(--agala-shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  outline: none;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ─── Presets ─── */
.presets {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.presetBtn {
  width: 100%;
  aspect-ratio: 1;
  max-width: 28px;
  border-radius: var(--agala-radius-sm);
  border: var(--agala-border-width) solid transparent;
  cursor: pointer;
  position: relative;
  transition:
    transform var(--agala-transition-fast),
    border-color var(--agala-transition-fast);
  padding: 0;
  outline: none;
}

.presetBtn:hover {
  transform: scale(1.15);
  z-index: 1;
}

.presetBtn:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

.presetBtnSelected {
  border-color: hsl(var(--agala-foreground));
}

.presetCheck {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
}

/* ─── HEX input row ─── */
.hexRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hexPrefix {
  color: hsl(var(--agala-muted-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-sm);
  flex-shrink: 0;
}

.hexRow :deep(.inputWrapper) {
  flex: 1;
}

/* ─── Footer / Clear ─── */
.footer {
  display: flex;
  justify-content: flex-end;
}

.clearBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
  font-family: var(--agala-font-sans);
  cursor: pointer;
  transition:
    color var(--agala-transition-fast),
    background-color var(--agala-transition-fast);
}

.clearBtn:hover {
  color: hsl(var(--agala-danger));
  background-color: hsl(var(--agala-danger) / 0.05);
}

.clearBtn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring) / 0.3);
}

/* ─── Responsive ─── */
@media (max-width: 359px) {
  .presets {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
