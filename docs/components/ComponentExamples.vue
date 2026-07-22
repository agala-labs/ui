<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AgalaTabs } from '@ui'
import type { ComponentExample } from '../data/components'
import ComponentPreview from './ComponentPreview.vue'
import DemoFrame from './DemoFrame.vue'

const props = defineProps<{
  slug: string
  examples: ComponentExample[]
}>()

const fallbackId = computed(() => props.examples[0]?.id ?? 'default')
const activeExampleId = ref(fallbackId.value)
const tabs = computed(() => props.examples.map(example => ({
  value: example.id,
  label: example.label,
})))
const activeExample = computed(() =>
  props.examples.find(example => example.id === activeExampleId.value) ?? props.examples[0],
)

function exampleFromLocation() {
  if (typeof window === 'undefined') return undefined
  const requested = new URL(window.location.href).searchParams.get('example')
  return props.examples.find(example => example.id === requested)?.id
}

function syncFromLocation() {
  activeExampleId.value = exampleFromLocation() ?? fallbackId.value
}

function updateLocation(exampleId: string) {
  if (typeof window === 'undefined' || props.examples.length < 2) return
  const url = new URL(window.location.href)
  if (exampleId === fallbackId.value) url.searchParams.delete('example')
  else url.searchParams.set('example', exampleId)
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

onMounted(syncFromLocation)

watch(() => props.slug, syncFromLocation)
watch(() => props.examples, syncFromLocation, { deep: true })
watch(activeExampleId, updateLocation)
</script>

<template>
  <div
    v-if="activeExample"
    class="component-examples"
    :data-active-example="activeExample.id"
  >
    <AgalaTabs
      v-if="examples.length > 1"
      v-model="activeExampleId"
      class="component-examples__tabs"
      :tabs="tabs"
      aria-label="Component examples"
    />

    <p
      v-if="activeExample.description"
      class="component-examples__description"
    >
      {{ activeExample.description }}
    </p>

    <DemoFrame
      :title="examples.length > 1 ? activeExample.label : undefined"
      :code="activeExample.snippet"
    >
      <ComponentPreview
        :key="`${slug}:${activeExample.id}`"
        :slug="slug"
        :example="activeExample.id"
      />
    </DemoFrame>
  </div>
</template>

<style scoped>
.component-examples {
  min-width: 0;
}

.component-examples__tabs {
  margin-top: 1rem;
}

.component-examples__description {
  margin: 0.875rem 0 -0.25rem;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-relaxed);
}
</style>
