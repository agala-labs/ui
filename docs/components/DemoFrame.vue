<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  code: string
}>()

const copied = ref(false)

async function copyCode() {
  if (typeof navigator === 'undefined') return
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}
</script>

<template>
  <div class="demo-frame">
    <div
      v-if="title"
      class="demo-frame__header"
    >
      {{ title }}
    </div>
    <div class="demo-frame__preview">
      <slot />
    </div>
    <div class="demo-frame__code">
      <pre><code>{{ code }}</code></pre>
      <button
        type="button"
        class="demo-frame__copy"
        @click="copyCode"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.demo-frame {
  margin: 1.25rem 0 2rem;
  overflow: hidden;
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-lg);
  background: hsl(var(--agala-card));
}

.demo-frame__header {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid hsl(var(--agala-border));
  color: hsl(var(--agala-muted-foreground));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.demo-frame__preview {
  min-height: 7rem;
  padding: 1.5rem;
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-background));
}

.demo-frame__code {
  position: relative;
  border-top: 1px solid hsl(var(--agala-border));
  background: hsl(var(--agala-muted) / 0.55);
}

.demo-frame__code pre {
  margin: 0;
  padding: 1rem 4rem 1rem 1rem;
  overflow-x: auto;
  background: transparent;
}

.demo-frame__code code {
  padding: 0;
  color: hsl(var(--agala-foreground));
  background: transparent;
  font-family: var(--agala-font-mono);
  font-size: 0.78rem;
  white-space: pre;
}

.demo-frame__copy {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  min-width: 3.5rem;
  padding: 0.32rem 0.55rem;
  border: 1px solid hsl(var(--agala-border));
  border-radius: var(--agala-radius-sm);
  color: hsl(var(--agala-muted-foreground));
  background: hsl(var(--agala-card));
  cursor: pointer;
}

.demo-frame__copy:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}

@media (max-width: 640px) {
  .demo-frame__preview { padding: 1rem; }
}
</style>
