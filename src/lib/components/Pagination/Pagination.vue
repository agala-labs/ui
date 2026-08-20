<script setup lang="ts">
import { computed } from 'vue'
import {
  PaginationEllipsis,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationRoot,
} from 'reka-ui'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { PaginationProps } from './types'

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 10,
  siblingCount: 1,
  showEdges: true,
})
const emit = defineEmits<{ 'update:modelValue': [page: number] }>()
const { matches: isMobile } = useMediaQuery('(max-width: 639px)')
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const currentPage = computed(() => Math.min(Math.max(props.modelValue, 1), totalPages.value))

function goTo(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    emit('update:modelValue', page)
  }
}
</script>

<template>
  <PaginationRoot
    :page="currentPage"
    :total="total"
    :items-per-page="pageSize"
    :sibling-count="siblingCount"
    :show-edges="showEdges"
    :class="['pagination', props.class].filter(Boolean).join(' ')"
    aria-label="Pagination"
    @update:page="goTo"
  >
    <PaginationPrev class="pagination__arrow">
      <AgalaIcon
        name="chevron-left"
        size="sm"
      />
    </PaginationPrev>

    <template v-if="isMobile">
      <span
        class="pagination__status"
        aria-live="polite"
      >Page {{ currentPage }} of {{ totalPages }}</span>
    </template>
    <template v-else>
      <PaginationList
        v-slot="{ items }"
        as="div"
        class="pagination__list"
      >
        <template
          v-for="(item, index) in items"
          :key="`${item.type}-${'value' in item ? item.value : index}`"
        >
          <PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            class="pagination__page"
            :class="{ 'pagination__page--active': item.value === currentPage }"
          >
            {{ item.value }}
          </PaginationListItem>
          <PaginationEllipsis
            v-else
            class="pagination__page pagination__page--ellipsis"
          />
        </template>
      </PaginationList>
    </template>

    <PaginationNext class="pagination__arrow">
      <AgalaIcon
        name="chevron-right"
        size="sm"
      />
    </PaginationNext>
  </PaginationRoot>
</template>

<style scoped>
.pagination { display: inline-flex; align-items: center; gap: 0.25rem; }
.pagination__list { display: inline-flex; align-items: center; gap: 0.25rem; }
.pagination__page, .pagination__arrow { display: inline-flex; align-items: center; justify-content: center; height: 2rem; min-width: 2rem; padding: 0 0.375rem; border: 1px solid transparent; border-radius: var(--agala-radius-sm); background: transparent; color: hsl(var(--agala-foreground)); font-family: var(--agala-font-sans); font-size: 0.8125rem; font-weight: var(--agala-font-weight-medium); line-height: 1; cursor: pointer; transition: background var(--agala-transition-fast), color var(--agala-transition-fast), border-color var(--agala-transition-fast); }
.pagination__page:hover:not(:disabled):not(.pagination__page--active):not(.pagination__page--ellipsis):not([data-selected='true']) { background: hsl(var(--agala-accent)); }
.pagination__page--active, .pagination__page[data-selected='true'] { background: hsl(var(--agala-primary)); color: hsl(var(--agala-primary-foreground)); border-color: hsl(var(--agala-primary)); }
.pagination__page--ellipsis { cursor: default; color: hsl(var(--agala-muted-foreground)); padding: 0 0.25rem; }
.pagination__arrow { color: hsl(var(--agala-muted-foreground)); }
.pagination__arrow:hover:not(:disabled) { background: hsl(var(--agala-accent)); color: hsl(var(--agala-foreground)); }
.pagination__arrow:disabled, .pagination__page:disabled { opacity: 0.4; cursor: not-allowed; }
@media (max-width: 639px) {
  .pagination__page, .pagination__list { display: none; }
  .pagination__status { display: inline-flex; align-items: center; justify-content: center; min-width: 6rem; font-size: var(--agala-font-size-sm); font-weight: var(--agala-font-weight-medium); color: hsl(var(--agala-muted-foreground)); }
}
</style>
