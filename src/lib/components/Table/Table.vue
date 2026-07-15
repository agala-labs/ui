<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Checkbox } from '../Checkbox'
import { AgalaIcon } from '../AgalaIcon'
import type { TableColumn, TableProps, SortDir, ColumnAlign } from './types'

const props = withDefaults(defineProps<TableProps>(), {
  selectable: false,
  loading: false,
  emptyMessage: 'No data available.',
  rowKey: 'id',
  variant: 'default',
  density: 'comfortable',
  stickyHeader: false,
  stickyFirstColumn: false,
  interactiveRows: false,
  loadingRows: 5,
})

const emit = defineEmits<{
  'update:selectedRows': [value: string[]]
  'update:sortKey': [value: string]
  'update:sortDir': [value: SortDir]
  'row-click': [row: Record<string, unknown>]
}>()

/* ─── Selection ─── */
const selectedSet = computed(() => new Set(props.selectedRows ?? []))

const allSelected = computed(() =>
  props.rows.length > 0 &&
  props.rows.every(r => selectedSet.value.has(String(r[props.rowKey])))
)

const someSelected = computed(() =>
  props.rows.some(r => selectedSet.value.has(String(r[props.rowKey]))) &&
  !allSelected.value
)

function toggleRow(key: string) {
  const current = [...(props.selectedRows ?? [])]
  const idx = current.indexOf(key)
  if (idx > -1) current.splice(idx, 1)
  else current.push(key)
  emit('update:selectedRows', current)
}

function toggleAll() {
  if (allSelected.value) {
    emit('update:selectedRows', [])
  } else {
    emit('update:selectedRows', props.rows.map(r => String(r[props.rowKey])))
  }
}

/* ─── Sort ─── */
function toggleSort(key: string) {
  if (props.sortKey === key) {
    emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortKey', key)
    emit('update:sortDir', 'asc')
  }
}

function sortIconName() {
  return props.sortDir === 'asc' ? 'arrow-up' as const : 'arrow-down' as const
}

function ariaSort(col: TableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined
  if (props.sortKey !== col.key) return 'none'
  return props.sortDir === 'desc' ? 'descending' : 'ascending'
}

/* ─── Alignment ─── */
const alignMap: Record<ColumnAlign, string> = {
  left:   'alignLeft',
  center: 'alignCenter',
  right:  'alignRight',
}

function thCls(col: TableColumn) {
  return ['th', col.align ? alignMap[col.align] : undefined].filter(Boolean).join(' ')
}

function tdCls(col: TableColumn) {
  return ['td', col.align ? alignMap[col.align] : undefined].filter(Boolean).join(' ')
}

function columnStyle(col: TableColumn): Record<string, string> | undefined {
  if (!col.width && !col.minWidth) return undefined
  return {
    ...(col.width ? { width: col.width } : {}),
    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
  }
}

function rowCls(row: Record<string, unknown>) {
  const key = String(row[props.rowKey])
  return [
    'tr',
    selectedSet.value.has(key) ? 'trSelected' : undefined,
    props.interactiveRows ? 'trInteractive' : undefined,
  ].filter(Boolean).join(' ')
}

function handleRowKeydown(event: KeyboardEvent, row: Record<string, unknown>) {
  if (!props.interactiveRows || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  emit('row-click', row)
}

const colSpan = computed(() => props.columns.length + (props.selectable ? 1 : 0))
const loadingRowCount = computed(() => Math.min(20, Math.max(0, Math.floor(props.loadingRows))))
const skeletonWidths = ['52%', '68%', '60%', '76%']

function skeletonWidth(rowIndex: number, columnIndex: number) {
  return skeletonWidths[(rowIndex + columnIndex) % skeletonWidths.length]
}

const wrapperRef = ref<HTMLDivElement | null>(null)
const canScrollStart = ref(false)
const canScrollEnd = ref(false)
let resizeObserver: ResizeObserver | undefined

function updateOverflow() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const tolerance = 2
  canScrollStart.value = wrapper.scrollLeft > tolerance
  canScrollEnd.value = wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth - tolerance
}

onMounted(() => {
  updateOverflow()
  if (typeof ResizeObserver !== 'undefined' && wrapperRef.value) {
    resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => resizeObserver?.disconnect())

watch(() => [props.columns, props.rows, props.loading], () => {
  nextTick(updateOverflow)
}, { deep: true })

const wrapperCls = computed(() => [
  'tableWrapper',
  props.variant === 'clean' ? 'tableClean' : undefined,
  props.variant === 'minimal' ? 'tableMinimal' : undefined,
  props.density === 'compact' ? 'tableCompact' : undefined,
  props.stickyHeader ? 'tableStickyHeader' : undefined,
  props.stickyFirstColumn ? 'tableStickyFirst' : undefined,
  props.selectable ? 'tableHasSelection' : undefined,
  canScrollStart.value ? 'canScrollStart' : undefined,
  canScrollEnd.value ? 'canScrollEnd' : undefined,
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div ref="wrapperRef" :class="wrapperCls" @scroll="updateOverflow">
    <table class="table">
      <thead class="thead">
        <tr class="trHead">
          <th v-if="selectable" class="th thCheck">
            <Checkbox
              :model-value="allSelected"
              :indeterminate="someSelected"
              label="Select all rows"
              @update:model-value="toggleAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="thCls(col)"
            :style="columnStyle(col)"
            :aria-sort="ariaSort(col)"
          >
            <button
              v-if="col.sortable"
              class="sortBtn"
              type="button"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span v-if="sortKey !== col.key" class="sortNeutral" aria-hidden="true">
                <AgalaIcon name="arrow-up" :size="9" />
                <AgalaIcon name="arrow-down" :size="9" />
              </span>
              <AgalaIcon v-else :name="sortIconName()" :size="12" class="sortIconActive" />
            </button>
            <span v-else>{{ col.label }}</span>
          </th>
        </tr>
      </thead>

      <tbody class="tbody">
        <!-- Loading skeleton rows -->
        <template v-if="loading">
          <tr v-for="i in loadingRowCount" :key="i" class="trLoading">
            <td v-if="selectable" class="td tdCheck">
              <span class="skeletonBox" style="width: 1rem; height: 1rem; border-radius: calc(var(--agala-radius) * 0.5);" />
            </td>
            <td
              v-for="(col, columnIndex) in columns"
              :key="col.key"
              class="td"
              :style="columnStyle(col)"
            >
              <span class="skeletonLine" :style="{ width: skeletonWidth(i, columnIndex) }" />
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="rows.length === 0">
          <td :colspan="colSpan" class="td tdEmpty">
            <slot name="empty">{{ emptyMessage }}</slot>
          </td>
        </tr>

        <!-- Data rows -->
        <template v-else>
          <tr
            v-for="row in rows"
            :key="String(row[rowKey])"
            :class="rowCls(row)"
            :tabindex="interactiveRows ? 0 : undefined"
            :aria-selected="selectable ? selectedSet.has(String(row[rowKey])) : undefined"
            @click="emit('row-click', row)"
            @keydown="handleRowKeydown($event, row)"
          >
            <td v-if="selectable" class="td tdCheck" @click.stop>
              <Checkbox
                :model-value="selectedSet.has(String(row[rowKey]))"
                :label="`Select row ${String(row[rowKey])}`"
                @update:model-value="toggleRow(String(row[rowKey]))"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :class="tdCls(col)"
              :style="columnStyle(col)"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="$slots.footer" class="tableFooter">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.tableWrapper {
  width: 100%;
  overflow-x: auto;
  border: var(--agala-table-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  border-radius: var(--agala-table-radius, var(--agala-radius));
  background: hsl(var(--agala-card));
  scrollbar-gutter: stable;
  transition: box-shadow var(--agala-transition-fast);
}

.tableWrapper.canScrollStart.canScrollEnd {
  box-shadow:
    inset 0.75rem 0 0.75rem -0.75rem hsl(var(--agala-foreground) / 0.24),
    inset -0.75rem 0 0.75rem -0.75rem hsl(var(--agala-foreground) / 0.24);
}

.tableWrapper.canScrollStart:not(.canScrollEnd) {
  box-shadow: inset 0.75rem 0 0.75rem -0.75rem hsl(var(--agala-foreground) / 0.24);
}

.tableWrapper.canScrollEnd:not(.canScrollStart) {
  box-shadow: inset -0.75rem 0 0.75rem -0.75rem hsl(var(--agala-foreground) / 0.24);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
}

/* Head */
.thead {
  background: var(--agala-table-header-bg, hsl(var(--agala-muted) / 0.5));
}

.trHead {
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.th {
  padding: var(--agala-table-header-cell-padding, 0.625rem 1rem);
  text-align: left;
  font-size: var(--agala-table-header-font-size, var(--agala-font-size-sm));
  font-weight: var(--agala-table-header-weight, var(--agala-font-weight-semibold));
  color: var(--agala-table-header-color, hsl(var(--agala-muted-foreground)));
  white-space: nowrap;
}

.thCheck {
  width: 2.5rem;
  min-width: 2.5rem;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 0.5rem;
}

.thCheck :deep(.checkboxLabel),
.tdCheck :deep(.checkboxLabel) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Sort button */
.sortBtn {
  display: inline-flex;
  min-height: 1.75rem;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 0.125rem 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.sortBtn:hover {
  color: hsl(var(--agala-foreground));
}

.sortBtn:focus-visible {
  outline: none;
  border-radius: var(--agala-radius-sm);
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}

.sortNeutral {
  display: inline-grid;
  grid-template-rows: repeat(2, 0.35rem);
  align-items: center;
  color: hsl(var(--agala-muted-foreground) / 0.55);
}

.sortNeutral :deep(svg) {
  display: block;
}

.sortIconActive {
  opacity: 1;
  color: hsl(var(--agala-primary));
}

/* Body */
.tr {
  border-bottom: var(--agala-table-row-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  transition: background-color var(--agala-transition-fast);
  cursor: default;
}

.tr:last-child {
  border-bottom: none;
}

.tr:hover,
.trSelected {
  background: var(--agala-table-row-hover-bg, hsl(var(--agala-accent) / 0.5));
}

.trInteractive {
  cursor: pointer;
}

.trInteractive:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px hsl(var(--agala-ring));
}

.td {
  padding: var(--agala-table-cell-padding, 0.75rem 1rem);
  font-size: var(--agala-table-cell-size, var(--agala-font-size-base));
  color: var(--agala-table-cell-color, hsl(var(--agala-foreground)));
  line-height: var(--agala-table-cell-line-height, var(--agala-line-height-normal));
  vertical-align: middle;
}

.tdCheck {
  width: 2.5rem;
  min-width: 2.5rem;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 0.5rem;
}

.tdEmpty {
  text-align: center;
  color: var(--agala-table-empty-color, hsl(var(--agala-muted-foreground)));
  padding: var(--agala-table-empty-padding, 3rem 1rem);
}

/* Alignment */
.alignLeft   { text-align: left; }
.alignCenter { text-align: center; }
.alignRight  { text-align: right; }

/* Loading skeleton */
.trLoading {
  border-bottom: var(--agala-border-width) solid hsl(var(--agala-border));
}

.skeletonLine,
.skeletonBox {
  display: inline-block;
  height: 0.875rem;
  background: linear-gradient(
    90deg,
    hsl(var(--agala-muted)) 25%,
    hsl(var(--agala-border)) 50%,
    hsl(var(--agala-muted)) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--agala-radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeletonLine { width: 60%; }

.tableCompact .th {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}

.tableCompact .td {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: var(--agala-font-size-sm);
}

.tableCompact .tdEmpty {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.tableStickyHeader .th {
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--agala-table-header-bg, hsl(var(--agala-muted)));
}

.tableStickyFirst .th:first-child,
.tableStickyFirst .td:first-child {
  position: sticky;
  left: 0;
  z-index: 3;
  background: hsl(var(--agala-card));
}

.tableStickyFirst .th:first-child {
  z-index: 6;
  background: var(--agala-table-header-bg, hsl(var(--agala-muted)));
}

.tableStickyFirst.tableHasSelection .th:nth-child(2),
.tableStickyFirst.tableHasSelection .td:nth-child(2) {
  position: sticky;
  left: 2.5rem;
  z-index: 3;
  background: hsl(var(--agala-card));
  box-shadow: 1px 0 hsl(var(--agala-border));
}

.tableStickyFirst.tableHasSelection .th:nth-child(2) {
  z-index: 6;
  background: var(--agala-table-header-bg, hsl(var(--agala-muted)));
}

.tableStickyFirst .trSelected .td:first-child,
.tableStickyFirst.tableHasSelection .trSelected .td:nth-child(2) {
  background: hsl(var(--agala-accent));
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Clean variant */
.tableClean {
  border: none;
  border-radius: 0;
}
.tableClean :deep(.thead) {
  background: transparent;
}
.tableClean :deep(.th) {
  padding: 0.5rem 1rem;
}
.tableClean :deep(.tr) {
  border-bottom: 1px solid hsl(var(--agala-border));
}
.tableClean :deep(.td) {
  padding: 0.5rem 1rem;
}

/* Minimal variant */
.tableMinimal {
  border: none;
}
.tableMinimal :deep(.tr) {
  border-bottom: none;
}
.tableMinimal :deep(.tr:hover) {
  background: hsl(var(--agala-accent));
}

/* Footer (pagination) */
.tableFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: var(--agala-table-footer-padding, 0.75rem 1rem);
  border-top: var(--agala-table-footer-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  background: var(--agala-table-footer-bg, hsl(var(--agala-muted) / 0.3));
  flex-wrap: wrap;
  min-width: max-content;
}

@media (prefers-reduced-motion: reduce) {
  .tableWrapper,
  .tr,
  .skeletonLine,
  .skeletonBox {
    transition: none;
    animation: none;
  }
}
</style>
