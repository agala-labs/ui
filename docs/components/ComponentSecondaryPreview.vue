<script setup lang="ts">
import { ref } from 'vue'
import { AgalaIcon, toastManager } from '@ui'
import type { FileItem } from '@ui'

defineProps<{
  slug: string
  example?: string
}>()

const text = ref('Too short')
const selectedMany = ref<string[]>(['ar', 'uy'])
const selectedSkills = ref<string[]>(['vue'])
const date = ref('2026-07-10')
const invalidColor = ref('#12')
const plan = ref('starter')
const files = ref<FileItem[]>([])
const density = ref('comfortable')
const overlayOpen = ref(false)
const page = ref(2)
const tab = ref('overview')
const calendarView = ref<'list'>('list')
const calendarDate = ref('2026-07-10')
const sidebarActive = ref('locations')
const sidebarExpanded = ref<string[]>(['settings'])
const removedTag = ref(false)

const options = [
  { value: 'ar', label: 'Argentina' },
  { value: 'uy', label: 'Uruguay' },
  { value: 'cl', label: 'Chile' },
]
const skills = [
  { value: 'vue', label: 'Vue' },
  { value: 'ts', label: 'TypeScript' },
]
const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
]
const densityOptions = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]
const commands = [
  { label: 'Duplicate' },
  { label: 'Archive', separator: true },
  { label: 'Delete', variant: 'danger' as const },
]
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
]
const columns = [
  { key: 'name', label: 'Member' },
  { key: 'role', label: 'Role' },
]
const sidebarItems = [{ label: 'Settings', items: [
  { value: 'general', label: 'General', icon: 'settings' as const },
  { value: 'settings', label: 'Operations', icon: 'grid' as const, children: [
    { value: 'locations', label: 'Locations' },
    { value: 'terminals', label: 'Terminals' },
  ] },
] }]
const events = [
  { id: '1', title: 'Inventory review', start: '2026-07-10T09:30:00', end: '2026-07-10T10:00:00', color: 'primary' },
  { id: '2', title: 'Supplier call', start: '2026-07-10T13:00:00', end: '2026-07-10T14:00:00', color: 'success' },
]
</script>

<template>
  <div class="secondary-preview">
    <AgalaInput
      v-if="slug === 'input'"
      v-model="text"
      error
      error-message="Enter a complete email address."
    />
    <AgalaFormField
      v-else-if="slug === 'form-field'"
      label="Workspace name"
      error="A workspace name is required."
      required
    >
      <AgalaInput model-value="" error />
    </AgalaFormField>
    <AgalaSelect
      v-else-if="slug === 'select'"
      v-model="selectedMany"
      :options="options"
      multiple
      searchable
    />
    <AgalaCreatableSelect
      v-else-if="slug === 'creatable-select'"
      v-model="selectedSkills"
      :options="skills"
      disabled
    />
    <AgalaDatePicker
      v-else-if="slug === 'date-picker'"
      v-model="date"
      inline
      :highlight-dates="['2026-07-14', '2026-07-18']"
    />
    <AgalaColorPicker
      v-else-if="slug === 'color-picker'"
      v-model="invalidColor"
      error
      error-message="Enter a six-digit hex color."
    />
    <div
      v-else-if="slug === 'checkbox'"
      class="preview-stack"
    >
      <AgalaCheckbox :model-value="false" indeterminate label="Some locations selected" />
      <AgalaCheckbox :model-value="false" disabled label="Managed by policy" />
    </div>
    <AgalaRadioGroup
      v-else-if="slug === 'radio-group'"
      v-model="plan"
      :options="plans"
    />
    <AgalaTextarea
      v-else-if="slug === 'textarea'"
      v-model="text"
      error
      error-message="Add at least 20 characters."
    />
    <AgalaMarkdownPreview
      v-else-if="slug === 'markdown-editor'"
      source="## Release notes\n\nInventory sync is complete."
    />
    <div
      v-else-if="slug === 'toggle'"
      class="preview-row"
    >
      <AgalaToggle :model-value="true" disabled />
      <span>Required by workspace policy</span>
    </div>
    <AgalaFileUpload
      v-else-if="slug === 'file-upload'"
      v-model="files"
      variant="inline"
      accept=".pdf"
      :max-files="1"
    />
    <AgalaSegmentedControl
      v-else-if="slug === 'segmented-control'"
      v-model="density"
      :options="densityOptions"
      size="sm"
      aria-label="Table density"
    />
    <AgalaAlert
      v-else-if="slug === 'alert'"
      variant="info"
      :icon="false"
    >
      Scheduled maintenance starts at 22:00.
    </AgalaAlert>
    <div
      v-else-if="slug === 'badge'"
      class="preview-row"
    >
      <AgalaBadge variant="secondary">
        12 items
      </AgalaBadge>
      <AgalaBadge variant="outline">
        Draft
      </AgalaBadge>
      <AgalaBadge class="badge-demo-small" size="sm">
        128
      </AgalaBadge>
      <AgalaBadge class="badge-demo-custom" color="rebeccapurple">
        Custom
      </AgalaBadge>
      <AgalaBadge class="badge-demo-long" color="hsl(196 70% 32%)">
        Local status with a longer label
      </AgalaBadge>
    </div>
    <template v-else-if="slug === 'drawer'">
      <AgalaButton @click="overlayOpen = true">
        Open quick search
      </AgalaButton>
      <AgalaDrawer
        :open="overlayOpen"
        placement="top"
        size="14rem"
        title="Quick search"
        @close="overlayOpen = false"
      >
        <AgalaInput autofocus icon-start="search" placeholder="Search inventory" />
      </AgalaDrawer>
    </template>
    <template v-else-if="slug === 'modal'">
      <AgalaButton @click="overlayOpen = true">
        Resolve conflict
      </AgalaButton>
      <AgalaModal
        v-model:open="overlayOpen"
        title="Resolve conflict"
        :dismissible="false"
        :escape-closes="false"
      >
        Choose which saved version should remain.
        <template #footer>
          <AgalaButton @click="overlayOpen = false">
            Keep current version
          </AgalaButton>
        </template>
      </AgalaModal>
    </template>
    <AgalaButton
      v-else-if="slug === 'toast'"
      @click="toastManager.show({ message: 'Draft archived', variant: 'warning', action: { label: 'Undo', onClick: () => undefined } })"
    >
      Archive draft
    </AgalaButton>
    <AgalaTooltip
      v-else-if="slug === 'tooltip'"
      content="Exports the current report"
      placement="bottom"
    >
      <AgalaButton variant="outline">
        Export
      </AgalaButton>
    </AgalaTooltip>
    <AgalaProgress
      v-else-if="slug === 'progress'"
      indeterminate
    />
    <div
      v-else-if="slug === 'skeleton'"
      class="loading-row"
      aria-busy="true"
    >
      <AgalaSkeleton variant="circle" width="2.5rem" height="2.5rem" />
      <div class="loading-copy">
        <AgalaSkeleton width="45%" />
        <AgalaSkeleton width="70%" />
      </div>
    </div>
    <AgalaEmptyState
      v-else-if="slug === 'empty-state'"
      size="compact"
      title="No matching records"
      description="Try changing or clearing the filters."
    >
      <template #action>
        <AgalaButton variant="ghost" size="sm">
          Clear filters
        </AgalaButton>
      </template>
    </AgalaEmptyState>
    <AgalaDevEnvBanner
      v-else-if="slug === 'dev-env-banner'"
      text="Staging environment — payments are simulated."
    />
    <AgalaAccordion
      v-else-if="slug === 'accordion'"
      multiple
    >
      <AgalaAccordionItem value="access" title="Access">
        <p>Workspace roles control what teammates can view and change.</p>
        <ul>
          <li>Invite members with the least privilege they need.</li>
          <li>Review access after role changes.</li>
        </ul>
      </AgalaAccordionItem>
      <AgalaAccordionItem value="billing" title="Billing" disabled>
        Billing is managed by the account owner.
      </AgalaAccordionItem>
      <AgalaAccordionItem value="retention" title="Data retention and operational audit history">
        <p>Audit history is retained according to the active workspace policy and legal requirements.</p>
      </AgalaAccordionItem>
    </AgalaAccordion>
    <AgalaDropdownMenu
      v-else-if="slug === 'dropdown-menu'"
      :items="commands"
    >
      <template #trigger>
        <AgalaButton variant="outline" icon="more-horizontal">
          Record actions
        </AgalaButton>
      </template>
    </AgalaDropdownMenu>
    <AgalaNavbar v-else-if="slug === 'navbar'">
      <template #brand>
        Inventory
      </template>
      <a href="#stock">Stock</a>
      <a href="#orders">Orders</a>
      <template #actions>
        <AgalaButton size="icon" aria-label="Notifications" icon="bell" />
      </template>
    </AgalaNavbar>
    <AgalaPagination
      v-else-if="slug === 'pagination'"
      v-model="page"
      :total="48"
      :page-size="10"
      :show-edges="false"
    />
    <div
      v-else-if="slug === 'sidebar'"
      class="sidebar-frame"
    >
      <AgalaSidebar
        v-model:active-value="sidebarActive"
        v-model:expanded="sidebarExpanded"
        :items="sidebarItems"
        indent="comfortable"
      />
    </div>
    <AgalaTable
      v-else-if="slug === 'table'"
      :columns="columns"
      :rows="[]"
      loading
      :loading-rows="3"
      empty-message="No matching members"
    />
    <AgalaTabs
      v-else-if="slug === 'tabs'"
      v-model="tab"
      :tabs="tabs"
      aria-label="Project sections"
    >
      <template #panel-overview>
        <p>Project overview</p>
      </template>
      <template #panel-activity>
        <p>Recent project activity</p>
      </template>
    </AgalaTabs>
    <div
      v-else-if="slug === 'calendar'"
      class="calendar-frame"
    >
      <AgalaCalendar
        v-model:view="calendarView"
        v-model:current-date="calendarDate"
        :events="events"
        :available-views="['list']"
      />
    </div>
    <AgalaListGroup
      v-else-if="slug === 'list-group'"
      variant="cards"
      gap="0.5rem"
    >
      <AgalaListGroupItem label="Main warehouse" subtitle="184 products" action-icon="chevron-right" />
      <AgalaListGroupItem label="Returns" subtitle="12 products" action-icon="chevron-right" />
    </AgalaListGroup>
    <div
      v-else-if="slug === 'avatar'"
      class="preview-row"
    >
      <AgalaAvatar fallback="AL" shape="circle" />
      <AgalaAvatar fallback="HQ" shape="square" />
    </div>
    <AgalaCard
      v-else-if="slug === 'card'"
      padding="lg"
    >
      <template #header>
        Clinic details
      </template>
      <p>Contact and scheduling information.</p>
    </AgalaCard>
    <div
      v-else-if="slug === 'center'"
      class="center-frame"
    >
      <AgalaCenter>
        <AgalaEmptyState size="compact" title="Nothing selected" />
      </AgalaCenter>
    </div>
    <AgalaHStack
      v-else-if="slug === 'divider'"
      class="divider-frame"
    >
      <span>List</span>
      <AgalaDivider orientation="vertical" />
      <span>Grid</span>
    </AgalaHStack>
    <AgalaVStack
      v-else-if="slug === 'stack'"
      gap="0.5rem"
    >
      <AgalaButton block>
        Continue
      </AgalaButton>
      <AgalaButton block variant="ghost">
        Cancel
      </AgalaButton>
    </AgalaVStack>
    <AgalaHStack
      v-else-if="slug === 'spacer'"
      gap="0.75rem"
    >
      <strong>Inventory sync</strong>
      <AgalaSpacer />
      <span class="muted-copy">Updated 2 min ago</span>
    </AgalaHStack>
    <template v-else-if="slug === 'stat'">
      <AgalaStat
        v-if="example === 'attention-row'"
        class="stat-attention-row"
        label="Needs attention"
        value="4"
        secondary-value="$280k at risk"
        layout="row"
        icon="alert-triangle"
        icon-bg="danger"
      />
      <div
        v-else
        class="stat-context-list"
      >
        <AgalaStat
          class="stat-inline-summary"
          label="Pending reviews"
          value="12"
          secondary-value="0 overdue"
          layout="inline"
          :bordered="false"
        />
        <AgalaStat
          class="stat-inline-long"
          label="Items awaiting an unusually long operational review label"
          value="3"
          :trend="0"
          trend-label="no change"
          layout="inline"
          :bordered="false"
        />
      </div>
    </template>
    <div
      v-else-if="slug === 'tag'"
      class="preview-stack"
    >
      <div class="preview-row">
        <AgalaTag
          v-if="!removedTag"
          label="Mar del Plata"
          removable
          @remove="removedTag = true"
        />
        <span class="tag-remove-status">{{ removedTag ? 'Location removed' : 'Selected location' }}</span>
      </div>
      <AgalaTag label="Managed" disabled />
      <AgalaTag color="hsl(196 70% 32%)">
        <span>Custom slotted label</span>
      </AgalaTag>
    </div>
    <div
      v-else-if="slug === 'icon'"
      class="preview-row"
    >
      <AgalaIcon name="settings" :size="16" />
      <AgalaIcon name="settings" :size="24" />
    </div>
  </div>
</template>

<style scoped>
.secondary-preview,
.preview-stack {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
}

.preview-row,
.loading-row,
.divider-frame {
  display: flex;
  min-width: 0;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.loading-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-frame,
.calendar-frame,
.center-frame {
  min-width: 0;
  overflow: hidden;
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: var(--agala-radius);
}

.sidebar-frame { height: 18rem; }
.calendar-frame { height: 26rem; }
.center-frame { height: 12rem; }
.divider-frame { height: 2.5rem; }
.muted-copy { color: hsl(var(--agala-muted-foreground)); }

.stat-context-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
}
</style>
