<script setup lang="ts">
import { ref } from 'vue'
import {
  AgalaButton,
  AgalaDrawer,
  AgalaDropdownMenu,
  AgalaModal,
  AgalaTable,
} from '@ui'

const modalOpen = ref(false)
const drawerOpen = ref(false)
const activations = ref(0)

const columns = [
  { key: 'name', label: 'Member', minWidth: '10rem' },
  { key: 'role', label: 'Role', minWidth: '8rem' },
  { key: 'actions', label: '', width: '3rem', align: 'right' as const },
]
const rows = Array.from({ length: 7 }, (_, index) => ({
  id: String(index + 1),
  name: `Team member ${index + 1}`,
  role: index === 6 ? 'Final row' : 'Contributor',
}))
const items = [
  { label: 'Edit', icon: 'pencil' as const, onClick: () => activations.value++ },
  { separator: true },
  { label: 'Delete', icon: 'trash' as const, variant: 'danger' as const, onClick: () => activations.value++ },
]
</script>

<template>
  <div class="fixture">
    <p
      class="fixture__status"
      data-testid="dropdown-activations"
    >
      Activations: {{ activations }}
    </p>

    <div
      class="fixture__alignment"
      data-testid="dropdown-alignment"
    >
      <AgalaDropdownMenu
        placement="bottom-start"
        :items="items"
      >
        <template #trigger>
          <AgalaButton
            size="sm"
            variant="outline"
          >
            Start aligned
          </AgalaButton>
        </template>
      </AgalaDropdownMenu>
      <AgalaDropdownMenu
        placement="bottom-end"
        :items="items"
      >
        <template #trigger>
          <AgalaButton
            size="sm"
            variant="outline"
          >
            End aligned
          </AgalaButton>
        </template>
      </AgalaDropdownMenu>
    </div>

    <div
      class="fixture__hidden"
      data-testid="dropdown-hidden-container"
    >
      <AgalaDropdownMenu
        placement="bottom-start"
        :items="items"
      >
        <template #trigger>
          <AgalaButton size="sm">
            Overflow hidden
          </AgalaButton>
        </template>
      </AgalaDropdownMenu>
    </div>

    <div
      class="fixture__scroll"
      data-testid="dropdown-scroll-container"
    >
      <AgalaTable
        :columns="columns"
        :rows="rows"
        density="compact"
      >
        <template #cell-actions="{ row }">
          <AgalaDropdownMenu
            placement="bottom-end"
            :items="items"
          >
            <template #trigger>
              <AgalaButton
                size="icon"
                variant="ghost"
                :aria-label="`Actions for ${row.name}`"
              >
                •••
              </AgalaButton>
            </template>
          </AgalaDropdownMenu>
        </template>
      </AgalaTable>
    </div>

    <div class="fixture__overlay-actions">
      <AgalaButton
        variant="outline"
        @click="modalOpen = true"
      >
        Open dropdown modal
      </AgalaButton>
      <AgalaButton
        variant="outline"
        @click="drawerOpen = true"
      >
        Open dropdown drawer
      </AgalaButton>
    </div>

    <AgalaModal
      v-model:open="modalOpen"
      title="Dropdown modal"
    >
      <AgalaDropdownMenu
        placement="bottom-end"
        :items="items"
      >
        <template #trigger>
          <AgalaButton>Modal actions</AgalaButton>
        </template>
      </AgalaDropdownMenu>
    </AgalaModal>

    <AgalaDrawer
      :open="drawerOpen"
      title="Dropdown drawer"
      @close="drawerOpen = false"
    >
      <AgalaDropdownMenu
        placement="bottom-end"
        :items="items"
      >
        <template #trigger>
          <AgalaButton>Drawer actions</AgalaButton>
        </template>
      </AgalaDropdownMenu>
    </AgalaDrawer>
  </div>
</template>

<style scoped>
.fixture {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
}

.fixture__status {
  margin: 0;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
}

.fixture__alignment,
.fixture__overlay-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.fixture__hidden {
  width: 13rem;
  height: 3rem;
  padding: 0.5rem;
  overflow: hidden;
  border: var(--agala-border-width) dashed hsl(var(--agala-border));
  border-radius: var(--agala-radius);
}

.fixture__scroll {
  max-height: 11rem;
  overflow: auto;
  border-radius: var(--agala-radius);
}
</style>
