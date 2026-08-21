<script setup lang="ts">
import type { Component } from 'vue'

export interface CenterProps {
  as?: string | Component
  class?: string
}

const props = withDefaults(defineProps<CenterProps>(), {
  as: 'div',
  class: '',
})
</script>

<template>
  <component :is="props.as" :class="props.class" style="display: flex; align-items: center; justify-content: center">
    <slot />
  </component>
</template>
