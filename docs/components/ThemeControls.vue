<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Theme = 'default' | 'main' | 'smaltt' | 'kervo'

const themes: ReadonlyArray<{ value: Theme, label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'main', label: 'Main' },
  { value: 'smaltt', label: 'Smaltt' },
  { value: 'kervo', label: 'Kervo' },
]

const theme = ref<Theme>('main')

function apply(value: Theme) {
  theme.value = value
  if (typeof document === 'undefined') return
  if (value === 'default') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('agala-docs-theme', value)
}

onMounted(() => {
  const selected = document.documentElement.dataset.theme
  theme.value = themes.some(item => item.value === selected) ? selected as Theme : 'default'
})
</script>

<template>
  <div
    class="theme-controls"
    aria-label="Preview theme"
  >
    <span>Preview theme</span>
    <AgalaButton
      v-for="item in themes"
      :key="item.value"
      size="sm"
      :variant="theme === item.value ? 'default' : 'outline'"
      :aria-pressed="theme === item.value"
      @click="apply(item.value)"
    >
      {{ item.label }}
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
