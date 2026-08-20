<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AccordionContent, AccordionHeader, AccordionItem as AccordionItemRoot, AccordionTrigger } from 'reka-ui'
import type { AccordionItemProps } from './types'

defineProps<AccordionItemProps>()

// Reka links the trigger's aria-controls to the content's id via a plain
// (non-reactive) field on their shared context, set when the content
// component's own setup() runs. Since it isn't a ref, the trigger's first
// render — which happens before the content component's setup, as it's
// declared first in this template — captures it empty and only picks up
// the real value later, incidentally, on the next unrelated re-render (e.g.
// the first time the item opens). By the time this component's own
// onMounted fires, every child's setup() has already run (content's
// included), so bumping a value the trigger reads forces the one extra
// re-render needed to pick up the by-then-correct id.
const mountTick = ref(0)
onMounted(() => {
  mountTick.value += 1
})
</script>

<template>
  <AccordionItemRoot
    v-slot="{ open }"
    :value="value"
    :disabled="disabled"
    :class="['item', disabled ? 'itemDisabled' : undefined].filter(Boolean).join(' ')"
  >
    <AccordionHeader
      class="header"
      as="div"
    >
      <AccordionTrigger
        class="trigger"
        :data-mount-tick="mountTick"
      >
        <span class="triggerTitle">{{ title }}</span>
        <span
          :class="['chevron', open ? 'chevronOpen' : undefined].filter(Boolean).join(' ')"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </AccordionTrigger>
    </AccordionHeader>

    <AccordionContent
      force-mount
      class="panel"
      :aria-hidden="!open"
    >
      <div class="panelInner">
        <div class="panelContent">
          <slot />
        </div>
      </div>
    </AccordionContent>
  </AccordionItemRoot>
</template>

<style scoped>
.item {
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.item:last-child {
  border-bottom: none;
}

.itemDisabled {
  opacity: var(--agala-opacity-disabled);
}

.header {
  margin: 0;
  font: inherit;
}

.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--agala-accordion-trigger-padding, 1rem 1.25rem);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-foreground));
  text-align: left;
  transition: background-color var(--agala-transition-fast);
  outline: none;
}

.trigger:hover:not(:disabled) {
  background-color: hsl(var(--agala-muted));
}

.trigger:focus-visible {
  outline: 2px solid hsl(var(--agala-ring));
  outline-offset: -2px;
}

.trigger:disabled {
  cursor: not-allowed;
}

.triggerTitle {
  flex: 1;
}

.chevron {
  flex-shrink: 0;
  color: hsl(var(--agala-muted-foreground));
  transition: transform var(--agala-transition-base);
}

.chevronOpen {
  transform: rotate(180deg);
}

/* CSS grid trick for smooth height animation — no JS height calc needed */
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--agala-transition-base);
}

.panel[data-state='open'] {
  grid-template-rows: 1fr;
}

.panelInner {
  min-height: 0;
  overflow: hidden;
}

.panelContent {
  padding: var(--agala-accordion-content-padding, 0.375rem 1.25rem 1rem);
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  color: hsl(var(--agala-muted-foreground));
  line-height: var(--agala-line-height-relaxed);
}

.panelContent :deep(> :first-child) {
  margin-block-start: 0;
}

.panelContent :deep(> :last-child) {
  margin-block-end: 0;
}

@media (max-width: 480px) {
  .item {
    --agala-accordion-trigger-padding: 0.875rem 1rem;
    --agala-accordion-content-padding: 0.375rem 1rem 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .chevron {
    transition: none !important;
  }
}
</style>
