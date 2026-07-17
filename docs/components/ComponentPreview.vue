<script setup lang="ts">
import { ref } from 'vue'
import { AgalaIcon, toastManager } from '@ui'
import type { FileItem } from '@ui'
import DropdownOverlayFixture from './DropdownOverlayFixture.vue'

defineProps<{ slug: string }>()

const text = ref('')
const checked = ref(true)
const toggle = ref(true)
const choice = ref('pro')
const segmentView = ref('board:active')
const date = ref('2026-07-10')
const color = ref('#4f46e5')
const selected = ref('ar')
const selectedMany = ref<string[]>(['vue'])
const page = ref(3)
const tab = ref('overview')
const selectedTableRows = ref<string[]>(['1'])
const tableSortKey = ref('name')
const tableSortDir = ref<'asc' | 'desc'>('asc')
const modalOpen = ref(false)
const drawerOpen = ref(false)
const markdown = ref('Build interfaces with **semantic tokens** and accessible Vue components.')
const files = ref<FileItem[]>([])
const calendarView = ref<'month' | 'week' | 'day' | 'list'>('day')
const calendarDate = ref('2026-07-10')
const sidebarActive = ref('overview')
const sidebarExpanded = ref<string[]>(['workspace'])
const alertRetryCount = ref(0)
const listActivations = ref(0)

const options = [
  { value: 'ar', label: 'Argentina', subtitle: 'South America' },
  { value: 'uy', label: 'Uruguay', subtitle: 'South America' },
  { value: 'cl', label: 'Chile', subtitle: 'South America' },
]
const skills = [
  { value: 'vue', label: 'Vue' }, { value: 'ts', label: 'TypeScript' }, { value: 'go', label: 'Go' },
]
const radioOptions = [
  { value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Professional' }, { value: 'enterprise', label: 'Enterprise' },
]
const segmentOptions = [
  { value: 'board:active', label: 'Board', icon: 'grid' as const },
  { value: 'timeline', label: 'Timeline', icon: 'clock' as const, disabled: true },
  { value: 'list', label: 'List', icon: 'list' as const },
]
const tableColumns = [
  { key: 'name', label: 'Member', sortable: true, minWidth: '9rem' },
  { key: 'role', label: 'Role', minWidth: '7.5rem' },
  { key: 'status', label: 'Status', minWidth: '6rem' },
]
const tableRows = [
  { id: '1', name: 'Ada Lovelace', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Grace Hopper', role: 'Maintainer', status: 'Active' },
  { id: '3', name: 'Edsger Dijkstra', role: 'Reviewer', status: 'Invited' },
]
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'milestones', label: 'Milestones' },
  { value: 'settings', label: 'Settings', disabled: true },
]
const sideItems = [{ label: 'Workspace', items: [
  { value: 'overview', label: 'Overview', icon: 'home' as const },
  { value: 'workspace', label: 'Projects', icon: 'grid' as const, children: [
    { value: 'active', label: 'Active projects' }, { value: 'archive', label: 'Archive' },
  ] },
] }]
const events = [
  { id: '1', title: 'Design review', subtitle: 'Checkout handoff', start: '2026-07-10T10:00:00', end: '2026-07-10T11:00:00', color: 'primary' },
  { id: '2', title: 'Release readiness', subtitle: 'API and web', start: '2026-07-10T10:30:00', end: '2026-07-10T12:00:00', color: 'success' },
  { id: '3', title: 'Team planning', start: '2026-07-10T14:00:00', end: '2026-07-10T14:30:00', color: 'warning' },
  { id: '4', title: 'Launch window', start: '2026-07-10T00:00:00', end: '2026-07-10T23:59:00', allDay: true, color: 'secondary' },
]
</script>

<template>
  <div class="preview-stack">
    <template v-if="slug === 'button'">
      <div class="preview-row">
        <AgalaButton icon="plus">
          Create project
        </AgalaButton><AgalaButton variant="secondary">
          Secondary
        </AgalaButton><AgalaButton variant="outline">
          Outline
        </AgalaButton><AgalaButton variant="danger">
          Delete
        </AgalaButton>
      </div>
    </template>
    <AgalaInput
      v-else-if="slug === 'input'"
      v-model="text"
      icon-start="mail"
      placeholder="you@example.com"
    />
    <AgalaFormField
      v-else-if="slug === 'form-field'"
      label="Workspace name"
      helper="Visible to everyone in your organization."
      html-for="workspace-name"
      required
    >
      <AgalaInput
        id="workspace-name"
        v-model="text"
        placeholder="Acme"
      />
    </AgalaFormField>
    <AgalaSelect
      v-else-if="slug === 'select'"
      v-model="selected"
      :options="options"
      searchable
      clearable
    />
    <AgalaCreatableSelect
      v-else-if="slug === 'creatable-select'"
      v-model="selectedMany"
      :options="skills"
      creatable
    />
    <AgalaDatePicker
      v-else-if="slug === 'date-picker'"
      v-model="date"
      clearable
    />
    <AgalaColorPicker
      v-else-if="slug === 'color-picker'"
      v-model="color"
      clearable
    />
    <AgalaCheckbox
      v-else-if="slug === 'checkbox'"
      v-model="checked"
      label="Accept the terms"
    />
    <AgalaRadioGroup
      v-else-if="slug === 'radio-group'"
      v-model="choice"
      :options="radioOptions"
      orientation="horizontal"
    />
    <AgalaTextarea
      v-else-if="slug === 'textarea'"
      v-model="text"
      :rows="4"
      placeholder="Add an internal note"
    />
    <AgalaMarkdownEditor
      v-else-if="slug === 'markdown-editor'"
      v-model="markdown"
      preview="split"
    />
    <div
      v-else-if="slug === 'toggle'"
      class="preview-row"
    >
      <AgalaToggle v-model="toggle" /><span>Email notifications {{ toggle ? 'enabled' : 'disabled' }}</span>
    </div>
    <AgalaFileUpload
      v-else-if="slug === 'file-upload'"
      v-model="files"
      accept="image/*"
      multiple
      :max-files="4"
    />
    <AgalaSegmentedControl
      v-else-if="slug === 'segmented-control'"
      v-model="segmentView"
      :options="segmentOptions"
      aria-label="View mode"
      block
    >
      <template #option-list>
        <span class="segment-label">List <span class="segment-count">12</span></span>
      </template>
    </AgalaSegmentedControl>
    <div
      v-else-if="slug === 'alert'"
      class="preview-stack"
    >
      <AgalaAlert
        variant="info"
        title="Sync paused"
      >
        Reconnect the warehouse before accepting new orders.
      </AgalaAlert><AgalaAlert
        class="alert-action-demo"
        variant="danger"
        title="Could not load inventory"
        dismissible
      >
        Check the connection and try again.
        <template #action>
          <AgalaButton
            variant="outline"
            size="sm"
            @click="alertRetryCount++"
          >
            Retry<span v-if="alertRetryCount"> ({{ alertRetryCount }})</span>
          </AgalaButton>
        </template>
      </AgalaAlert><AgalaAlert
        class="alert-flat-action-demo"
        variant="warning"
        flat
      >
        Export is taking longer than expected.
        <template #action>
          <AgalaButton
            variant="ghost"
            size="sm"
          >
            View activity
          </AgalaButton>
        </template>
      </AgalaAlert>
    </div>
    <div
      v-else-if="slug === 'badge'"
      class="preview-row"
    >
      <AgalaBadge
        variant="success"
        dot
      >
        Active
      </AgalaBadge><AgalaBadge variant="warning">
        Pending
      </AgalaBadge><AgalaBadge variant="danger">
        Failed
      </AgalaBadge>
    </div>
    <template v-else-if="slug === 'drawer'">
      <AgalaButton @click="drawerOpen = true">
        Open filters
      </AgalaButton><AgalaDrawer
        :open="drawerOpen"
        title="Filters"
        @close="drawerOpen = false"
      >
        <AgalaFormField label="Country">
          <AgalaSelect
            v-model="selected"
            :options="options"
          />
        </AgalaFormField>
        <AgalaFormField
          label="Search inventory"
          helper="Search by SKU, product, or warehouse."
        >
          <AgalaInput placeholder="Start typing…" />
        </AgalaFormField>
        <template #footer="{ close }">
          <AgalaButton
            variant="ghost"
            @click="close"
          >
            Cancel
          </AgalaButton>
          <AgalaButton @click="drawerOpen = false">
            Apply filters
          </AgalaButton>
        </template>
      </AgalaDrawer>
    </template>
    <template v-else-if="slug === 'modal'">
      <AgalaButton @click="modalOpen = true">
        Open modal
      </AgalaButton><AgalaModal
        v-model:open="modalOpen"
        title="Archive record"
      >
        <p>This record will move to the archive.</p><template #footer>
          <AgalaButton
            variant="ghost"
            @click="modalOpen = false"
          >
            Cancel
          </AgalaButton><AgalaButton
            variant="danger"
            @click="modalOpen = false"
          >
            Archive
          </AgalaButton>
        </template>
      </AgalaModal>
    </template>
    <AgalaButton
      v-else-if="slug === 'toast'"
      @click="toastManager.show({ message: 'Changes saved', variant: 'success' })"
    >
      Show toast
    </AgalaButton>
    <AgalaTooltip
      v-else-if="slug === 'tooltip'"
      content="Copies a link to this page"
    >
      <AgalaButton
        variant="outline"
        icon="link"
      >
        Copy link
      </AgalaButton>
    </AgalaTooltip>
    <div
      v-else-if="slug === 'progress'"
      class="preview-stack"
    >
      <AgalaProgress :value="72" /><div class="preview-row">
        <AgalaProgress
          variant="circular"
          :value="72"
          color="success"
        /><AgalaProgress
          variant="circular"
          indeterminate
        />
      </div>
    </div>
    <div
      v-else-if="slug === 'skeleton'"
      class="preview-stack"
      aria-busy="true"
    >
      <div class="preview-row">
        <AgalaSkeleton
          variant="circle"
          width="3rem"
          height="3rem"
        /><div class="preview-grow">
          <AgalaSkeleton width="45%" /><AgalaSkeleton width="80%" />
        </div>
      </div><AgalaSkeleton
        variant="rect"
        width="100%"
        height="7rem"
      />
    </div>
    <div
      v-else-if="slug === 'empty-state'"
      class="agala-doc-grid"
    >
      <AgalaEmptyState
        class="empty-demo-default"
        title="No projects"
        description="Create your first project to start organizing work."
      >
        <template #icon>
          <AgalaIcon
            name="inbox"
            :size="40"
          />
        </template>
        <template #action>
          <AgalaButton icon="plus">
            Create project
          </AgalaButton>
        </template>
      </AgalaEmptyState><AgalaEmptyState
        class="empty-demo-compact"
        size="compact"
        title="No matching records"
        description="No results match this unusually-specific-operational-filter-value-that-must-wrap-inside-a-narrow-panel."
      >
        <template #icon>
          <AgalaIcon
            name="search"
            :size="28"
          />
        </template>
        <template #action>
          <AgalaButton
            variant="ghost"
            size="sm"
          >
            Clear filters
          </AgalaButton>
        </template>
      </AgalaEmptyState>
    </div>
    <AgalaDevEnvBanner
      v-else-if="slug === 'dev-env-banner'"
      text="Preview environment — data resets daily."
    />
    <AgalaAccordion v-else-if="slug === 'accordion'">
      <AgalaAccordionItem
        value="install"
        title="Installation"
      >
        Install the package and import its styles.
      </AgalaAccordionItem><AgalaAccordionItem
        value="themes"
        title="Themes"
      >
        Override semantic HSL tokens at the root.
      </AgalaAccordionItem>
    </AgalaAccordion>
    <DropdownOverlayFixture
      v-else-if="slug === 'dropdown-menu'"
    />
    <AgalaNavbar v-else-if="slug === 'navbar'">
      <template #brand>
        <strong>Agala</strong>
      </template><a href="#example">Projects</a><a href="#api">Team</a><template #actions>
        <AgalaButton size="sm">
          New project
        </AgalaButton>
      </template>
    </AgalaNavbar>
    <AgalaPagination
      v-else-if="slug === 'pagination'"
      v-model="page"
      :total="240"
      :page-size="20"
      show-edges
    />
    <div
      v-else-if="slug === 'sidebar'"
      class="sidebar-demo"
    >
      <AgalaSidebar
        v-model:active-value="sidebarActive"
        v-model:expanded="sidebarExpanded"
        :items="sideItems"
      />
    </div>
    <AgalaTable
      v-else-if="slug === 'table'"
      v-model:selected-rows="selectedTableRows"
      v-model:sort-key="tableSortKey"
      v-model:sort-dir="tableSortDir"
      :columns="tableColumns"
      :rows="tableRows"
      row-key="id"
      selectable
      interactive-rows
      sticky-first-column
    >
      <template #cell-status="{ value }">
        <AgalaBadge :variant="value === 'Active' ? 'success' : 'warning'">
          {{ value }}
        </AgalaBadge>
      </template>
    </AgalaTable>
    <AgalaTabs
      v-else-if="slug === 'tabs'"
      v-model="tab"
      :tabs="tabs"
      variant="pills"
    >
      <template #tab-activity>
        <span class="tab-label">Activity <span class="tab-count">12</span></span>
      </template>
      <template #panel-overview>
        <p>Project health and recent milestones.</p>
      </template><template #panel-activity>
        <p>Recent workspace activity.</p>
      </template><template #panel-milestones>
        <p>Delivery milestones and upcoming release gates.</p>
      </template>
    </AgalaTabs>
    <div
      v-else-if="slug === 'calendar'"
      class="calendar-demo"
    >
      <AgalaCalendar
        v-model:view="calendarView"
        v-model:current-date="calendarDate"
        :events="events"
        day-start="09:00"
        day-end="18:00"
      />
    </div>
    <div
      v-else-if="slug === 'list-group'"
      class="preview-stack"
    >
      <p
        class="interaction-status"
        aria-live="polite"
      >
        Activations: {{ listActivations }}
      </p>
      <AgalaListGroup>
        <AgalaListGroupItem
          class="list-demo-default"
          label="Default queue"
          badge="8"
          @click="listActivations++"
        /><AgalaListGroupItem
          class="list-demo-primary"
          label="In progress"
          badge="12"
          badge-variant="primary"
        /><AgalaListGroupItem
          class="list-demo-success"
          label="Completed"
          badge="24"
          badge-variant="success"
        /><AgalaListGroupItem
          class="list-demo-warning"
          label="Needs review"
          badge="3"
          badge-variant="warning"
        /><AgalaListGroupItem
          class="list-demo-danger"
          label="Failed"
          badge="2"
          badge-variant="danger"
        /><AgalaListGroupItem
          class="list-demo-custom-badge"
          label="Custom badge slot"
          badge="ignored"
        >
          <template #badge>
            <span class="custom-list-badge">Custom</span>
          </template>
        </AgalaListGroupItem><AgalaListGroupItem
          class="list-demo-custom-trailing"
          label="Custom trailing slot"
          badge="ignored"
        >
          <template #trailing>
            <span class="custom-list-trailing">Details</span>
          </template>
        </AgalaListGroupItem><AgalaListGroupItem
          class="list-demo-disabled"
          label="Disabled queue"
          badge="1"
          disabled
          @click="listActivations++"
        />
      </AgalaListGroup>
    </div>
    <div
      v-else-if="slug === 'avatar'"
      class="preview-row"
    >
      <AgalaAvatar
        fallback="AG"
        size="xs"
      /><AgalaAvatar
        fallback="AG"
        size="md"
      /><AgalaAvatar
        fallback="AG"
        size="xl"
        shape="rounded"
      />
    </div>
    <AgalaCard
      v-else-if="slug === 'card'"
      class="card-demo"
      accent="top"
    >
      <template #header>
        <div class="card-demo__header">
          <span>Warehouse sync</span><AgalaBadge
            variant="success"
            dot
          >
            Connected
          </AgalaBadge>
        </div>
      </template><p class="card-demo__body">
        Last completed today at 14:32. All 184 catalog items are up to date.
      </p><template #footer>
        <AgalaButton variant="link">
          View sync log
        </AgalaButton>
      </template>
    </AgalaCard>
    <div
      v-else-if="slug === 'center'"
      class="center-demo"
    >
      <AgalaCenter>
        <AgalaBadge variant="success">
          Centered content
        </AgalaBadge>
      </AgalaCenter>
    </div>
    <div
      v-else-if="slug === 'divider'"
      class="preview-stack"
    >
      <span>Primary content</span><AgalaDivider label="Or continue with" /><span>Alternative content</span>
    </div>
    <AgalaHStack
      v-else-if="slug === 'stack'"
      gap="0.75rem"
      wrap
    >
      <AgalaButton>Save changes</AgalaButton><AgalaButton variant="outline">
        Preview
      </AgalaButton><AgalaButton variant="ghost">
        Cancel
      </AgalaButton>
    </AgalaHStack>
    <AgalaHStack
      v-else-if="slug === 'spacer'"
      gap="1rem"
    >
      <strong>Workspace</strong><AgalaSpacer /><AgalaButton
        size="sm"
        variant="outline"
      >
        Settings
      </AgalaButton>
    </AgalaHStack>
    <div
      v-else-if="slug === 'stat'"
      class="agala-doc-grid"
    >
      <AgalaStat
        label="Monthly revenue"
        value="$24,800"
        :trend="12.4"
        trend-label="vs last month"
        icon="trending-up"
        bordered
      /><AgalaStat
        class="stat-secondary-row"
        label="Require action"
        value="4"
        secondary-value="$280,000"
        layout="row"
        icon="alert-triangle"
        icon-bg="danger"
        bordered
      /><AgalaStat
        class="stat-secondary-inline-zero"
        label="Pending"
        value="12"
        :secondary-value="0"
        layout="inline"
        bordered
      /><AgalaStat
        class="stat-secondary-with-trend"
        label="Active members"
        value="1,284"
        secondary-value="Across 18 teams"
        :trend="-2.1"
        trend-label="vs last month"
        icon="users"
        bordered
      /><AgalaStat
        class="stat-secondary-empty"
        label="Empty supporting value"
        value="0"
        secondary-value=""
        bordered
      />
    </div>
    <div
      v-else-if="slug === 'tag'"
      class="preview-row"
    >
      <AgalaTag
        label="Vue"
        variant="success"
        removable
      /><AgalaTag
        label="TypeScript"
        variant="primary"
      /><AgalaTag
        label="Needs review"
        variant="warning"
      />
    </div>
    <div
      v-else-if="slug === 'icon'"
      class="icon-grid"
    >
      <span
        v-for="icon in ['home', 'calendar', 'users', 'chart-bar', 'settings', 'bell']"
        :key="icon"
      ><AgalaIcon :name="icon" />{{ icon }}</span>
    </div>
  </div>
</template>

<style scoped>
.preview-stack { display: flex; flex-direction: column; gap: 1rem; }
.preview-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
.preview-grow { display: flex; flex: 1; flex-direction: column; gap: 0.6rem; }
.sidebar-demo { height: 20rem; overflow: hidden; border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius); }
.calendar-demo { min-width: 0; height: 32rem; overflow: hidden; }
.tab-label { display: inline-flex; align-items: center; gap: 0.4rem; }
.tab-count { display: inline-flex; min-width: 1.25rem; height: 1.25rem; align-items: center; justify-content: center; border-radius: 999px; background: hsl(var(--agala-primary) / 0.12); color: hsl(var(--agala-primary)); font-size: 0.6875rem; font-weight: var(--agala-font-weight-semibold); }
.segment-label { display: inline-flex; min-width: 0; align-items: center; gap: 0.3rem; }
.segment-count { display: inline-flex; min-width: 1.15rem; height: 1.15rem; align-items: center; justify-content: center; border-radius: 999px; background: hsl(var(--agala-primary) / 0.12); color: hsl(var(--agala-primary)); font-size: 0.625rem; font-weight: var(--agala-font-weight-semibold); }
.center-demo { height: 10rem; border: 1px dashed hsl(var(--agala-border)); }
.icon-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.icon-grid span { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
.card-demo { width: min(100%, 36rem); }
.card-demo__header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.card-demo__body { margin: 0; color: hsl(var(--agala-muted-foreground)); }
@media (max-width: 640px) { .icon-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
