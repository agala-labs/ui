<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Theme = 'default' | 'forja'
const theme = ref<Theme>('default')

function apply(value: Theme) {
  theme.value = value
  if (typeof document === 'undefined') return
  if (value === 'forja') document.documentElement.setAttribute('data-theme', 'forja')
  else document.documentElement.removeAttribute('data-theme')
}

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'forja' ? 'forja' : 'default'
})
</script>

<template>
  <div
    class="theme-controls"
    aria-label="Preview theme"
  >
    <span>Preview theme</span>
    <AgalaButton
      v-for="value in (['default', 'forja'] as const)"
      :key="value"
      size="sm"
      :variant="theme === value ? 'default' : 'outline'"
      @click="apply(value)"
    >
      {{ value === 'default' ? 'Default' : 'Forja' }}
    </AgalaButton>
  </div>
</template>

<style scoped>
.theme-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0 1.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius);
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-card));
}
.theme-controls > span { margin-right: auto; font-size: 0.8rem; font-weight: 600; }
</style>
