<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import Drawer from '../Drawer/Drawer.vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import SidebarTree from './SidebarTree.vue'
import type { SidebarNavItem, SidebarNode, SidebarProps } from './types'

const props = withDefaults(defineProps<SidebarProps>(), {
  items: undefined,
  activeValue: undefined,
  expanded: undefined,
  defaultExpanded: () => [],
  indent: 'comfortable',
  collapsed: false,
  width: '240px',
  collapsedWidth: '64px',
  responsive: true,
  open: false,
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'update:open': [value: boolean]
  'update:activeValue': [value: string]
  'update:expanded': [value: string[]]
  select: [item: SidebarNavItem, event: MouseEvent | KeyboardEvent]
}>()

const { matches: isTablet } = useMediaQuery(`(max-width: 767px)`)
const { matches: isMobile } = useMediaQuery(`(max-width: 639px)`)

const isCollapsed = computed(() => {
  if (!props.responsive) return props.collapsed
  if (isMobile.value) return true
  if (isTablet.value) return true
  return props.collapsed
})

const currentWidth = computed(() => {
  if (!props.responsive) return props.collapsed ? props.collapsedWidth : props.width
  // CSS media queries will override width for tablet/mobile
  return props.collapsed ? props.collapsedWidth : props.width
})

const internalExpanded = ref<string[]>(props.defaultExpanded)

function isSection(node: SidebarNode): node is { label: string; items: SidebarNavItem[]; class?: string } {
  return 'items' in node && !('value' in node)
}

function collectActiveAncestors(nodes: SidebarNode[] | undefined, activeValue: string | undefined): string[] {
  if (!nodes || !activeValue) return []

  for (const node of nodes) {
    const children = isSection(node) ? node.items : node.children
    if (!children) continue

    if (children.some((item) => item.value === activeValue || item.active)) {
      return isSection(node) ? [] : [node.value]
    }

    const nested = collectActiveAncestors(children, activeValue)
    if (nested.length > 0) {
      return isSection(node) ? nested : [node.value, ...nested]
    }
  }

  return []
}

function collectMarkedActiveAncestors(nodes: SidebarNode[] | undefined): string[] {
  if (!nodes) return []

  for (const node of nodes) {
    const children = isSection(node) ? node.items : node.children
    if (!children) continue

    if (children.some((item) => item.active)) {
      return isSection(node) ? [] : [node.value]
    }

    const nested = collectMarkedActiveAncestors(children)
    if (nested.length > 0) {
      return isSection(node) ? nested : [node.value, ...nested]
    }
  }

  return []
}

const activeAncestors = computed(() => {
  const byValue = collectActiveAncestors(props.items, props.activeValue)
  return byValue.length > 0 ? byValue : collectMarkedActiveAncestors(props.items)
})

const expandedValues = computed(() => {
  if (props.expanded !== undefined) return props.expanded
  return Array.from(new Set([...internalExpanded.value, ...activeAncestors.value]))
})

const cls = computed(() => [
  'sidebar',
  props.responsive ? 'sidebarResponsive' : undefined,
  isCollapsed.value ? 'sidebarCollapsed' : undefined,
  props.class,
].filter(Boolean).join(' '))

function toggle() {
  emit('update:collapsed', !props.collapsed)
}

function onDrawerClose() {
  emit('update:open', false)
}

function setExpanded(values: string[]) {
  const next = Array.from(new Set(values))
  if (props.expanded === undefined) {
    internalExpanded.value = next
  }
  emit('update:expanded', next)
}

function toggleExpanded(value: string) {
  const current = new Set(expandedValues.value)
  if (current.has(value)) current.delete(value)
  else current.add(value)
  setExpanded(Array.from(current))
}

function hasChildren(item: SidebarNavItem) {
  return Array.isArray(item.children) && item.children.length > 0
}

function onSelect(item: SidebarNavItem, event: MouseEvent | KeyboardEvent) {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  if (props.responsive && isTablet.value && !isMobile.value && isCollapsed.value && hasChildren(item)) {
    emit('update:open', true)
    return
  }

  emit('update:activeValue', item.value)
  emit('select', item, event)

  if (props.responsive && isMobile.value && props.open && !hasChildren(item)) {
    emit('update:open', false)
  }
}

function getFocusableItems(event: KeyboardEvent) {
  const root = (event.currentTarget as HTMLElement).closest('.sidebarNav')
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>('[data-sidebar-node]'))
    .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
}

function focusRelative(event: KeyboardEvent, offset: number) {
  const items = getFocusableItems(event)
  const current = event.target as HTMLElement
  const index = items.indexOf(current)
  if (index === -1 || items.length === 0) return
  const next = (index + offset + items.length) % items.length
  items[next]?.focus()
}

function focusFirst(event: KeyboardEvent) {
  getFocusableItems(event)[0]?.focus()
}

function focusLast(event: KeyboardEvent) {
  const items = getFocusableItems(event)
  items[items.length - 1]?.focus()
}

provide('sidebar-collapsed', isCollapsed)

/* ─── Auto-close Drawer when leaving mobile ─── */
watch(isMobile, (mobile) => {
  if (!mobile && props.open) {
    emit('update:open', false)
  }
})
</script>

<template>
  <aside :class="cls" :style="{ '--sidebar-width': currentWidth }">
    <div v-if="$slots.header" class="sidebarHeader">
      <slot name="header" :collapsed="isCollapsed" :toggle="toggle" />
    </div>

    <nav class="sidebarNav">
      <SidebarTree
        v-if="items"
        :items="items"
        :active-value="activeValue"
        :expanded-values="expandedValues"
        :collapsed="isCollapsed"
        :indent="indent"
        @toggle="toggleExpanded"
        @select="onSelect"
        @focus-next="focusRelative($event, 1)"
        @focus-previous="focusRelative($event, -1)"
        @focus-first="focusFirst"
        @focus-last="focusLast"
      />
      <slot v-else :collapsed="isCollapsed" :toggle="toggle" />
    </nav>

    <div v-if="$slots.footer" class="sidebarFooter">
      <slot name="footer" :collapsed="isCollapsed" :toggle="toggle" />
    </div>
  </aside>

  <Drawer
    v-if="responsive"
    :open="open"
    placement="left"
    size="280px"
    @close="onDrawerClose"
  >
    <nav class="sidebarNav drawerNav">
      <SidebarTree
        v-if="items"
        :items="items"
        :active-value="activeValue"
        :expanded-values="expandedValues"
        :collapsed="false"
        :indent="indent"
        @toggle="toggleExpanded"
        @select="onSelect"
        @focus-next="focusRelative($event, 1)"
        @focus-previous="focusRelative($event, -1)"
        @focus-first="focusFirst"
        @focus-last="focusLast"
      />
      <slot v-else :collapsed="false" :toggle="toggle" />
    </nav>
  </Drawer>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: var(--sidebar-width, 240px);
  background: var(--agala-sidebar-bg, hsl(var(--agala-card)));
  border-right: var(--agala-sidebar-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  overflow: hidden;
  flex-shrink: 0;
  transition: width var(--agala-transition-base);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  padding: var(--agala-sidebar-header-padding, 0 1rem);
  height: var(--agala-navbar-height, 3.5rem);
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
  flex-shrink: 0;
  overflow: hidden;
}

.sidebarNav {
  flex: 1;
  padding: var(--agala-sidebar-nav-padding, 0.5rem);
  overflow-y: auto;
  overflow-x: hidden;
}

.drawerNav {
  padding: 0.5rem;
}

.sidebarFooter {
  padding: var(--agala-sidebar-footer-padding, 0.75rem);
  border-top: var(--agala-sidebar-footer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  flex-shrink: 0;
  overflow: hidden;
}

/* Tablet: auto-collapse to 64px */
@media (max-width: 767px) {
  .sidebar.sidebarResponsive {
    width: 64px !important;
  }
}

/* Mobile: hide sidebar, Drawer takes over */
@media (max-width: 639px) {
  .sidebar.sidebarResponsive {
    display: none;
  }
}
</style>
