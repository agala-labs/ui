<script setup lang="ts">
import { computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import Tooltip from '../Tooltip/Tooltip.vue'
import type { SidebarIndent, SidebarNavItem, SidebarNode } from './types'

const props = withDefaults(defineProps<{
  items: SidebarNode[]
  activeValue?: string
  expandedValues: string[]
  collapsed?: boolean
  level?: number
  indent?: SidebarIndent
}>(), {
  expandedValues: () => [],
  collapsed: false,
  level: 0,
  indent: 'comfortable',
})

const emit = defineEmits<{
  toggle: [value: string]
  select: [item: SidebarNavItem, event: MouseEvent | KeyboardEvent]
  focusNext: [event: KeyboardEvent]
  focusPrevious: [event: KeyboardEvent]
  focusFirst: [event: KeyboardEvent]
  focusLast: [event: KeyboardEvent]
}>()

const expandedSet = computed(() => new Set(props.expandedValues))

const indentStep = computed(() => {
  if (props.collapsed) return '0rem'
  return props.indent === 'compact' ? '0.625rem' : '1rem'
})

function isSection(node: SidebarNode): node is { label: string; items: SidebarNavItem[]; class?: string } {
  return 'items' in node && !('value' in node)
}

function hasChildren(item: SidebarNavItem) {
  return Array.isArray(item.children) && item.children.length > 0
}

function isExpanded(item: SidebarNavItem) {
  return expandedSet.value.has(item.value)
}

function isActive(item: SidebarNavItem) {
  return item.active || item.value === props.activeValue
}

function isDescendantActive(item: SidebarNavItem): boolean {
  return Boolean(item.children?.some((child) => isActive(child) || isDescendantActive(child)))
}

function itemCls(item: SidebarNavItem) {
  return [
    'sidebarTreeItem',
    isActive(item) ? 'sidebarTreeItem--active' : undefined,
    isDescendantActive(item) ? 'sidebarTreeItem--descendant-active' : undefined,
    hasChildren(item) ? 'sidebarTreeItem--parent' : undefined,
    item.disabled ? 'sidebarTreeItem--disabled' : undefined,
    props.collapsed ? 'sidebarTreeItem--collapsed' : undefined,
    item.class,
  ].filter(Boolean).join(' ')
}

function badgeCls(item: SidebarNavItem) {
  return [
    'sidebarTreeItem__badge',
    `sidebarTreeItem__badge--${item.badgeVariant || 'default'}`,
    props.collapsed ? 'sidebarTreeItem__badge--collapsed' : undefined,
  ].filter(Boolean).join(' ')
}

function dotCls(item: SidebarNavItem) {
  return [
    'sidebarTreeItem__dot',
    `sidebarTreeItem__dot--${item.dotVariant || 'primary'}`,
    props.collapsed ? 'sidebarTreeItem__dot--collapsed' : undefined,
  ].filter(Boolean).join(' ')
}

function onActivate(item: SidebarNavItem, event: MouseEvent | KeyboardEvent) {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  if (hasChildren(item)) {
    emit('toggle', item.value)
  }

  emit('select', item, event)
}

function onKeydown(item: SidebarNavItem, event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    emit('focusNext', event)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    emit('focusPrevious', event)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    emit('focusFirst', event)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    emit('focusLast', event)
    return
  }

  if (event.key === 'ArrowRight' && hasChildren(item) && !isExpanded(item)) {
    event.preventDefault()
    emit('toggle', item.value)
    return
  }

  if (event.key === 'ArrowLeft' && hasChildren(item) && isExpanded(item)) {
    event.preventDefault()
    emit('toggle', item.value)
    return
  }

  if ((event.key === 'Enter' || event.key === ' ') && !item.href) {
    event.preventDefault()
    onActivate(item, event)
  }
}

function focusSelector(event: KeyboardEvent, direction: 'next' | 'previous' | 'first' | 'last') {
  if (direction === 'next') emit('focusNext', event)
  else if (direction === 'previous') emit('focusPrevious', event)
  else if (direction === 'first') emit('focusFirst', event)
  else emit('focusLast', event)
}
</script>

<template>
  <div
    class="sidebarTree"
    :class="`sidebarTree--level-${Math.min(level, 4)}`"
    :style="{ '--sidebar-indent': indentStep }"
  >
    <template v-for="node in items" :key="isSection(node) ? `section-${node.label}` : node.value">
      <div
        v-if="isSection(node)"
        :class="['sidebarTreeSection', collapsed ? 'sidebarTreeSection--collapsed' : undefined, node.class].filter(Boolean).join(' ')"
      >
        <span v-if="node.label && !collapsed" class="sidebarTreeSection__label">{{ node.label }}</span>
        <SidebarTree
          :items="node.items"
          :active-value="activeValue"
          :expanded-values="expandedValues"
          :collapsed="collapsed"
          :level="level"
          :indent="indent"
          @toggle="emit('toggle', $event)"
          @select="(item, event) => emit('select', item, event)"
          @focus-next="focusSelector($event, 'next')"
          @focus-previous="focusSelector($event, 'previous')"
          @focus-first="focusSelector($event, 'first')"
          @focus-last="focusSelector($event, 'last')"
        />
      </div>

      <div v-else class="sidebarTreeBranch">
        <Tooltip
          v-if="collapsed && node.label"
          placement="right"
          :delay="0"
          :content="node.label"
          block
        >
          <button
            type="button"
            :class="itemCls(node)"
            :disabled="node.disabled"
            :aria-current="isActive(node) ? 'page' : undefined"
            :aria-expanded="hasChildren(node) ? isExpanded(node) : undefined"
            :data-sidebar-node="node.value"
            @click="onActivate(node, $event)"
            @keydown="onKeydown(node, $event)"
          >
            <span v-if="node.icon" class="sidebarTreeItem__icon">
              <AgalaIcon :name="node.icon" :size="18" />
            </span>
            <span v-else class="sidebarTreeItem__icon sidebarTreeItem__icon--empty" aria-hidden="true" />
            <span class="sidebarTreeItem__label">{{ node.label }}</span>
            <span v-if="node.badge !== undefined" :class="badgeCls(node)" aria-hidden="true" />
            <span v-if="node.dot" :class="dotCls(node)" aria-hidden="true" />
          </button>
        </Tooltip>

        <component
          :is="node.href && !hasChildren(node) ? 'a' : 'button'"
          v-else
          :href="node.href && !hasChildren(node) ? node.href : undefined"
          :type="node.href && !hasChildren(node) ? undefined : 'button'"
          :class="itemCls(node)"
          :disabled="!node.href ? node.disabled : undefined"
          :aria-disabled="node.href && node.disabled ? 'true' : undefined"
          :aria-current="isActive(node) ? 'page' : undefined"
          :aria-expanded="hasChildren(node) ? isExpanded(node) : undefined"
          :data-sidebar-node="node.value"
          @click="onActivate(node, $event)"
          @keydown="onKeydown(node, $event)"
        >
          <span v-if="node.icon" class="sidebarTreeItem__icon">
            <AgalaIcon :name="node.icon" :size="18" />
          </span>
          <span v-else class="sidebarTreeItem__icon sidebarTreeItem__icon--empty" aria-hidden="true" />

          <span class="sidebarTreeItem__label">{{ node.label }}</span>

          <span v-if="node.badge !== undefined" :class="badgeCls(node)">
            {{ node.badge }}
          </span>

          <span v-if="node.dot" :class="dotCls(node)" aria-hidden="true" />

          <span
            v-if="hasChildren(node)"
            :class="['sidebarTreeItem__chevron', isExpanded(node) ? 'sidebarTreeItem__chevron--open' : undefined].filter(Boolean).join(' ')"
            aria-hidden="true"
          >
            <AgalaIcon name="chevron-right" :size="14" />
          </span>
        </component>

        <Transition name="sidebarTreePanel">
          <div
            v-if="hasChildren(node) && isExpanded(node) && !collapsed"
            class="sidebarTreePanel"
            role="group"
          >
            <div class="sidebarTreePanel__inner">
              <SidebarTree
                :items="node.children || []"
                :active-value="activeValue"
                :expanded-values="expandedValues"
                :collapsed="collapsed"
                :level="level + 1"
                :indent="indent"
                @toggle="emit('toggle', $event)"
                @select="(item, event) => emit('select', item, event)"
                @focus-next="focusSelector($event, 'next')"
                @focus-previous="focusSelector($event, 'previous')"
                @focus-first="focusSelector($event, 'first')"
                @focus-last="focusSelector($event, 'last')"
              />
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sidebarTree,
.sidebarTreeSection,
.sidebarTreeBranch {
  display: flex;
  flex-direction: column;
}

.sidebarTree {
  gap: 0.125rem;
}

.sidebarTreeSection {
  gap: 0.125rem;
  padding: 0.5rem 0;
}

.sidebarTreeSection--collapsed {
  align-items: center;
}

.sidebarTreeSection__label {
  display: block;
  padding: 0.375rem 0.75rem;
  font-size: 0.625rem;
  font-weight: var(--agala-font-weight-semibold);
  letter-spacing: var(--agala-letter-spacing-wide);
  text-transform: uppercase;
  color: hsl(var(--agala-muted-foreground));
  line-height: 1;
  user-select: none;
}

.sidebarTreeItem {
  --sidebar-item-hover-surface: var(--agala-sidebar-item-hover-bg, hsl(var(--agala-accent) / 0.55));
  --sidebar-item-active-surface: var(--agala-sidebar-item-active-bg, hsl(var(--agala-primary) / 0.1));
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.25rem;
  padding: 0.5rem 0.625rem 0.5rem 0.75rem;
  border: none;
  border-radius: var(--agala-sidebar-item-radius, var(--agala-radius-sm));
  background: transparent;
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  font-weight: var(--agala-font-weight-normal);
  line-height: var(--agala-line-height-normal);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background var(--agala-transition-fast),
    color var(--agala-transition-fast),
    box-shadow var(--agala-transition-fast);
  position: relative;
  overflow: hidden;
}

.sidebarTreeItem:hover:not(.sidebarTreeItem--disabled):not(.sidebarTreeItem--active) {
  background: var(--sidebar-item-hover-surface);
  color: hsl(var(--agala-accent-foreground));
}

.sidebarTreeItem:active:not(.sidebarTreeItem--disabled) {
  background: hsl(var(--agala-primary) / 0.14);
  transition-duration: 0s;
}

.sidebarTreeItem:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--agala-background)),
    0 0 0 4px hsl(var(--agala-ring));
}

.sidebarTreeItem--active {
  background: var(--sidebar-item-active-surface);
  color: hsl(var(--agala-foreground));
  font-weight: var(--agala-font-weight-semibold);
}

.sidebarTreeItem--active:hover:not(.sidebarTreeItem--disabled) {
  background: hsl(var(--agala-primary) / 0.14);
}

.sidebarTreeItem--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: hsl(var(--agala-primary));
}

.sidebarTreeItem--descendant-active:not(.sidebarTreeItem--active) {
  color: hsl(var(--agala-foreground));
  font-weight: var(--agala-font-weight-medium);
}

.sidebarTreeItem--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.sidebarTreeItem--collapsed {
  justify-content: center;
  width: 2.5rem;
  min-height: 2.5rem;
  padding: 0.5rem;
}

.sidebarTreeItem__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: hsl(var(--agala-muted-foreground));
  transition: color var(--agala-transition-fast);
}

.sidebarTreeItem__icon--empty {
  width: 1.25rem;
}

.sidebarTreeItem:hover:not(.sidebarTreeItem--disabled) .sidebarTreeItem__icon,
.sidebarTreeItem--active .sidebarTreeItem__icon,
.sidebarTreeItem--descendant-active .sidebarTreeItem__icon {
  color: hsl(var(--agala-primary));
}

.sidebarTreeItem__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebarTreeItem--collapsed .sidebarTreeItem__label {
  display: none;
}

.sidebarTreeItem__badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.125rem;
  padding: 0 0.375rem;
  border-radius: var(--agala-radius-sm);
  font-size: 0.625rem;
  font-weight: var(--agala-font-weight-semibold);
  line-height: 1;
}

.sidebarTreeItem__badge--collapsed {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  min-width: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border-radius: 50%;
}

.sidebarTreeItem__badge--default {
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-muted-foreground));
}

.sidebarTreeItem__badge--warning {
  background: hsl(var(--agala-warning));
  color: hsl(var(--agala-warning-foreground));
}

.sidebarTreeItem__badge--danger {
  background: hsl(var(--agala-danger));
  color: hsl(var(--agala-danger-foreground));
}

.sidebarTreeItem__badge--success {
  background: hsl(var(--agala-success));
  color: hsl(var(--agala-success-foreground));
}

.sidebarTreeItem__dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.sidebarTreeItem__dot--collapsed {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
}

.sidebarTreeItem__dot--primary {
  background: hsl(var(--agala-primary));
}

.sidebarTreeItem__dot--danger {
  background: hsl(var(--agala-danger));
}

.sidebarTreeItem__dot--warning {
  background: hsl(var(--agala-warning));
}

.sidebarTreeItem__dot--success {
  background: hsl(var(--agala-success));
}

.sidebarTreeItem__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: hsl(var(--agala-muted-foreground));
  transition: transform var(--agala-transition-base), color var(--agala-transition-fast);
}

.sidebarTreeItem__chevron--open {
  transform: rotate(90deg);
  color: hsl(var(--agala-primary));
}

.sidebarTreePanel {
  display: grid;
  grid-template-rows: 1fr;
}

.sidebarTreePanel__inner {
  position: relative;
  min-height: 0;
  overflow: hidden;
  padding-left: var(--sidebar-indent, 1rem);
  margin: 0.125rem 0 0.25rem;
}

/* Guide line runs in the gutter just left of the nested children, descending
   from the parent row's icon. Offset is pulled slightly inside the icon centre
   (1.375rem) so child icons don't collide with the line. */
.sidebarTreePanel__inner::before {
  content: '';
  position: absolute;
  left: 1.125rem;
  top: 0.125rem;
  bottom: 0.125rem;
  width: 1px;
  border-radius: 1px;
  background: hsl(var(--agala-border));
}

.sidebarTreePanel-enter-active,
.sidebarTreePanel-leave-active {
  overflow: hidden;
  transition: grid-template-rows var(--agala-transition-fast);
}

.sidebarTreePanel-enter-from,
.sidebarTreePanel-leave-to {
  grid-template-rows: 0fr;
}

@media (prefers-reduced-motion: reduce) {
  .sidebarTreeItem,
  .sidebarTreeItem__icon,
  .sidebarTreeItem__chevron,
  .sidebarTreePanel-enter-active,
  .sidebarTreePanel-leave-active {
    transition: none;
  }
}
</style>
