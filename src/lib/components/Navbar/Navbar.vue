<script setup lang="ts">
import type { NavbarProps } from './types'

const props = defineProps<NavbarProps>()
</script>

<template>
  <header :class="['navbar', props.class].filter(Boolean).join(' ')">
    <div v-if="$slots.brand" class="navbarBrand">
      <slot name="brand" />
    </div>

    <nav class="navbarNav">
      <slot />
    </nav>

    <div v-if="$slots.actions" class="navbarActions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--agala-z-navbar, 100);
  display: flex;
  align-items: center;
  height: var(--agala-navbar-height, 3.5rem);
  padding: var(--agala-navbar-padding, 0 1.25rem);
  gap: 1rem;
  background: var(--agala-navbar-bg, hsl(var(--agala-card)));
  border-bottom: var(--agala-navbar-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  box-shadow: var(--agala-navbar-shadow, var(--agala-shadow-xs));
}

.navbarBrand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
  font-weight: var(--agala-navbar-brand-weight, var(--agala-font-weight-semibold));
  font-size: var(--agala-navbar-brand-size, var(--agala-font-size-lg));
  color: hsl(var(--agala-foreground));
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 639px) {
  .navbarBrand {
    flex-shrink: 1;
  }
}

.navbarNav {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.navbarActions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
