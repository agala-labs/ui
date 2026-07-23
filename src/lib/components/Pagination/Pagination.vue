<script setup lang="ts">
import { computed } from 'vue'
import AgalaIcon from '../AgalaIcon/AgalaIcon.vue'
import { useMediaQuery } from '../../composables/useMediaQuery'
import type { PaginationProps } from './types'

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 10,
  siblingCount: 1,
  showEdges: true,
})

const emit = defineEmits<{
  'update:modelValue': [page: number]
}>()

const { matches: isMobile } = useMediaQuery('(max-width: 639px)')

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const currentPage = computed(() => Math.min(props.modelValue, totalPages.value))

function goTo(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    emit('update:modelValue', page)
  }
}

const pages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const sibling = props.siblingCount
  const showEdges = props.showEdges

  const range: (number | 'ellipsis')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
    return range
  }

  const leftSibling = Math.max(current - sibling, 1)
  const rightSibling = Math.min(current + sibling, total)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1

  if (showEdges) range.push(1)
  if (showLeftEllipsis) {
    if (!showEdges || leftSibling > 3) range.push('ellipsis')
    else if (showEdges) range.push(2)
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (showEdges && i === 1) continue
    if (showEdges && i === total) continue
    range.push(i)
  }

  if (showRightEllipsis) {
    if (!showEdges || rightSibling < total - 2) range.push('ellipsis')
    else if (showEdges) range.push(total - 1)
  }
  if (showEdges) range.push(total)

  return range
})
</script>

<template>
  <nav class="pagination" role="navigation" aria-label="Pagination">
    <button
      type="button"
      class="pagination__arrow"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="goTo(currentPage - 1)"
    >
      <AgalaIcon name="chevron-left" size="sm" />
    </button>

    <template v-if="isMobile">
      <span class="pagination__status" aria-live="polite">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
    </template>
    <template v-else>
      <button
        v-for="(page, idx) in pages"
        :key="`${page}-${idx}`"
        type="button"
        class="pagination__page"
        :class="{ 'pagination__page--active': page === currentPage, 'pagination__page--ellipsis': page === 'ellipsis' }"
        :disabled="page === 'ellipsis'"
        :aria-current="page === currentPage ? 'page' : undefined"
        :aria-label="page === 'ellipsis' ? undefined : `Page ${page}`"
        @click="page !== 'ellipsis' && goTo(page as number)"
      >
        <span v-if="page === 'ellipsis'">…</span>
        <span v-else>{{ page }}</span>
      </button>
    </template>

    <button
      type="button"
      class="pagination__arrow"
      :disabled="currentPage >= totalPages"
      aria-label="Next page"
      @click="goTo(currentPage + 1)"
    >
      <AgalaIcon name="chevron-right" size="sm" />
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination__page,
.pagination__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.375rem;
  border: 1px solid transparent;
  border-radius: var(--agala-radius-sm);
  background: transparent;
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: 0.8125rem;
  font-weight: var(--agala-font-weight-medium);
  line-height: 1;
  cursor: pointer;
  transition: background var(--agala-transition-fast), color var(--agala-transition-fast), border-color var(--agala-transition-fast);
}

.pagination__page:hover:not(:disabled):not(.pagination__page--active):not(.pagination__page--ellipsis) {
  background: hsl(var(--agala-accent));
}

.pagination__page--active {
  background: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
  border-color: hsl(var(--agala-primary));
}

.pagination__page--ellipsis {
  cursor: default;
  color: hsl(var(--agala-muted-foreground));
  padding: 0 0.25rem;
}

.pagination__arrow {
  color: hsl(var(--agala-muted-foreground));
}

.pagination__arrow:hover:not(:disabled) {
  background: hsl(var(--agala-accent));
  color: hsl(var(--agala-foreground));
}

.pagination__arrow:disabled,
.pagination__page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 639px) {
  .pagination__page {
    display: none;
  }

  .pagination__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 6rem;
    font-size: var(--agala-font-size-sm);
    font-weight: var(--agala-font-weight-medium);
    color: hsl(var(--agala-muted-foreground));
  }
}
</style>
