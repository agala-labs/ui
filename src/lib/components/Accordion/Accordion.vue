<script setup lang="ts">
import { AccordionRoot } from 'reka-ui'
import type { AccordionProps } from './types'

const props = withDefaults(defineProps<AccordionProps>(), {
  multiple: false,
})

</script>

<template>
  <AccordionRoot
    :type="multiple ? 'multiple' : 'single'"
    collapsible
    :class="['accordion', props.class].filter(Boolean).join(' ')"
  >
    <slot />
  </AccordionRoot>
</template>

<style scoped>
.accordion {
  display: flex;
  flex-direction: column;
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-lg);
  overflow: hidden;
}
</style>
