<script setup lang="ts">
import { computed } from 'vue'
import type { StackProps } from './types'

const props = withDefaults(defineProps<StackProps>(), {
  direction: 'vertical',
  gap: '0.5rem',
  align: 'stretch',
  wrap: false,
  class: '',
})

const style = computed(() => ({
  display: 'flex',
  flexDirection: (props.direction === 'horizontal' ? 'row' : 'column') as 'row' | 'column',
  gap: props.gap,
  alignItems: props.align,
  justifyContent: props.justify,
  flexWrap: (props.wrap ? 'wrap' : undefined) as 'wrap' | undefined,
}))

const renderedAs = computed(() => props.as ?? 'div')
</script>

<template>
  <component :is="renderedAs" :class="$props.class" :style="style">
    <slot />
  </component>
</template>
