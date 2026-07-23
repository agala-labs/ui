<script setup lang="ts">
import { computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import type { ListGroupItemProps } from './types'
import type { IconName } from '../AgalaIcon/types'

const props = withDefaults(defineProps<ListGroupItemProps>(), {
  badgeVariant: 'default',
  variant: 'default',
  disabled: false,
  class: '',
})

const emit = defineEmits<{
  click: [e: Event]
}>()

const itemCls = computed(() => [
  'listItem',
  props.variant === 'danger' ? 'listItemDanger' : undefined,
  props.disabled ? 'listItemDisabled' : undefined,
  props.radius ? `listItemRadius${props.radius.charAt(0).toUpperCase() + props.radius.slice(1)}` : undefined,
  props.class,
].filter(Boolean).join(' '))

function handleClick(e: Event) {
  if (props.disabled) return
  emit('click', e)
}

function handleKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  emit('click', e)
}

const iconName = computed(() => props.icon as IconName | undefined)

const badgeCls = computed(() => [
  'listBadgeInner',
  `listBadgeInner--${props.badgeVariant}`,
])
</script>

<template>
  <div
    :class="itemCls"
    role="listitem"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleKeydown"
    @keydown.space.prevent="handleKeydown"
  >
    <slot name="leading">
      <AgalaIcon v-if="icon" :name="iconName" :size="16" class="listIcon" />
    </slot>

    <slot>
      <div class="listBody">
        <div class="listContent">
          <span class="listLabel">{{ label }}</span>
          <span v-if="subtitle" class="listSubtitle">{{ subtitle }}</span>
        </div>
      </div>
    </slot>

    <slot name="trailing">
      <slot name="badge">
        <span
          v-if="badge"
          :class="badgeCls"
        >
          {{ badge }}
        </span>
      </slot>
      <AgalaIcon v-if="actionIcon" :name="actionIcon as IconName" :size="14" class="listChevron" />
    </slot>
  </div>
</template>

<style scoped>
.listItem {
  display: flex;
  align-items: center;
  gap: var(--agala-list-item-gap, 0.75rem);
  padding: var(--agala-list-item-padding, 0.75rem 1rem);
  background: var(--agala-list-item-bg, hsl(var(--agala-card)));
  border-bottom: var(--agala-list-item-border, 1px solid hsl(var(--agala-border)));
  cursor: pointer;
  outline: none;
  transition: background-color var(--agala-transition-fast);
}

.listItem:last-child {
  border-bottom: none;
}

.listItem:hover:not(.listItemDisabled) {
  background: var(--agala-list-item-hover-bg, hsl(var(--agala-muted)));
}

.listItem:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.listItemDisabled {
  opacity: var(--agala-opacity-disabled);
  pointer-events: none;
}

.listItemDanger .listLabel,
.listItemDanger .listIcon {
  color: hsl(var(--agala-danger));
}

.listItemRadiusNone {
  border-radius: 0;
}

.listItemRadiusSm {
  border-radius: var(--agala-radius-sm);
}

.listItemRadiusMd {
  border-radius: var(--agala-radius);
}

.listItemRadiusLg {
  border-radius: var(--agala-radius-lg);
}

.listIcon {
  flex-shrink: 0;
  color: hsl(var(--agala-muted-foreground));
}

.listBody {
  flex: 1;
  min-width: 0;
}

.listContent {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.listLabel {
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-medium);
  color: hsl(var(--agala-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listSubtitle {
  font-size: var(--agala-font-size-sm);
  color: hsl(var(--agala-muted-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listBadgeInner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: 99px;
  font-size: 0.6875rem;
  font-weight: var(--agala-font-weight-semibold);
  line-height: 1;
}

.listBadgeInner--default {
  background: var(--agala-list-badge-bg, hsl(var(--agala-primary) / 0.1));
  color: var(--agala-list-badge-color, hsl(var(--agala-primary)));
}

.listBadgeInner--primary {
  background: hsl(var(--agala-primary) / 0.15);
  color: hsl(var(--agala-primary));
}

.listBadgeInner--success {
  background: hsl(var(--agala-success) / 0.15);
  color: hsl(var(--agala-success));
}

.listBadgeInner--warning {
  background: hsl(var(--agala-warning) / 0.15);
  color: hsl(var(--agala-warning));
}

.listBadgeInner--danger {
  background: hsl(var(--agala-danger) / 0.15);
  color: hsl(var(--agala-danger));
}

.listChevron {
  flex-shrink: 0;
  color: hsl(var(--agala-muted-foreground));
}
</style>
