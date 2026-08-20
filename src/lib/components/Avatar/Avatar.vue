<script setup lang="ts">
import { computed } from 'vue'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { AgalaIcon } from '../AgalaIcon'
import type { AvatarProps } from './types'

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  shape: 'circle',
})

const presetSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const sizeMap: Record<string, string> = {
  xs: 'avatarXs',
  sm: 'avatarSm',
  md: 'avatarMd',
  lg: 'avatarLg',
  xl: 'avatarXl',
}

const shapeMap: Record<string, string> = {
  circle: 'avatarCircle',
  rounded: 'avatarRounded',
  square: 'avatarSquare',
}

const iconSizeMap: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
}

const isPresetSize = computed(() => presetSizes.includes(props.size as typeof presetSizes[number]))
const customSizeStyle = computed(() => !isPresetSize.value ? {
  width: props.size,
  height: props.size,
  fontSize: `calc(${props.size} * 0.4)`,
} : undefined)

const cls = computed(() => [
  'avatar',
  sizeMap[props.size],
  shapeMap[props.shape],
  props.class,
].filter(Boolean).join(' '))

const iconSize = computed(() => iconSizeMap[props.size])
const displayFallback = computed(() => props.fallback?.slice(0, 2).toUpperCase() || '')
</script>

<template>
  <AvatarRoot
    :class="cls"
    :style="customSizeStyle"
  >
    <AvatarImage
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatarImg"
    />
    <AvatarFallback aria-hidden="true">
      <span
        v-if="displayFallback"
        class="avatarFallback"
      >
        {{ displayFallback }}
      </span>
      <AgalaIcon
        v-else
        name="user"
        :size="iconSize"
        aria-hidden="true"
      />
    </AvatarFallback>
  </AvatarRoot>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--agala-avatar-radius, 50%);
  background: var(--agala-avatar-bg, hsl(var(--agala-muted)));
  color: var(--agala-avatar-color, hsl(var(--agala-muted-foreground)));
  overflow: hidden;
  flex-shrink: 0;
  font-family: var(--agala-font-sans);
  font-weight: var(--agala-font-weight-medium);
  border: var(--agala-avatar-border, var(--agala-border-width) solid hsl(var(--agala-border)));
}

.avatarCircle {
  border-radius: 50%;
}

.avatarRounded {
  border-radius: var(--agala-radius);
}

.avatarSquare {
  border-radius: 0;
}

.avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarFallback {
  line-height: 1;
  text-transform: uppercase;
}

/* Sizes */
.avatarXs { width: 1.5rem;  height: 1.5rem;  font-size: 0.5rem; }
.avatarSm { width: 2rem;    height: 2rem;    font-size: var(--agala-font-size-sm); }
.avatarMd { width: 2.5rem;  height: 2.5rem;  font-size: var(--agala-font-size-base); }
.avatarLg { width: 3rem;    height: 3rem;    font-size: var(--agala-font-size-lg); }
.avatarXl { width: 4rem;    height: 4rem;    font-size: 1.25rem; }
</style>
