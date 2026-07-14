<script setup lang="ts">
import { ref, h, watch } from 'vue'
import { AgalaButton, AgalaCenter, AgalaDivider, AgalaInput, AgalaFormField, AgalaSelect, AgalaCreatableSelect, AgalaDatePicker, AgalaColorPicker, AgalaHStack, AgalaListGroup, AgalaListGroupItem, AgalaModal, AgalaModalProvider, modalManager, AgalaBadge, AgalaCheckbox, AgalaToggle, AgalaAvatar, AgalaToastProvider, toastManager, AgalaTextarea, AgalaMarkdownEditor, AgalaMarkdownPreview, AgalaDropdownMenu, AgalaTable, AgalaTabs, AgalaCard, AgalaTooltip, AgalaRadioGroup, AgalaSegmentedControl, AgalaNavbar, AgalaSidebar, AgalaSidebarToggle, AgalaAccordion, AgalaAccordionItem, AgalaSkeleton, AgalaStat, AgalaEmptyState, AgalaProgress, AgalaSpacer, AgalaTag, AgalaPagination, AgalaDrawer, AgalaFileUpload, AgalaDevEnvBanner, AgalaCalendar, AgalaAlert, AgalaVStack } from '../lib'

import { useMediaQuery } from '../lib/composables/useMediaQuery'
import AgalaIcon from '../lib/components/AgalaIcon/AgalaIcon.vue'
import type { TableColumn, TabItem, CalendarEvent, CalendarView, FileItem, SidebarNode } from '../lib'

/* ─── Theme ─── */
type Theme = 'default' | 'main' | 'smaltt' | 'kervo' | 'custom'
const activeTheme = ref<Theme>('default')
const customThemeCss = ref(`/* Paste your custom theme CSS here */
:root {
  --agala-primary: 200 90% 50%;
}`)
const customStyleEl = ref<HTMLStyleElement | null>(null)

function applyCustomTheme() {
  activeTheme.value = 'custom'
  document.documentElement.removeAttribute('data-theme')
  if (customStyleEl.value) {
    customStyleEl.value.textContent = customThemeCss.value
  } else {
    const el = document.createElement('style')
    el.textContent = customThemeCss.value
    document.head.appendChild(el)
    customStyleEl.value = el
  }
}

function resetCustomTheme() {
  activeTheme.value = 'default'
  document.documentElement.removeAttribute('data-theme')
  if (customStyleEl.value) {
    customStyleEl.value.textContent = ''
  }
}

watch(activeTheme, (t) => {
  if (t !== 'custom') {
    if (t === 'default') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
    if (customStyleEl.value) customStyleEl.value.textContent = ''
  }
}, { immediate: true })

/* ─── Button state ─── */
const loading = ref(false)

/* ─── Select state ─── */
const singleUser = ref('')
const multiTags = ref<string[]>([])
const searchCountry = ref('')
const maxTags = ref<string[]>([])

/* ─── CreatableSelect state ─── */
const creatableTags = ref<string[]>([])
const creatableSearch = ref('')
const emptyTags = ref<string[]>([])
const emptyOptions = ref<Array<{value: string, label: string}>>([])

const SKILLS = ref([
  { value: 'skill-js', label: 'JavaScript' },
  { value: 'skill-ts', label: 'TypeScript' },
  { value: 'skill-vue', label: 'Vue.js' },
  { value: 'skill-react', label: 'React' },
  { value: 'skill-node', label: 'Node.js' },
  { value: 'skill-python', label: 'Python' },
])

function handleCreateSkill(text: string) {
  const newId = `skill-${Date.now()}`
  SKILLS.value.push({ value: newId, label: text })
  // Component auto-selects; parent only adds to options
}

function handleSearchSkill(q: string) {
  creatableSearch.value = q
}

function handleCreateEmpty(text: string) {
  const newId = `empty-${Date.now()}`
  emptyOptions.value.push({ value: newId, label: text })
  // Component auto-selects; parent only adds to options
}

/* ─── DatePicker state ─── */
const pickedDate = ref('')
const minDate = ref('')
const maxDate = ref('')
const inlineDate = ref('')
const inlineDisplayMonth = ref('2026-05')

/* ─── ColorPicker state ─── */
const pickedColor = ref('')

/* ─── Modal state ─── */
const basicOpen = ref(false)
const selectInModalOpen = ref(false)

/* ─── Select in modal test ─── */
const gymMembers = [
  { value: '1', label: 'Juan Pérez', subtitle: 'Plan: Premium' },
  { value: '2', label: 'María García', subtitle: 'Plan: Basic' },
  { value: '3', label: 'Carlos López', subtitle: 'Plan: Elite' },
  { value: '4', label: 'Ana Rodríguez', subtitle: 'Plan: Premium' },
  { value: '5', label: 'Pedro Sánchez', subtitle: 'Plan: Basic' },
  { value: '6', label: 'Laura Torres', subtitle: 'Plan: Elite' },
  { value: '7', label: 'Jorge Díaz', subtitle: 'Plan: Premium' },
  { value: '8', label: 'Sofia Moreno', subtitle: 'Plan: Basic' },
]
const selectedMember = ref('')

/* ─── CreatableSelect + DatePicker in modal test ─── */
const modalSkills = ref([
  { value: 'ms-js', label: 'JavaScript' },
  { value: 'ms-ts', label: 'TypeScript' },
  { value: 'ms-vue', label: 'Vue.js' },
])
const modalSelectedSkills = ref<string[]>([])
const modalClassDate = ref('')

function handleModalCreateSkill(text: string) {
  const newId = `ms-${Date.now()}`
  modalSkills.value.push({ value: newId, label: text })
}

/* ─── Checkbox state ─── */
const cbBasic = ref(false)
const cbError = ref(false)
const cbIndeterminate = ref(false)

/* ─── Toggle state ─── */
const tgBasic = ref(false)
const tgSm = ref(false)
const tgLg = ref(true)

/* ─── Textarea state ─── */
const textareaValue = ref('')
const markdownValue = ref(`# Everyday Canvas Tote

Durable cotton tote for daily errands, market runs, and gift packaging.

- 16 oz washed canvas
- Interior slip pocket
- Holds up to **12 kg**

[View care guide](https://example.com/care)`)
const shortMarkdownValue = ref('Compact description with **bold** details and [shipping](/shipping) link.')

/* ─── Progress state ─── */
const progressValue = ref(65)

/* ─── Sidebar state ─── */
const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const sidebarActive = ref('member-directory')
const sidebarExpanded = ref(['operations', 'members'])
const { matches: isMobileViewport } = useMediaQuery('(max-width: 639px)')
const { matches: isDesktopViewport } = useMediaQuery('(min-width: 768px)')

const SIDEBAR_ITEMS: SidebarNode[] = [
  {
    label: 'Workspace',
    items: [
      { value: 'dashboard', label: 'Dashboard', icon: 'home', href: '#sidebar' },
      {
        value: 'operations',
        label: 'Operations',
        icon: 'building',
        badge: '12',
        children: [
          {
            value: 'members',
            label: 'Members',
            icon: 'users',
            badge: 248,
            children: [
              { value: 'member-directory', label: 'Directory', href: '#sidebar' },
              { value: 'member-segments', label: 'Segments', href: '#sidebar' },
              { value: 'member-imports', label: 'Imports', dot: true, dotVariant: 'warning', href: '#sidebar' },
            ],
          },
          { value: 'access', label: 'Access control', icon: 'key', dot: true, dotVariant: 'danger', href: '#sidebar' },
          { value: 'schedule', label: 'Schedule', icon: 'calendar', href: '#sidebar' },
          { value: 'shifts', label: 'Staff shifts', icon: 'clock', disabled: true },
        ],
      },
    ],
  },
  {
    label: 'Commercial',
    items: [
      {
        value: 'billing',
        label: 'Billing',
        icon: 'credit-card',
        children: [
          { value: 'plans', label: 'Plans', icon: 'document', href: '#sidebar' },
          { value: 'renewals', label: 'Renewals', icon: 'refresh', badge: 59, badgeVariant: 'danger', href: '#sidebar' },
          { value: 'payments', label: 'Payments', icon: 'credit-card', href: '#sidebar' },
        ],
      },
      { value: 'reports', label: 'Reports', icon: 'chart-bar', href: '#sidebar' },
      { value: 'notifications', label: 'Notifications', icon: 'bell', badge: 4, badgeVariant: 'warning', href: '#sidebar' },
    ],
  },
  {
    label: 'System',
    items: [
      { value: 'settings', label: 'Settings', icon: 'settings', href: '#sidebar' },
      { value: 'profile', label: 'Profile', icon: 'user', href: '#sidebar' },
    ],
  },
]

/* ─── Tag state ─── */
const tagList = ref([
  { label: 'React', variant: 'primary' as const },
  { label: 'Vue', variant: 'success' as const },
  { label: 'Svelte', variant: 'warning' as const },
  { label: 'Angular', variant: 'danger' as const },
])

/* ─── Pagination state ─── */
const currentPage = ref(1)

/* ─── Drawer state ─── */
const drawerOpen = ref(false)
const drawerPlacement = ref<'left' | 'right' | 'top' | 'bottom'>('right')

function openDrawer(placement: 'left' | 'right' | 'top' | 'bottom') {
  drawerPlacement.value = placement
  drawerOpen.value = true
}

/* ─── FileUpload state ─── */
const uploadedFiles = ref<FileItem[]>([])
const inlineUploadedFiles = ref<FileItem[]>([])

/* ─── Tabs state ─── */
const activeTab = ref('overview')
const TABS: TabItem[] = [
  { value: 'overview',     label: 'Overview' },
  { value: 'members',      label: 'Members' },
  { value: 'billing',      label: 'Billing' },
  { value: 'analytics',    label: 'Analytics' },
  { value: 'activity',     label: 'Activity' },
  { value: 'security',     label: 'Security' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'help',         label: 'Help' },
  { value: 'settings',     label: 'Settings', disabled: true },
]

/* ─── RadioGroup state ─── */
const radioOrientation = ref('horizontal')
const radioNotify = ref('email')
const radioError = ref('')
const NOTIFY_OPTIONS = [
  { value: 'email',  label: 'Email notifications' },
  { value: 'push',   label: 'Push notifications' },
  { value: 'sms',    label: 'SMS', disabled: true },
]

/* ─── SegmentedControl state ─── */
const segValue = ref('opt-1')
const segVariantsValue = ref('success')
const segSizeValue = ref('sm')

const SEG_OPTIONS = [
  { value: 'opt-1', label: 'Option 1' },
  { value: 'opt-2', label: 'Option 2' },
  { value: 'opt-3', label: 'Option 3' },
  { value: 'opt-4', label: 'Option 4' },
]

const SEG_VARIANT_OPTIONS = [
  { value: 'success', label: 'Success', variant: 'success' as const },
  { value: 'danger', label: 'Danger', variant: 'danger' as const },
]

const SEG_SIZE_OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const SEG_DISABLED_OPT = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', disabled: true },
  { value: 'c', label: 'Option C' },
]

/* ─── Table state ─── */
const tableSelected = ref<string[]>([])
const tableSortKey = ref('')
const tableSortDir = ref<'asc' | 'desc'>('asc')
const tableLoading = ref(false)

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name',   label: 'Member',  sortable: true },
  { key: 'plan',   label: 'Plan',    sortable: true, width: '120px' },
  { key: 'status', label: 'Status',  width: '110px', align: 'center' },
  { key: 'joined', label: 'Joined',  sortable: true, width: '130px' },
  { key: 'actions',label: '',        width: '48px',  align: 'center' },
]

const TABLE_ROWS = [
  { id: '1', name: 'Alice Johnson',  plan: 'Pro',    status: 'active',   joined: '2024-01-15' },
  { id: '2', name: 'Bob Smith',      plan: 'Starter', status: 'active',  joined: '2024-03-02' },
  { id: '3', name: 'Charlie Davis',  plan: 'Pro',    status: 'paused',   joined: '2023-11-08' },
  { id: '4', name: 'Diana Prince',   plan: 'Elite',  status: 'active',   joined: '2024-02-20' },
  { id: '5', name: 'Evan Wright',    plan: 'Starter', status: 'expired', joined: '2023-08-14' },
]

const statusVariant = (s: string) =>
  s === 'active' ? 'success' : s === 'paused' ? 'warning' : 'danger'

/* ─── Calendar state ─── */
const calendarView = ref<CalendarView>('month')
const calendarDate = ref(toISODate(new Date()))
const selectedEvent = ref<CalendarEvent | null>(null)
const clickedDay = ref<string | null>(null)
const selectedSlot = ref<{ start: string; end: string } | null>(null)

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDaysToDate(d: Date, days: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

const today = new Date()

function makeDatetime(date: Date, hour: number, minute: number): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(hour).padStart(2, '0')
  const min = String(minute).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:00`
}

const calendarEvents = ref<CalendarEvent[]>([
  /* yesterday */
  { id: '1', title: 'Design Review', subtitle: 'Figma walkthrough', start: makeDatetime(addDaysToDate(today, -1), 10, 0), end: makeDatetime(addDaysToDate(today, -1), 11, 30), color: 'primary' },
  /* today */
  { id: '2', title: 'Team Standup', subtitle: 'Daily sync', start: makeDatetime(today, 9, 0), end: makeDatetime(today, 9, 30), color: 'primary' },
  { id: '3', title: 'Lunch with Client', start: makeDatetime(today, 12, 0), end: makeDatetime(today, 13, 30), color: 'success' },
  { id: '4', title: 'Sprint Planning', subtitle: 'Q3 roadmap', start: makeDatetime(today, 14, 0), end: makeDatetime(today, 15, 30), color: 'warning' },
  { id: '5', title: 'Holiday', start: makeDatetime(today, 0, 0), end: makeDatetime(today, 23, 59), allDay: true, color: 'danger' },
  /* tomorrow */
  { id: '6', title: '1:1 with Manager', subtitle: 'Career growth', start: makeDatetime(addDaysToDate(today, 1), 11, 0), end: makeDatetime(addDaysToDate(today, 1), 11, 45), color: 'secondary' },
  { id: '7', title: 'Code Review', start: makeDatetime(addDaysToDate(today, 1), 15, 0), end: makeDatetime(addDaysToDate(today, 1), 16, 0), color: '#8b5cf6' },
  /* future */
  { id: '8', title: 'Product Launch', subtitle: 'Marketing kickoff', start: makeDatetime(addDaysToDate(today, 2), 10, 0), end: makeDatetime(addDaysToDate(today, 2), 12, 0), color: 'accent' },
  { id: '9', title: 'Conference', start: makeDatetime(addDaysToDate(today, 3), 0, 0), end: makeDatetime(addDaysToDate(today, 3), 23, 59), allDay: true, color: 'success' },
  { id: '10', title: 'Backend Sync', start: makeDatetime(addDaysToDate(today, 3), 13, 0), end: makeDatetime(addDaysToDate(today, 3), 14, 0), color: 'danger' },
  { id: '11', title: 'User Testing', subtitle: 'Usability session', start: makeDatetime(addDaysToDate(today, 4), 9, 30), end: makeDatetime(addDaysToDate(today, 4), 11, 0), color: 'primary' },
  { id: '12', title: 'All-hands', start: makeDatetime(addDaysToDate(today, 4), 16, 0), end: makeDatetime(addDaysToDate(today, 4), 17, 0), color: 'warning' },
  { id: '13', title: 'Release Party', start: makeDatetime(addDaysToDate(today, 5), 18, 0), end: makeDatetime(addDaysToDate(today, 5), 21, 0), color: '#ec4899' },
  { id: '14', title: 'Quarterly Review', subtitle: 'Board presentation', start: makeDatetime(addDaysToDate(today, 6), 10, 0), end: makeDatetime(addDaysToDate(today, 6), 11, 30), color: 'secondary' },
  /* short 15min events for slot demo */
  { id: '15', title: 'Quick Check-in', subtitle: '15 min', start: makeDatetime(today, 10, 0), end: makeDatetime(today, 10, 15), color: 'success' },
  { id: '16', title: 'Phone Screen', subtitle: '15 min', start: makeDatetime(today, 11, 0), end: makeDatetime(today, 11, 15), color: 'primary' },
  { id: '17', title: 'Standup 2', subtitle: '15 min', start: makeDatetime(today, 15, 30), end: makeDatetime(today, 15, 45), color: 'warning' },
  { id: '18', title: 'Coffee Chat', subtitle: '15 min', start: makeDatetime(today, 16, 0), end: makeDatetime(today, 16, 15), color: '#8b5cf6' },
])

/* ─── Demo data ─── */
const USERS = [
  { value: 'user-1', label: 'Alice Johnson', subtitle: 'Admin' },
  { value: 'user-2', label: 'Bob Smith', subtitle: 'Editor' },
  { value: 'user-3', label: 'Charlie Davis', subtitle: 'Viewer', disabled: true },
  { value: 'user-4', label: 'Diana Prince', subtitle: 'Admin' },
  { value: 'user-5', label: 'Evan Wright', subtitle: 'Editor' },
]

const COUNTRIES = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
]

const TAGS = [
  { value: 'tag-react', label: 'React' },
  { value: 'tag-vue', label: 'Vue' },
  { value: 'tag-svelte', label: 'Svelte' },
  { value: 'tag-angular', label: 'Angular' },
  { value: 'tag-solid', label: 'Solid' },
  { value: 'tag-next', label: 'Next.js' },
  { value: 'tag-node', label: 'Node.js' },
  { value: 'tag-rust', label: 'Rust' },
]

const variants = ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'] as const
const sizes = ['sm', 'md', 'lg'] as const
const modalSizes: Array<'sm' | 'md' | 'lg' | 'xl' | 'full'> = ['sm', 'md', 'lg', 'xl', 'full']

/* ─── Modal demos ─── */
function openConfirmDialog() {
  modalManager.open(ConfirmDialog, { props: { message: 'This action cannot be undone.' }, size: 'sm' })
    .then((result) => {
      if (result.confirmed) alert('Confirmed!')
    })
}

function openFormDialog() {
  modalManager.open(FormDialog, { props: { reason: '' }, size: 'md' })
    .then((result) => {
      if (result.confirmed) alert('Form submitted!')
      else alert('Cancelled.')
    })
}

function openAckDialog() {
  modalManager.open(AckDialog, { size: 'sm', dismissible: false, escapeCloses: false })
    .then(() => alert('You acknowledged it!'))
}

/* ─── Demo dialog components ─── */
const ConfirmDialog = {
  props: ['message'],
  setup(props: { message: string }) {
    return () => h('p', { style: { margin: 0 } }, props.message)
  },
}

const FormDialog = {
  props: ['reason'],
  setup() {
    return { reason: ref('') }
  },
  render() {
    return h('div', [
      h('p', { style: { margin: '0 0 1rem' } }, 'Why are you leaving?'),
      h('input', {
        value: this.reason,
        style: { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' },
        onInput: (e: Event) => { this.reason = (e.target as HTMLInputElement).value },
      }),
    ])
  },
}

const AckDialog = {
  setup() {
    return () => h('p', { style: { margin: 0 } },
      'Escape and outside-click are disabled. You must click the button below.')
  },
}
</script>

<template>
  <AgalaModalProvider />
  <AgalaToastProvider />

  <div class="themebar">
    <span class="themebar__label">Theme</span>
    <div class="themebar__pills">
      <button
        v-for="t in (['default', 'main', 'smaltt', 'kervo'] as const)"
        :key="t"
        class="themebar__pill"
        :class="{ 'themebar__pill--active': activeTheme === t }"
        @click="activeTheme = t as Theme"
      >
        {{ t.charAt(0).toUpperCase() + t.slice(1) }}
      </button>
    </div>
  </div>

  <nav class="playground-nav">
    <span class="playground-nav__title">Components</span>
    <a href="#banner">Dev Banner</a>
    <a href="#btn">Button</a>
    <a href="#input">Input</a>
    <a href="#formfield">FormField</a>
    <a href="#select">Select</a>
    <a href="#creatable">Creatable</a>
    <a href="#datepicker">DatePicker</a>
    <a href="#calendar">Calendar</a>
    <a href="#colorpicker">ColorPicker</a>
    <a href="#modal">Modal</a>
    <a href="#badge">Badge</a>
    <a href="#checkbox">Checkbox</a>
    <a href="#toggle">Toggle</a>
    <a href="#avatar">Avatar</a>
    <a href="#toast">Toast</a>
    <a href="#textarea">Textarea</a>
    <a href="#markdown">Markdown</a>
    <a href="#dropdown">Dropdown</a>
    <a href="#table">Table</a>
    <a href="#tabs">Tabs</a>
    <a href="#card">Card</a>
    <a href="#tooltip">Tooltip</a>
    <a href="#radio">Radio</a>
    <a href="#segmented">Segmented</a>
    <a href="#navbar">Navbar</a>
    <a href="#sidebar">Sidebar</a>
    <a href="#accordion">Accordion</a>
    <a href="#skeleton">Skeleton</a>
    <a href="#stat">Stat</a>
    <a href="#progress">Progress</a>
    <a href="#tag">Tag</a>
    <a href="#pagination">Pagination</a>
    <a href="#drawer">Drawer</a>
    <a href="#fileupload">File</a>
    <a href="#layout">Layout</a>
    <a href="#listgroup">List</a>
    <a href="#alert">Alert</a>
    <a href="#theme">Theme</a>
  </nav>

  <div class="playground">
    <!-- ─── Theme Tester ─── -->
    <section id="theme">
      <h2>Theme Tester</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Paste custom CSS variables below and click <strong>Apply</strong> to see all components update instantly.
      </p>
      <div class="stack" style="max-width: 640px">
        <AgalaTextarea
          v-model="customThemeCss"
          :rows="6"
          resize="vertical"
          placeholder="/* Paste your custom theme CSS here */\n:root {\n  --agala-primary: 200 90% 50%;\n  --agala-background: 0 0% 98%;\n  --agala-card: 0 0% 100%;\n  /* … */\n}"
        />
        <div class="row" style="margin-bottom: 0">
          <AgalaButton variant="primary" icon="search" @click="applyCustomTheme">Apply Custom Theme</AgalaButton>
          <AgalaButton variant="outline" @click="resetCustomTheme">Reset to Default</AgalaButton>
          <span v-if="activeTheme === 'custom'" class="muted" style="font-size: 0.75rem; margin-left: auto">
            ✅ Custom theme active
          </span>
        </div>
      </div>
    </section>

    <header>
      <h1>Agala UI</h1>
      <p>Elegant, modern, themable components. Toggle dark mode on your OS to switch palettes.</p>
    </header>

    <!-- ─── DevEnvBanner ─── -->
    <section id="banner">
      <h2>DevEnvBanner</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">Close button removes the banner from the DOM. Refresh to reset.</p>
      <div class="stack" style="gap: 0">
        <AgalaDevEnvBanner />
        <AgalaDevEnvBanner text="Custom: Preview environment — data resets daily." class="custom-banner" />
      </div>
    </section>

    <!-- ─── Button ─── -->
    <section id="btn">
      <h2>Button — Variants</h2>
      <div class="row">
        <AgalaButton v-for="v in variants" :key="v" :variant="v">
          {{ v.charAt(0).toUpperCase() + v.slice(1) }}
        </AgalaButton>
      </div>
    </section>

    <section>
      <h2>Button — Sizes</h2>
      <div class="row">
        <AgalaButton v-for="s in sizes" :key="s" :size="s">{{ s.toUpperCase() }} button</AgalaButton>
      </div>
    </section>

    <section>
      <h2>Button — Icon</h2>
      <div class="row">
        <AgalaButton icon="search">Search</AgalaButton>
        <AgalaButton variant="outline" icon="mail">Email</AgalaButton>
        <AgalaButton variant="ghost" icon="search">Ghost</AgalaButton>
        <AgalaButton size="icon" icon="search" aria-label="Search" />
      </div>
    </section>

    <section>
      <h2>Button — States</h2>
      <div class="row">
        <AgalaButton disabled>Disabled</AgalaButton>
        <AgalaButton loading>Saving</AgalaButton>
        <AgalaButton
          :loading="loading"
          @click="loading = true; setTimeout(() => loading = false, 2000)"
        >
          {{ loading ? 'Working…' : 'Click to load' }}
        </AgalaButton>
        <AgalaButton block>Block</AgalaButton>
      </div>
    </section>

    <!-- ─── Input ─── -->
    <section id="input">
      <h2>Input — Default</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaInput placeholder="Small" size="sm" />
        <AgalaInput placeholder="Medium (default)" />
        <AgalaInput placeholder="Large" size="lg" />
      </div>
    </section>

    <section>
      <h2>Input — With Icons</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaInput placeholder="Search…" icon-start="search" />
        <AgalaInput placeholder="you@example.com" icon-start="mail" />
        <AgalaInput placeholder="Password" type="password" icon-end="eye" />
      </div>
    </section>

    <section>
      <h2>Input — States</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaInput placeholder="Disabled" disabled />
        <AgalaInput placeholder="Read-only" readonly value="me@agala.dev" />
        <AgalaInput placeholder="With error" error error-message="This field is required." />
      </div>
    </section>

    <section>
      <h2 style="margin-top: 1.5rem">Input — Actionable end icon</h2>
      <div class="stack" style="max-width: 300px">
        <AgalaInput placeholder="Search..." icon-start="search" icon-end="x" icon-end-actionable @icon-end-click="console.log('clear')" />
      </div>
    </section>

    <!-- ─── FormField ─── -->
    <section id="formfield">
      <h2>FormField</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaFormField label="Username" helper="Choose a unique username." html-for="user" required>
          <AgalaInput id="user" placeholder="agala" />
        </AgalaFormField>
        <AgalaFormField label="Email" helper="We'll never share your email." html-for="email2">
          <AgalaInput id="email2" placeholder="you@example.com" icon-start="mail" />
        </AgalaFormField>
        <AgalaFormField label="Password" error="Password must be at least 8 characters." html-for="pass" required>
          <AgalaInput id="pass" type="password" placeholder="••••••••" icon-end="eye" error />
        </AgalaFormField>
        <AgalaFormField label="Disabled field" disabled>
          <AgalaInput placeholder="Can't type here" disabled />
        </AgalaFormField>
      </div>
    </section>

    <!-- ─── Select ─── -->
    <section id="select">
      <h2>Select — Single</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaSelect :options="USERS" placeholder="Pick a user" v-model="singleUser" clearable />
        <AgalaSelect :options="USERS" placeholder="Small" size="sm" />
        <AgalaSelect :options="USERS" placeholder="Large" size="lg" />
      </div>
    </section>

    <section>
      <h2>Select — Multi-select</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaSelect :options="TAGS" placeholder="Pick tags (chips)" multiple clearable v-model="multiTags" />
      </div>
    </section>

    <section>
      <h2>Select — Searchable + Grouped</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaSelect :options="COUNTRIES" placeholder="Search countries…" searchable clearable v-model="searchCountry" />
      </div>
    </section>

    <section>
      <h2>Select — Max 3 selections</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaSelect :options="TAGS" placeholder="Pick up to 3 tags" multiple clearable :max-selections="3" v-model="maxTags" />
      </div>
    </section>

    <section>
      <h2>Select — Error + Disabled</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaSelect :options="USERS" placeholder="Something went wrong" error error-message="You must select at least one user." />
        <AgalaSelect :options="USERS" placeholder="Disabled" disabled />
        <AgalaSelect :options="[]" placeholder="Empty options" />
      </div>
    </section>

    <section>
      <h2>Select — Width Test (Flex Row)</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Two selects in a flex row with fixed widths — neither should stretch beyond its assigned width.
      </p>
      <div class="row" style="gap: 0.5rem; max-width: 400px; border: 1px dashed hsl(var(--agala-border)); padding: 0.5rem; border-radius: var(--agala-radius)">
        <AgalaSelect :options="USERS" placeholder="180px" style="width: 180px" clearable />
        <AgalaSelect :options="TAGS" placeholder="Flex:1" multiple clearable style="flex: 1" />
      </div>
    </section>

    <!-- ─── CreatableSelect ─── -->
    <section id="creatable">
      <h2>CreatableSelect — Basic</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Type to filter. When no match exists and creatable is true, a "Crear" option appears at the top.
        Press Enter on it to emit the <code>create</code> event with the typed text.
      </p>
      <div class="stack" style="max-width: 400px">
        <AgalaCreatableSelect
          v-model="creatableTags"
          :options="SKILLS"
          placeholder="Pick or create skills…"
          @create="handleCreateSkill"
          @search="handleSearchSkill"
        />
        <p class="muted" style="font-size: 0.75rem; margin: 0">
          Selected: {{ creatableTags.join(', ') || '—' }} · Last search query: {{ creatableSearch || '—' }}
        </p>
      </div>
    </section>

    <section>
      <h2>CreatableSelect — Disabled + Empty</h2>
      <div class="stack" style="max-width: 400px">
        <AgalaCreatableSelect :options="SKILLS" placeholder="Disabled select" disabled />
        <AgalaCreatableSelect
          v-model="emptyTags"
          :options="emptyOptions"
          placeholder="No options available"
          @create="handleCreateEmpty"
        />
      </div>
    </section>

    <!-- ─── DatePicker ─── -->
    <section id="datepicker">
      <h2>DatePicker — Sizes</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaDatePicker v-model="pickedDate" size="sm" placeholder="Small" />
        <AgalaDatePicker v-model="pickedDate" size="md" placeholder="Medium (default)" />
        <AgalaDatePicker v-model="pickedDate" size="lg" placeholder="Large" />
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Selected: {{ pickedDate || '—' }}</p>
      <p class="muted" style="margin-top: 0.25rem; font-size: 0.875rem">Click the header to switch between day, month, and year views for fast navigation.</p>
    </section>

    <section>
      <h2>DatePicker — Clearable + Min/Max</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaDatePicker v-model="pickedDate" clearable placeholder="Pick a date (clearable)" />
        <AgalaDatePicker v-model="minDate" :min="pickedDate || undefined" placeholder="Min = selected above" clearable />
        <AgalaDatePicker v-model="maxDate" :max="pickedDate || undefined" placeholder="Max = selected above" clearable />
      </div>
    </section>

    <section>
      <h2>DatePicker — Error + Disabled</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaDatePicker placeholder="Error state" error error-message="Please select a valid date." />
        <AgalaDatePicker placeholder="Disabled" disabled />
      </div>
    </section>

    <section>
      <h2>DatePicker — Inline + Highlight dates</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Always-visible calendar panel, no input popup. Dots indicate highlighted dates.
      </p>
      <div style="display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap">
        <AgalaDatePicker v-model="inlineDate" inline :highlight-dates="['2026-05-13', '2026-05-18', '2026-05-22']" v-model:display-month="inlineDisplayMonth" />
        <div style="padding-top: 0.5rem">
          <p class="muted" style="margin: 0 0 0.25rem; font-size: 0.875rem">Selected: <strong>{{ inlineDate || '—' }}</strong></p>
          <p class="muted" style="margin: 0; font-size: 0.875rem">Display month: {{ inlineDisplayMonth }}</p>
        </div>
      </div>
    </section>

    <!-- ─── Calendar ─── -->
    <section id="calendar">
      <h2>Calendar</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Interactive calendar with month, week, day, and list views. Click events or days to see debug info below.
      </p>
      <div style="height: 600px; border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); overflow: hidden">
        <AgalaCalendar
          v-model:view="calendarView"
          v-model:currentDate="calendarDate"
          :events="calendarEvents"
          @select="event => { selectedEvent = event; console.log('Selected event:', event.title) }"
          @day-click="date => { clickedDay = date; console.log('Clicked day:', date) }"
          @slot-select="slot => { selectedSlot = slot; console.log('Selected slot:', slot) }"
        />
      </div>
      <div style="margin-top: 0.75rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.25rem 1rem">
        <p class="muted" style="margin: 0; font-size: 0.875rem">Selected view: {{ calendarView }}</p>
        <p class="muted" style="margin: 0; font-size: 0.875rem">Current date: {{ calendarDate }}</p>
        <p class="muted" style="margin: 0; font-size: 0.875rem">Last selected event: {{ selectedEvent?.title || 'none' }}</p>
        <p class="muted" style="margin: 0; font-size: 0.875rem">Last clicked day: {{ clickedDay || 'none' }}</p>
        <p class="muted" style="margin: 0; font-size: 0.875rem">Last slot: {{ selectedSlot ? `${selectedSlot.start} → ${selectedSlot.end}` : 'none' }}</p>
      </div>

      <h2 style="margin-top: 1.5rem">Calendar — 15-min intervals</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Same calendar with <strong>:snap-minutes="15"</strong> for finer slot selection.
      </p>
      <div style="height: 600px; border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); overflow: hidden">
        <AgalaCalendar
          v-model:view="calendarView"
          v-model:currentDate="calendarDate"
          :events="calendarEvents"
          :snap-minutes="15"
          @select="event => { selectedEvent = event; console.log('Selected event:', event.title) }"
          @day-click="date => { clickedDay = date; console.log('Clicked day:', date) }"
          @slot-select="slot => { selectedSlot = slot; console.log('Selected slot:', slot) }"
        />
      </div>
    </section>

    <!-- ═══════════════════ COLORPICKER ═══════════════════ -->
    <section id="colorpicker">
      <h2>ColorPicker — Sizes</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaColorPicker v-model="pickedColor" size="sm" placeholder="Small" />
        <AgalaColorPicker v-model="pickedColor" size="md" placeholder="Medium" />
        <AgalaColorPicker v-model="pickedColor" size="lg" placeholder="Large" />
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Selected: {{ pickedColor || '—' }}</p>

      <h2>ColorPicker — Clearable + Error + Disabled</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaColorPicker v-model="pickedColor" clearable placeholder="Pick a color (clearable)" />
        <AgalaColorPicker placeholder="Error state" error error-message="Please select a valid color." />
        <AgalaColorPicker placeholder="Disabled" disabled />
      </div>
    </section>

    <!-- ─── Dark Mode ─── -->
    <section id="dark">
      <h2>Dark Mode</h2>
      <p class="muted">Toggle your OS dark mode preference to watch the tokens switch automatically.</p>
    </section>

    <!-- ═══════════════════ MODAL (Responsive) ═══════════════════ -->
    <section id="modal">
      <h2>Modal — Declarative</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Shrinks to near-full-width on viewports below 640 px, with the body scrolling separately from the header and footer.
      </p>
      <div class="row">
        <AgalaButton @click="basicOpen = true">Open Basic Modal</AgalaButton>
      </div>
      <AgalaModal :open="basicOpen" @close="basicOpen = false" title="Hello Modal">
        <p style="margin: 0 0 1rem">
          This is a fully declarative modal. You control its state with <code>v-model:open</code> or <code>open</code> and <code>@close</code> props.
        </p>
        <p class="muted" style="font-size: 0.875rem; margin: 0">
          Try pressing Escape, clicking outside, or the X button.
        </p>
        <template #footer="{ close }">
          <AgalaButton variant="outline" size="sm" @click="close">Close</AgalaButton>
          <AgalaButton variant="secondary" size="sm" @click="basicOpen = false">Review Later</AgalaButton>
          <AgalaButton size="sm" @click="basicOpen = false">Save Changes</AgalaButton>
        </template>
      </AgalaModal>
    </section>

    <section>
      <h2>Dropdowns in Modal (positioning test)</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Open modal → scroll down → test Select, CreatableSelect, and DatePicker dropdowns. All should appear <strong>above the footer</strong>, not clipped.
      </p>
      <div class="row">
        <AgalaButton @click="selectInModalOpen = true">Open Modal with Select</AgalaButton>
      </div>
      <AgalaModal :open="selectInModalOpen" @close="selectInModalOpen = false" title="Dropdown Positioning Test">
        <!-- Lots of content to force scrolling -->
        <p>Configuración de la clase de spinning del día lunes.</p>
        <p class="muted">Este contenido está aquí para forzar que el modal tenga scroll y el Select quede cerca del footer.</p>
        <div style="height: 150px; background: hsl(var(--agala-muted) / 0.3); border-radius: 8px; margin: 1rem 0; display: flex; align-items: center; justify-content: center; color: hsl(var(--agala-muted-foreground))">
          Placeholder de contenido adicional
        </div>
        <p>Más contenido para asegurar que hay scroll...</p>
        <p class="muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Aquí viene el Select cerca del footer:</p>
        
        <!-- Select near footer - this is the test case -->
        <AgalaSelect
          v-model="selectedMember"
          :options="gymMembers"
          placeholder="Selecciona un instructor..."
          searchable
          style="margin-bottom: 1rem"
        />

        <p class="muted">Aquí viene el CreatableSelect cerca del footer:</p>
        <AgalaCreatableSelect
          v-model="modalSelectedSkills"
          :options="modalSkills"
          placeholder="Pick or create skills…"
          @create="handleModalCreateSkill"
          style="margin-bottom: 1rem"
        />

        <p class="muted">Aquí viene el DatePicker cerca del footer:</p>
        <AgalaDatePicker
          v-model="modalClassDate"
          placeholder="Pick a class date…"
          style="margin-bottom: 1rem; max-width: 320px"
        />

        <p class="muted">Más contenido después del select...</p>
        <p>Otra línea de contenido para llenar el modal.</p>
        
        <template #footer="{ close }">
          <AgalaButton variant="outline" size="sm" @click="close">Cancelar</AgalaButton>
          <AgalaButton size="sm" @click="selectInModalOpen = false">Confirmar</AgalaButton>
        </template>
      </AgalaModal>
    </section>

    <section>
      <h2>Modal — Sizes</h2>
      <div class="row">
        <AgalaButton v-for="sz in modalSizes" :key="sz" variant="outline" size="sm" @click="basicOpen = true">
          {{ sz.toUpperCase() }}
        </AgalaButton>
      </div>
      <p class="muted">In real usage you'd wire each to its own state.</p>
    </section>

    <section>
      <h2>Modal — Imperative</h2>
      <div class="row">
        <AgalaButton variant="outline" @click="openConfirmDialog">Confirm Dialog</AgalaButton>
        <AgalaButton variant="outline" @click="openFormDialog">Custom Form</AgalaButton>
        <AgalaButton variant="outline" @click="openAckDialog">Forced Acknowledge</AgalaButton>
      </div>
      <p class="muted">
        Uses <code>modalManager.open()</code> — no Vue state needed. Returns a <code>Promise&lt;ModalResult&gt;</code>.
      </p>
    </section>

    <!-- ═══════════════════ BADGE ═══════════════════ -->
    <section id="badge">
      <h2>Badge — Variants</h2>
      <div class="row">
        <AgalaBadge>Default</AgalaBadge>
        <AgalaBadge variant="secondary">Secondary</AgalaBadge>
        <AgalaBadge variant="outline">Outline</AgalaBadge>
        <AgalaBadge variant="success">Success</AgalaBadge>
        <AgalaBadge variant="warning">Warning</AgalaBadge>
        <AgalaBadge variant="danger">Danger</AgalaBadge>
      </div>
    </section>

    <section>
      <h2>Badge — Sizes + Dot</h2>
      <div class="row">
        <AgalaBadge size="sm">Small</AgalaBadge>
        <AgalaBadge size="md">Medium</AgalaBadge>
        <AgalaBadge variant="success" dot>Active</AgalaBadge>
        <AgalaBadge variant="danger" dot>Critical</AgalaBadge>
        <AgalaBadge variant="warning" dot size="sm">Pending</AgalaBadge>
      </div>
    </section>

    <section>
      <h2 style="margin-top: 1.5rem">Badge — Subtle variant</h2>
      <div class="row">
        <AgalaBadge variant="subtle" color="primary">Active</AgalaBadge>
        <AgalaBadge variant="subtle" color="success">Completed</AgalaBadge>
        <AgalaBadge variant="subtle" color="warning">Pending</AgalaBadge>
        <AgalaBadge variant="subtle" color="danger">Cancelled</AgalaBadge>
      </div>
    </section>

    <!-- ═══════════════════ CHECKBOX ═══════════════════ -->
    <section id="checkbox">
      <h2>Checkbox</h2>
      <div class="stack" style="max-width: 320px">
        <AgalaCheckbox v-model="cbBasic" label="Accept terms and conditions" />
        <AgalaCheckbox v-model="cbError" label="Error state" :error="true" />
        <AgalaCheckbox v-model="cbIndeterminate" label="Indeterminate (select all)" :indeterminate="true" />
        <AgalaCheckbox label="Disabled unchecked" :disabled="true" />
        <AgalaCheckbox label="Disabled checked" :model-value="true" :disabled="true" />
      </div>
      <p class="muted" style="margin-top: 0.75rem; font-size: 0.875rem">cbBasic: {{ cbBasic }}</p>
    </section>

    <!-- ═══════════════════ TOGGLE ═══════════════════ -->
    <section id="toggle">
      <h2>Toggle — Sizes</h2>
      <div class="row" style="align-items: center; gap: 1.5rem">
        <div class="row" style="align-items: center; gap: 0.5rem; margin: 0">
          <AgalaToggle v-model="tgSm" size="sm" />
          <span style="font-size: 0.875rem">Small</span>
        </div>
        <div class="row" style="align-items: center; gap: 0.5rem; margin: 0">
          <AgalaToggle v-model="tgBasic" size="md" />
          <span style="font-size: 0.875rem">Medium</span>
        </div>
        <div class="row" style="align-items: center; gap: 0.5rem; margin: 0">
          <AgalaToggle v-model="tgLg" size="lg" />
          <span style="font-size: 0.875rem">Large</span>
        </div>
        <div class="row" style="align-items: center; gap: 0.5rem; margin: 0">
          <AgalaToggle :model-value="true" :disabled="true" />
          <span style="font-size: 0.875rem">Disabled</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ AVATAR ═══════════════════ -->
    <section id="avatar">
      <h2>Avatar — Sizes</h2>
      <div class="row" style="align-items: flex-end">
        <AgalaAvatar size="xs" fallback="XS" />
        <AgalaAvatar size="sm" fallback="SM" />
        <AgalaAvatar size="md" fallback="MD" />
        <AgalaAvatar size="lg" fallback="LG" />
        <AgalaAvatar size="xl" fallback="XL" />
      </div>
    </section>

    <section>
      <h2>Avatar — Fallbacks</h2>
      <div class="row" style="align-items: center">
        <AgalaAvatar src="https://i.pravatar.cc/150?img=1" alt="Alice" size="md" />
        <AgalaAvatar src="https://i.pravatar.cc/150?img=2" alt="Bob" size="md" />
        <AgalaAvatar fallback="JD" size="md" />
        <AgalaAvatar fallback="AB" size="md" />
        <AgalaAvatar size="md" />
        <AgalaAvatar src="https://broken.url/img.png" fallback="ER" size="md" />
      </div>
      <p class="muted" style="font-size: 0.875rem; margin-top: 0.5rem">Last avatar has a broken src — falls back to initials.</p>
    </section>

    <!-- ═══════════════════ TOAST ═══════════════════ -->
    <section id="toast">
      <h2>Toast</h2>
      <div class="row">
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'Everything looks good.' })">
          Default
        </AgalaButton>
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'Your changes have been saved.', variant: 'success' })">
          Success
        </AgalaButton>
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'Your subscription expires in 3 days.', variant: 'warning' })">
          Warning
        </AgalaButton>
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'Payment failed. Please retry.', variant: 'danger' })">
          Danger
        </AgalaButton>
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'File uploaded successfully.', variant: 'success', action: { label: 'View', onClick: () => alert('Viewing!') } })">
          With Action
        </AgalaButton>
        <AgalaButton variant="outline" size="sm"
          @click="toastManager.show({ message: 'This toast will stay until dismissed.', duration: 0 })">
          Persistent
        </AgalaButton>
      </div>
      <p class="muted" style="font-size: 0.875rem">Toasts appear bottom-right. Default auto-dismiss after 4s.</p>
    </section>

    <!-- ═══════════════════ TEXTAREA ═══════════════════ -->
    <section id="textarea">
      <h2>Textarea</h2>
      <div class="stack" style="max-width: 480px">
        <AgalaFormField label="Notes" html-for="ta1" helper="Resize vertically by default.">
          <AgalaTextarea id="ta1" v-model="textareaValue" placeholder="Write something…" />
        </AgalaFormField>
        <AgalaFormField label="Fixed height" html-for="ta2">
          <AgalaTextarea id="ta2" :rows="2" resize="none" placeholder="No resize, 2 rows" />
        </AgalaFormField>
        <AgalaFormField label="Error state" html-for="ta3" error="This field is required.">
          <AgalaTextarea id="ta3" placeholder="Required field" error error-message="" />
        </AgalaFormField>
        <AgalaTextarea placeholder="Disabled textarea" :disabled="true" />
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Value: {{ textareaValue || '—' }}</p>
    </section>

    <!-- ═══════════════════ MARKDOWN EDITOR ═══════════════════ -->
    <section id="markdown">
      <h2>MarkdownEditor</h2>
      <div class="stack" style="max-width: 900px">
        <AgalaFormField label="Product description" helper="Stores markdown and renders a safe preview with raw HTML disabled.">
          <AgalaMarkdownEditor
            v-model="markdownValue"
            placeholder="Write a product description in markdown..."
            preview="split"
            :maxlength="500"
            show-count
          />
        </AgalaFormField>
        <AgalaFormField label="Localized labels">
          <AgalaMarkdownEditor
            v-model="shortMarkdownValue"
            :rows="6"
            preview="tab"
            edit-label="Write"
            preview-label="Read"
            empty-preview="No product copy yet."
          />
        </AgalaFormField>
        <AgalaFormField label="Standalone preview">
          <AgalaMarkdownPreview
            :source="markdownValue"
            empty-text="No markdown content."
            aria-label="Product description preview"
          />
        </AgalaFormField>
      </div>
    </section>

    <!-- ═══════════════════ DROPDOWN MENU ═══════════════════ -->
    <section id="dropdown">
      <h2>DropdownMenu</h2>
      <div class="row">
        <AgalaDropdownMenu
          :items="[
            { label: 'View profile', icon: 'user', onClick: () => toastManager.show({ message: 'View profile', variant: 'default' }) },
            { label: 'Edit',         icon: 'search', onClick: () => toastManager.show({ message: 'Edit clicked' }) },
            { separator: true },
            { label: 'Delete',       icon: 'x', variant: 'danger', onClick: () => toastManager.show({ message: 'Deleted!', variant: 'danger' }) },
          ]"
          placement="bottom-start"
        >
          <template #trigger>
            <AgalaButton variant="outline" size="sm">Actions</AgalaButton>
          </template>
        </AgalaDropdownMenu>

        <AgalaDropdownMenu
          :items="[
            { label: 'Edit row', icon: 'search' },
            { label: 'Duplicate', icon: 'flag' },
            { separator: true },
            { label: 'Archive', icon: 'x', disabled: true },
            { separator: true },
            { label: 'Delete', icon: 'x', variant: 'danger', onClick: () => toastManager.show({ message: 'Row deleted', variant: 'danger' }) },
          ]"
          placement="bottom-end"
        >
          <template #trigger>
            <AgalaButton size="icon" variant="ghost" aria-label="Row actions" icon="search" />
          </template>
        </AgalaDropdownMenu>
      </div>
      <p class="muted" style="font-size: 0.875rem">Left: bottom-start, Right: bottom-end (kebab trigger). Arrow keys + Enter navigate.</p>
    </section>

    <!-- ═══════════════════ TABLE ═══════════════════ -->
    <section id="table">
      <h2>Table</h2>
      <div class="row" style="margin-bottom: 0.75rem">
        <AgalaButton
          variant="outline"
          size="sm"
          :loading="tableLoading"
          @click="tableLoading = !tableLoading"
        >
          {{ tableLoading ? 'Stop loading' : 'Toggle loading' }}
        </AgalaButton>
        <span v-if="tableSelected.length" class="muted" style="font-size: 0.875rem">
          {{ tableSelected.length }} row(s) selected
        </span>
      </div>

      <AgalaTable
        :columns="TABLE_COLUMNS"
        :rows="TABLE_ROWS"
        :loading="tableLoading"
        selectable
        v-model:selected-rows="tableSelected"
        v-model:sort-key="tableSortKey"
        v-model:sort-dir="tableSortDir"
        @row-click="row => toastManager.show({ message: `Clicked: ${row.name}` })"
      >
        <template #cell-name="{ row }">
          <div style="display: flex; align-items: center; gap: 0.5rem">
            <AgalaAvatar :fallback="String(row.name).slice(0, 2)" size="sm" />
            <span style="font-weight: 500">{{ row.name }}</span>
          </div>
        </template>

        <template #cell-plan="{ value }">
          <AgalaBadge variant="secondary" size="sm">{{ value }}</AgalaBadge>
        </template>

        <template #cell-status="{ value }">
          <AgalaBadge :variant="statusVariant(String(value))" dot size="sm">{{ value }}</AgalaBadge>
        </template>

        <template #cell-actions>
          <AgalaDropdownMenu
            :items="[
              { label: 'View', icon: 'user' },
              { label: 'Edit', icon: 'search' },
              { separator: true },
              { label: 'Delete', icon: 'x', variant: 'danger', onClick: () => toastManager.show({ message: 'Deleted', variant: 'danger' }) },
            ]"
            placement="bottom-end"
          >
            <template #trigger>
              <AgalaButton size="icon" variant="ghost" aria-label="Row actions" icon="search" />
            </template>
          </AgalaDropdownMenu>
        </template>

        <template #footer>
          <span class="muted" style="font-size: 0.875rem">Showing {{ TABLE_ROWS.length }} of {{ TABLE_ROWS.length }} members</span>
          <div style="display: flex; gap: 0.5rem">
            <AgalaButton variant="outline" size="sm" disabled>Previous</AgalaButton>
            <AgalaButton variant="outline" size="sm" disabled>Next</AgalaButton>
          </div>
        </template>
      </AgalaTable>

      <p class="muted" style="margin-top: 0.75rem; font-size: 0.875rem">
        Sort key: <strong>{{ tableSortKey || '—' }}</strong> {{ tableSortDir }} · Selected IDs: {{ tableSelected.join(', ') || '—' }}
      </p>
    </section>

    <section>
      <h2 style="margin-top: 1.5rem">Table — Clean variant</h2>
      <AgalaTable
        variant="clean"
        :columns="[{ key: 'name', label: 'Name', sortable: true }, { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }]"
        :rows="[{ name: 'Alice', role: 'Admin', status: 'Active' }, { name: 'Bob', role: 'Editor', status: 'Inactive' }]"
      />
    </section>

    <!-- ═══════════════════ STAT ═══════════════════ -->
    <section id="stat">
      <h2>Stat</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem">
        <AgalaStat label="Total Members" value="2,841" :trend="12.5" trend-label="vs last month" />
        <AgalaStat label="Active Now"    value="184"   :trend="3.2"  trend-label="vs yesterday" />
        <AgalaStat label="Churn Rate"    value="2.4%"  :trend="-0.8" trend-label="vs last month" />
        <AgalaStat label="MRR"           value="$18,420" :trend="0" trend-label="no change" />
      </div>

      <h2 style="margin-top: 1.5rem">Stat — Layout variants</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; max-width: 600px">
        <AgalaStat label="Turnos hoy" value="7" layout="row" icon="calendar" iconBg="primary" />
        <AgalaStat label="Pendientes" value="4" layout="row" icon="clock" iconBg="warning" />
        <AgalaStat label="Completados" value="12" layout="row" icon="check" iconBg="success" />
      </div>
      <div style="margin-top: 0.75rem">
        <AgalaStat label="Pacientes activos" value="248" layout="inline" />
        <AgalaStat label="Ingresos hoy" value="$1,420" layout="inline" />
      </div>
    </section>

    <!-- ═══════════════════ EMPTY STATE ═══════════════════ -->
    <section id="empty">
      <h2>EmptyState</h2>
      <AgalaCard style="max-width: 480px">
        <AgalaEmptyState
          title="No members found"
          description="Try adjusting your search or filters, or invite new members to get started."
        >
          <template #action>
            <AgalaButton size="sm">Invite member</AgalaButton>
          </template>
        </AgalaEmptyState>
      </AgalaCard>
    </section>

    <!-- ═══════════════════ PROGRESS ═══════════════════ -->
    <section id="progress">
      <h2>Progress — Linear</h2>
      <div class="stack" style="max-width: 480px; gap: 1rem">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: hsl(var(--agala-muted-foreground))">Value: {{ progressValue }}% — drag to change</p>
          <input type="range" min="0" max="100" v-model.number="progressValue" style="width: 100%; margin-bottom: 0.75rem" />
          <div class="stack" style="gap: 0.625rem">
            <AgalaProgress :value="progressValue" color="primary" size="sm" />
            <AgalaProgress :value="progressValue" color="success" size="md" />
            <AgalaProgress :value="progressValue" color="warning" size="lg" />
            <AgalaProgress :value="progressValue" color="danger"  size="md" />
          </div>
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: hsl(var(--agala-muted-foreground))">Indeterminate</p>
          <AgalaProgress indeterminate />
        </div>
      </div>

      <h2 style="margin-top: 2rem">Progress — Circular</h2>
      <div class="row" style="align-items: center; gap: 1.5rem">
        <AgalaProgress variant="circular" :value="progressValue" color="primary" size="sm" />
        <AgalaProgress variant="circular" :value="progressValue" color="success" size="md" />
        <AgalaProgress variant="circular" :value="progressValue" color="warning" size="lg" />
        <AgalaProgress variant="circular" :value="progressValue" color="danger"  size="lg" />
        <AgalaProgress variant="circular" indeterminate size="md" />
      </div>
    </section>

    <!-- ═══════════════════ TAG ═══════════════════ -->
    <section id="tag">
      <h2>Tag — Variants</h2>
      <div class="row" style="flex-wrap: wrap">
        <AgalaTag label="Default" />
        <AgalaTag label="Primary" variant="primary" />
        <AgalaTag label="Secondary" variant="secondary" />
        <AgalaTag label="Success" variant="success" />
        <AgalaTag label="Warning" variant="warning" />
        <AgalaTag label="Danger" variant="danger" />
        <AgalaTag label="Outline" variant="outline" />
      </div>

      <h2 style="margin-top: 1.5rem">Tag — Sizes + Removable</h2>
      <div class="row" style="flex-wrap: wrap">
        <AgalaTag
          v-for="(t, i) in tagList"
          :key="t.label"
          :label="t.label"
          :variant="t.variant"
          removable
          @remove="tagList.splice(i, 1)"
        />
        <AgalaTag label="Small" size="sm" removable />
        <AgalaTag label="Disabled" disabled removable />
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Click the × to remove. Removable tags emit a <code>remove</code> event.</p>
    </section>

    <!-- ═══════════════════ PAGINATION (Responsive) ═══════════════════ -->
    <section id="pagination">
      <h2>Pagination — Responsive</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Switches to compact mode (Prev / "Page X of Y" / Next) on viewports below 640 px.
      </p>
      <div class="row">
        <AgalaPagination v-model="currentPage" :total="120" :page-size="10" />
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Current page: <strong>{{ currentPage }}</strong> of 12</p>

      <h2 style="margin-top: 1.5rem">Pagination — Compact (forced)</h2>
      <div class="row">
        <AgalaPagination v-model="currentPage" :total="500" :page-size="10" :sibling-count="0" :show-edges="false" />
      </div>
    </section>

    <!-- ═══════════════════ DRAWER ═══════════════════ -->
    <section id="drawer">
      <h2>Drawer — Placements</h2>
      <div class="row">
        <AgalaButton variant="outline" @click="openDrawer('left')">Left</AgalaButton>
        <AgalaButton variant="outline" @click="openDrawer('right')">Right</AgalaButton>
        <AgalaButton variant="outline" @click="openDrawer('top')">Top</AgalaButton>
        <AgalaButton variant="outline" @click="openDrawer('bottom')">Bottom</AgalaButton>
      </div>
      <AgalaDrawer
        :open="drawerOpen"
        :placement="drawerPlacement"
        :title="`${drawerPlacement.charAt(0).toUpperCase() + drawerPlacement.slice(1)} Drawer`"
        @close="drawerOpen = false"
      >
        <div class="stack">
          <p style="margin: 0">
            Narrow the catalog by fulfillment state and warehouse.
          </p>
          <AgalaFormField label="Warehouse">
            <AgalaSelect
              v-model="searchCountry"
              :options="countryOptions"
              placeholder="All warehouses"
            />
          </AgalaFormField>
          <AgalaFormField
            label="SKU or product"
            helper="Partial matches are supported."
          >
            <AgalaInput placeholder="Search inventory…" />
          </AgalaFormField>
          <AgalaAlert
            variant="info"
            title="184 products available"
          >
            Filters apply to the current warehouse view.
          </AgalaAlert>
        </div>
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
    </section>

    <!-- ═══════════════════ FILE UPLOAD ═══════════════════ -->
    <section id="fileupload">
      <h2>FileUpload</h2>
      <div class="stack" style="max-width: 480px">
        <AgalaFileUpload
          v-model="uploadedFiles"
          multiple
          accept="image/*,.pdf"
          :max-size="2 * 1024 * 1024"
          :max-files="5"
          label="Upload documents"
          helper="Images and PDFs up to 2 MB, max 5 files"
          @change="files => toastManager.show({ message: `${files.length} file(s) added`, variant: 'default' })"
          @remove="file => toastManager.show({ message: `Removed ${file.name}`, variant: 'default' })"
          @error="msg => toastManager.show({ message: msg, variant: 'danger' })"
        />
        <AgalaFileUpload
          v-model="inlineUploadedFiles"
          variant="inline"
          accept="image/*,.pdf"
          helper="Inline variant for compact layouts"
          button-text="Attach file"
          @change="files => toastManager.show({ message: `${files.length} inline file(s) selected`, variant: 'default' })"
          @remove="file => toastManager.show({ message: `Removed ${file.name}`, variant: 'default' })"
          @error="msg => toastManager.show({ message: msg, variant: 'danger' })"
        />
      </div>
    </section>

    <!-- ═══════════════════ NAVBAR (Responsive) ═══════════════════ -->
    <section id="navbar">
      <h2>Navbar — Responsive</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Brand text truncates with ellipsis on narrow viewports.
      </p>
      <div style="border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); overflow: hidden">
        <AgalaNavbar>
          <template #brand>
            My Very Long Application Name
          </template>
          <AgalaButton variant="ghost" size="sm">Dashboard</AgalaButton>
          <AgalaButton variant="ghost" size="sm">Members</AgalaButton>
          <AgalaButton variant="ghost" size="sm">Settings</AgalaButton>
          <template #actions>
            <AgalaButton variant="outline" size="sm">Upgrade</AgalaButton>
            <AgalaAvatar fallback="JD" size="sm" />
          </template>
        </AgalaNavbar>
        <div style="padding: 1.25rem; font-size: 0.875rem; color: hsl(var(--agala-muted-foreground)); border-top: 1px solid hsl(var(--agala-border));">
          Page content goes here. Resize to &lt;640 px to see the brand name truncate with ellipsis.
        </div>
      </div>
    </section>

    <!-- ═══════════════════ SIDEBAR (Responsive) ═══════════════════ -->
    <section id="sidebar">
      <h2>Sidebar — Responsive sublevels</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Data-driven navigation with nested branches. Auto-collapses to icon-only on tablet (640–768 px). Hidden on mobile (&lt;640 px) — use the toggle to open the near-full-width Drawer.
      </p>
      <div style="border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); overflow: hidden">
        <AgalaNavbar>
          <template #brand>
            <AgalaSidebarToggle
              v-if="isMobileViewport"
              aria-controls="responsive-sidebar"
              :aria-expanded="sidebarOpen"
              @click="sidebarOpen = !sidebarOpen"
            />
            <AgalaButton
              v-else-if="isDesktopViewport"
              variant="ghost"
              size="icon"
              :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              :aria-expanded="!sidebarCollapsed"
              aria-controls="responsive-sidebar"
              @click="sidebarCollapsed = !sidebarCollapsed"
            >
              <AgalaIcon name="panel-left" :size="18" />
            </AgalaButton>
            <span style="font-weight: 600; font-size: 0.875rem; margin-left: 0.5rem">My App</span>
          </template>
          <AgalaButton variant="ghost" size="sm">Dashboard</AgalaButton>
          <AgalaButton variant="ghost" size="sm">Members</AgalaButton>
          <template #actions>
            <AgalaAvatar fallback="JD" size="sm" />
          </template>
        </AgalaNavbar>
        <div style="display: flex; height: 420px; border-top: 1px solid hsl(var(--agala-border));">
          <AgalaSidebar
            id="responsive-sidebar"
            :responsive="true"
            v-model:collapsed="sidebarCollapsed"
            v-model:open="sidebarOpen"
            v-model:active-value="sidebarActive"
            v-model:expanded="sidebarExpanded"
            :items="SIDEBAR_ITEMS"
          >
            <!-- No #header when paired with Navbar — app identity lives in Navbar #brand -->

            <template #footer="{ collapsed }">
              <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; padding: 0 0.25rem">
                <AgalaAvatar fallback="MA" size="sm" style="flex-shrink: 0" />
                <div v-if="!collapsed" style="display: flex; flex-direction: column; min-width: 0">
                  <span style="font-size: 0.75rem; font-weight: 600; white-space: nowrap">Mariana Acosta</span>
                  <span class="muted" style="font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap">Owner</span>
                </div>
              </div>
            </template>
          </AgalaSidebar>
          <div style="flex: 1; padding: 1.25rem; font-size: 0.875rem; color: hsl(var(--agala-muted-foreground))">
            Main content area. Resize the viewport to see responsive behavior:
            <ul style="margin: 0.5rem 0; padding-left: 1.25rem">
              <li><strong>Desktop (&gt;768 px):</strong> full sidebar with optional manual collapse.</li>
              <li><strong>Tablet (640–768 px):</strong> auto-collapses to icon-only (64 px) with tooltips.</li>
              <li><strong>Mobile (&lt;640 px):</strong> sidebar hidden; use the toggle to open a readable Drawer with expanded sublevels.</li>
            </ul>
            <p style="margin: 0.75rem 0 0">Active item: <strong>{{ sidebarActive }}</strong></p>
            <p style="margin: 0.25rem 0 0">Expanded: <strong>{{ sidebarExpanded.join(', ') || 'none' }}</strong></p>
          </div>
        </div>
      </div>
      <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Collapsed: {{ sidebarCollapsed }} · Drawer open: {{ sidebarOpen }}</p>
    </section>

    <!-- ═══════════════════ ACCORDION ═══════════════════ -->
    <section id="accordion">
      <h2>Accordion — Single open</h2>
      <AgalaAccordion style="max-width: 560px">
        <AgalaAccordionItem value="q1" title="What is Agala UI?">
          A zero-dependency Vue 3 component library with full design token theming. Drop it into any project and
          customize every color, radius, shadow, and font via CSS custom properties.
        </AgalaAccordionItem>
        <AgalaAccordionItem value="q2" title="Does it support dark mode?">
          Yes. All tokens respond to <code>prefers-color-scheme: dark</code> automatically. You can also force a
          theme by setting <code>data-theme</code> on the root element.
        </AgalaAccordionItem>
        <AgalaAccordionItem value="q3" title="Can I use a custom theme?">
          Absolutely. Override any token in your project's CSS. The named themes above demonstrate how one CSS file
          changes the entire look of the library.
        </AgalaAccordionItem>
        <AgalaAccordionItem value="q4" title="Disabled item (cannot open)" :disabled="true">
          This content is unreachable.
        </AgalaAccordionItem>
      </AgalaAccordion>

      <h2 style="margin-top: 2rem">Accordion — Multiple open</h2>
      <AgalaAccordion :multiple="true" style="max-width: 560px">
        <AgalaAccordionItem value="a" title="Section A">Content for section A. Multiple items can be open simultaneously.</AgalaAccordionItem>
        <AgalaAccordionItem value="b" title="Section B">Content for section B. Click any header to toggle independently.</AgalaAccordionItem>
        <AgalaAccordionItem value="c" title="Section C">Content for section C.</AgalaAccordionItem>
      </AgalaAccordion>
    </section>

    <!-- ═══════════════════ SKELETON ═══════════════════ -->
    <section id="skeleton">
      <h2>Skeleton — Variants</h2>
      <div class="stack" style="max-width: 480px; gap: 0.75rem">
        <AgalaSkeleton variant="line" />
        <AgalaSkeleton variant="line" width="60%" />
        <AgalaSkeleton variant="line" width="80%" />
        <AgalaSkeleton variant="rect" height="6rem" />
        <div style="display: flex; align-items: center; gap: 0.75rem">
          <AgalaSkeleton variant="circle" width="2.5rem" height="2.5rem" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem">
            <AgalaSkeleton variant="line" width="50%" />
            <AgalaSkeleton variant="line" width="75%" />
          </div>
        </div>
      </div>
      <p class="muted" style="margin-top: 0.75rem; font-size: 0.875rem">Shimmer animation. Use inside Table's loading state, Card loading states, or anywhere content is pending.</p>
    </section>

    <!-- ═══════════════════ TABS (Responsive) ═══════════════════ -->
    <section id="tabs">
      <h2>Tabs — Responsive</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Horizontal scroll on viewports below 640 px. Many tabs are shown below to exercise scrolling.
      </p>
      <AgalaTabs :tabs="TABS" v-model="activeTab">
        <template #panel-overview>
          <AgalaCard>
            <template #header>Overview</template>
            <p style="margin: 0">This is the overview panel. Rendered inside a Card for demonstration.</p>
          </AgalaCard>
        </template>
        <template #panel-members>
          <p style="margin: 0">Members panel content goes here.</p>
        </template>
        <template #panel-billing>
          <p style="margin: 0">Billing panel — invoices, payment methods, etc.</p>
        </template>
        <template #panel-analytics>
          <p style="margin: 0">Analytics panel — metrics and trends.</p>
        </template>
        <template #panel-activity>
          <p style="margin: 0">Activity panel — recent events and logs.</p>
        </template>
        <template #panel-security>
          <p style="margin: 0">Security panel — 2FA, sessions, and audit logs.</p>
        </template>
        <template #panel-integrations>
          <p style="margin: 0">Integrations panel — connected apps and webhooks.</p>
        </template>
        <template #panel-help>
          <p style="margin: 0">Help panel — documentation and support links.</p>
        </template>
      </AgalaTabs>
      <p class="muted" style="margin-top: 0.75rem; font-size: 0.875rem">Active tab: <strong>{{ activeTab }}</strong> · "Settings" is disabled.</p>
    </section>

    <section>
      <h2 style="margin-top: 1.5rem">Tabs — Pills variant</h2>
      <AgalaTabs variant="pills" :tabs="[{ value: 'a', label: 'Pendientes' }, { value: 'b', label: 'Historial' }, { value: 'c', label: 'Detalles' }]" v-model="activeTab">
        <template #panel-a><p style="margin: 0.5rem 0; font-size: 0.875rem">Pending items panel</p></template>
        <template #panel-b><p style="margin: 0.5rem 0; font-size: 0.875rem">History panel</p></template>
        <template #panel-c><p style="margin: 0.5rem 0; font-size: 0.875rem">Details panel</p></template>
      </AgalaTabs>
    </section>

    <!-- ═══════════════════ CARD ═══════════════════ -->
    <section id="card">
      <h2>Card — Padding Variants</h2>
      <div class="row" style="align-items: flex-start">
        <AgalaCard padding="sm" style="width: 180px">
          <template #header>Small</template>
          <p style="margin: 0; font-size: 0.875rem">padding: sm</p>
        </AgalaCard>
        <AgalaCard padding="md" style="width: 180px">
          <template #header>Medium</template>
          <p style="margin: 0; font-size: 0.875rem">padding: md (default)</p>
        </AgalaCard>
        <AgalaCard padding="lg" style="width: 180px">
          <template #header>Large</template>
          <p style="margin: 0; font-size: 0.875rem">padding: lg</p>
        </AgalaCard>
      </div>
      <h2 style="margin-top: 1.5rem">Card — With Footer</h2>
      <AgalaCard style="max-width: 360px">
        <template #header>Delete account</template>
        <p style="margin: 0; font-size: 0.875rem; color: hsl(var(--agala-muted-foreground))">
          This action is permanent and cannot be undone.
        </p>
        <template #footer>
          <AgalaButton variant="outline" size="sm">Cancel</AgalaButton>
          <AgalaButton variant="danger" size="sm">Delete</AgalaButton>
        </template>
      </AgalaCard>

      <h2 style="margin-top: 1.5rem">Card — Inset Accents</h2>
      <div class="row" style="align-items: flex-start">
        <AgalaCard accent="top" accent-color="primary" style="width: 180px">
          <template #header>Top Primary</template>
          <p style="margin: 0; font-size: 0.875rem">accent: top</p>
        </AgalaCard>
        <AgalaCard accent="left" accent-color="danger" style="width: 180px">
          <template #header>Left Danger</template>
          <p style="margin: 0; font-size: 0.875rem">accent: left</p>
        </AgalaCard>
        <AgalaCard accent="bottom" accent-color="success" style="width: 180px">
          <template #header>Bottom Success</template>
          <p style="margin: 0; font-size: 0.875rem">accent: bottom</p>
        </AgalaCard>
        <AgalaCard accent="right" accent-color="warning" style="width: 180px">
          <template #header>Right Warning</template>
          <p style="margin: 0; font-size: 0.875rem">accent: right</p>
        </AgalaCard>
        <AgalaCard accent="top" accent-color="#8b5cf6" style="width: 180px">
          <template #header>Custom Hex</template>
          <p style="margin: 0; font-size: 0.875rem">accentColor: #8b5cf6</p>
        </AgalaCard>
      </div>

      <h2 style="margin-top: 1.5rem">Card — Compact header</h2>
      <AgalaCard header-variant="compact" style="max-width: 400px">
        <template #header>Tipos de turno</template>
        <p style="margin: 0; font-size: 0.875rem">Content with compact header style.</p>
      </AgalaCard>
    </section>

    <!-- ═══════════════════ TOOLTIP ═══════════════════ -->
    <section id="tooltip">
      <h2>Tooltip — Placements</h2>
      <div class="row" style="gap: 2rem; justify-content: center; padding: 3rem 0">
        <AgalaTooltip content="Top tooltip" placement="top">
          <AgalaButton variant="outline" size="sm">Top</AgalaButton>
        </AgalaTooltip>
        <AgalaTooltip content="Bottom tooltip" placement="bottom">
          <AgalaButton variant="outline" size="sm">Bottom</AgalaButton>
        </AgalaTooltip>
        <AgalaTooltip content="Left tooltip" placement="left">
          <AgalaButton variant="outline" size="sm">Left</AgalaButton>
        </AgalaTooltip>
        <AgalaTooltip content="Right tooltip" placement="right">
          <AgalaButton variant="outline" size="sm">Right</AgalaButton>
        </AgalaTooltip>
        <AgalaTooltip content="Appears after 600ms" :delay="600">
          <AgalaButton variant="outline" size="sm">Slow (600ms)</AgalaButton>
        </AgalaTooltip>
      </div>
      <p class="muted" style="font-size: 0.875rem">Hover or focus any button. Delay defaults to 300ms.</p>
    </section>

    <!-- ═══════════════════ RADIO GROUP ═══════════════════ -->
    <section id="radio">
      <h2>RadioGroup</h2>
      <div class="row" style="align-items: flex-start; gap: 3rem">
        <div>
          <p style="margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600">Vertical (default)</p>
          <AgalaRadioGroup
            :options="NOTIFY_OPTIONS"
            v-model="radioNotify"
          />
          <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Selected: {{ radioNotify }}</p>
        </div>
        <div>
          <p style="margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600">Horizontal</p>
          <AgalaRadioGroup
            :options="[
              { value: 'h', label: 'Horizontal' },
              { value: 'v', label: 'Vertical' },
            ]"
            v-model="radioOrientation"
            orientation="horizontal"
          />
          <p class="muted" style="margin-top: 0.5rem; font-size: 0.875rem">Selected: {{ radioOrientation }}</p>
        </div>
        <div>
          <p style="margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600">Error state</p>
          <AgalaRadioGroup
            :options="[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]"
            v-model="radioError"
            :error="true"
          />
        </div>
        <div>
          <p style="margin: 0 0 0.75rem; font-size: 0.875rem; font-weight: 600">Disabled</p>
          <AgalaRadioGroup
            :options="[{ value: 'x', label: 'Option X' }, { value: 'y', label: 'Option Y' }]"
            model-value="x"
            :disabled="true"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════════════ SEGMENTED CONTROL ═══════════════════ -->
    <section id="segmented">
      <h2>SegmentedControl</h2>

      <div style="margin-bottom: 0.75rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Default — 4 options</p>
        <AgalaSegmentedControl :options="SEG_OPTIONS" v-model="segValue" />
        <p class="muted" style="font-size: 0.875rem; margin: 0.25rem 0 0">Selected: <strong>{{ segValue }}</strong></p>
      </div>

      <div style="margin-bottom: 0.75rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Per-option variants</p>
        <AgalaSegmentedControl :options="SEG_VARIANT_OPTIONS" v-model="segVariantsValue" />
        <p class="muted" style="font-size: 0.875rem; margin: 0.25rem 0 0">Selected: <strong>{{ segVariantsValue }}</strong></p>
      </div>

      <div style="margin-bottom: 0.75rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Sizes</p>
        <div class="row" style="margin: 0">
          <AgalaSegmentedControl v-for="s in (['sm', 'md', 'lg'] as const)" :key="s" :options="SEG_SIZE_OPTIONS" v-model="segSizeValue" :size="s" />
        </div>
      </div>

      <div style="margin-bottom: 0.75rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Disabled group</p>
        <AgalaSegmentedControl :options="SEG_OPTIONS" v-model="segValue" disabled />
      </div>

      <div style="margin-bottom: 0.75rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Disabled option (Option B)</p>
        <AgalaSegmentedControl :options="SEG_DISABLED_OPT" v-model="segValue" />
      </div>
    </section>

    <!-- ═══════════════════ LAYOUT PRIMITIVES ═══════════════════ -->
    <section id="layout">
      <h2>Layout Primitives</h2>
      <p class="muted" style="margin: 0 0 0.75rem; font-size: 0.875rem">
        Stack, HStack, VStack, Spacer, Divider, Center — build layouts without CSS.
      </p>

      <div style="margin-bottom: 1rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">VStack (vertical, gap 0.75rem)</p>
        <AgalaVStack gap="0.75rem" style="background: hsl(var(--agala-muted) / 0.3); padding: 0.75rem; border-radius: var(--agala-radius)">
          <div style="background: hsl(var(--agala-primary) / 0.1); padding: 0.5rem; border-radius: var(--agala-radius-sm)">Item 1</div>
          <div style="background: hsl(var(--agala-primary) / 0.1); padding: 0.5rem; border-radius: var(--agala-radius-sm)">Item 2</div>
          <div style="background: hsl(var(--agala-primary) / 0.1); padding: 0.5rem; border-radius: var(--agala-radius-sm)">Item 3</div>
        </AgalaVStack>
      </div>

      <div style="margin-bottom: 1rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">HStack (horizontal, gap 0.5rem) + Spacer</p>
        <AgalaHStack gap="0.5rem" style="background: hsl(var(--agala-muted) / 0.3); padding: 0.75rem; border-radius: var(--agala-radius)">
          <AgalaButton size="sm">Action</AgalaButton>
          <AgalaButton size="sm" variant="secondary">Cancel</AgalaButton>
          <AgalaSpacer />
          <AgalaBadge variant="success">Active</AgalaBadge>
        </AgalaHStack>
      </div>

      <div style="margin-bottom: 1rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Center (both axes)</p>
        <AgalaCenter style="height: 80px; background: hsl(var(--agala-muted) / 0.3); border-radius: var(--agala-radius)">
          <AgalaBadge variant="primary">Centered</AgalaBadge>
        </AgalaCenter>
      </div>

      <div style="margin-bottom: 1rem">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Divider (horizontal, with label)</p>
        <AgalaDivider label="Section" />
        <AgalaDivider label="Start" label-position="start" />
        <AgalaDivider label="End" label-position="end" />
      </div>

      <div style="margin-bottom: 1rem; height: 100px; display: flex">
        <p class="muted" style="margin: 0 0.5rem 0 0; font-size: 0.875rem">Divider (vertical):</p>
        <span>Left</span>
        <AgalaDivider orientation="vertical" />
        <span>Right</span>
      </div>
    </section>

    <!-- ═══════════════════ LIST GROUP ═══════════════════ -->
    <section id="listgroup">
      <h2>ListGroup</h2>
      <div style="max-width: 400px">
        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Default items with icon, subtitle, badge</p>
        <AgalaListGroup style="margin-bottom: 1rem">
          <AgalaListGroupItem icon="user" label="Profile" subtitle="Edit your personal information" @click="console.log('profile')" />
          <AgalaListGroupItem icon="bell" label="Notifications" subtitle="Manage alert preferences" badge="12" />
          <AgalaListGroupItem icon="settings" label="Settings" subtitle="App configuration" />
          <AgalaListGroupItem icon="lock" label="Privacy" subtitle="Security settings" badge="warning" badge-variant="warning" />
        </AgalaListGroup>

        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Disabled item + Danger variant</p>
        <AgalaListGroup style="margin-bottom: 1rem">
          <AgalaListGroupItem icon="credit-card" label="Billing" subtitle="Payment methods" />
          <AgalaListGroupItem icon="trash" label="Delete account" variant="danger" />
          <AgalaListGroupItem icon="flag" label="Archived" subtitle="Old records" disabled />
        </AgalaListGroup>

        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Custom content via slots (dot + rich text + trailing Badge)</p>
        <AgalaListGroup>
          <AgalaListGroupItem>
            <template #leading>
              <span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--agala-danger));flex-shrink:0;margin:0.25rem 0" />
            </template>
            <div>
              <span style="font-weight:600;font-size:0.875rem">Alergias</span>
              <p style="margin:0;font-size:0.75rem;color:hsl(var(--agala-muted-foreground))">Penicilina, Ibuprofeno — reacción anafiláctica</p>
            </div>
            <template #trailing>
              <span style="display:inline-flex;align-items:center;justify-content:center;min-width:1.25rem;height:1.25rem;padding:0 0.375rem;border-radius:99px;background:hsl(var(--agala-danger) / 0.1);color:hsl(var(--agala-danger));font-size:0.6875rem;font-weight:600">2</span>
            </template>
          </AgalaListGroupItem>
          <AgalaListGroupItem>
            <template #leading>
              <span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--agala-warning));flex-shrink:0;margin:0.25rem 0" />
            </template>
            <div>
              <span style="font-weight:600;font-size:0.875rem">Medicamentos</span>
              <p style="margin:0;font-size:0.75rem;color:hsl(var(--agala-muted-foreground))">Enalapril 10mg diario</p>
            </div>
          </AgalaListGroupItem>
          <AgalaListGroupItem>
            <template #leading>
              <span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--agala-primary));flex-shrink:0;margin:0.25rem 0" />
            </template>
            <div>
              <span style="font-weight:600;font-size:0.875rem">Observaciones</span>
              <p style="margin:0;font-size:0.75rem;color:hsl(var(--agala-muted-foreground))">Paciente colaboradora. Buena higiene bucal.</p>
            </div>
            <template #trailing>
              <span style="display:inline-flex;align-items:center;justify-content:center;min-width:1.25rem;height:1.25rem;padding:0 0.375rem;border-radius:99px;background:hsl(var(--agala-primary) / 0.1);color:hsl(var(--agala-primary));font-size:0.6875rem;font-weight:600">3</span>
            </template>
          </AgalaListGroupItem>
        </AgalaListGroup>

        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">With gap (separated items)</p>
        <AgalaListGroup gap="6px" style="background: hsl(var(--agala-muted) / 0.3); padding: 0.5rem; border-radius: var(--agala-radius)">
          <AgalaListGroupItem icon="user" label="Profile" subtitle="Edit your info" style="border-radius: var(--agala-radius-sm)" />
          <AgalaListGroupItem icon="bell" label="Notifications" badge="12" style="border-radius: var(--agala-radius-sm)" />
          <AgalaListGroupItem icon="settings" label="Settings" style="border-radius: var(--agala-radius-sm)" />
        </AgalaListGroup>

        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem">Borderless (embeds inside other containers)</p>
        <div style="background: hsl(var(--agala-muted) / 0.3); padding: 0.75rem; border-radius: var(--agala-radius)">
          <AgalaListGroup borderless>
            <AgalaListGroupItem icon="user" label="Profile" subtitle="Edit your info" />
            <AgalaListGroupItem icon="bell" label="Notifications" badge="12" />
            <AgalaListGroupItem icon="settings" label="Settings" />
          </AgalaListGroup>
        </div>

        <p class="muted" style="margin: 0 0 0.5rem; font-size: 0.875rem; margin-top: 1rem">Cards variant</p>
        <AgalaListGroup variant="cards" style="max-width: 400px">
          <AgalaListGroupItem icon="user" label="Profile" subtitle="Edit your info" />
          <AgalaListGroupItem icon="bell" label="Notifications" badge="12" />
          <AgalaListGroupItem icon="settings" label="Settings" />
        </AgalaListGroup>
      </div>
    </section>

    <!-- ─── Alert ─── -->
    <section id="alert">
      <h2>Alert — Variants</h2>
      <div class="stack" style="max-width: 600px">
        <AgalaAlert variant="info">This is an informational message.</AgalaAlert>
        <AgalaAlert variant="success">Your changes have been saved successfully.</AgalaAlert>
        <AgalaAlert variant="warning">Your session will expire in 5 minutes.</AgalaAlert>
        <AgalaAlert variant="danger">An error occurred while processing your request.</AgalaAlert>
      </div>

      <h2 style="margin-top: 1.5rem">Alert — With Title</h2>
      <div class="stack" style="max-width: 600px">
        <AgalaAlert variant="info" title="Did you know?">
          You can customize the entire look of your dashboard using the theme settings.
        </AgalaAlert>
        <AgalaAlert variant="success" title="All good!">
          Your profile has been updated and changes are now live.
        </AgalaAlert>
        <AgalaAlert variant="warning" title="Heads up">
          You have used 85% of your storage quota. Consider upgrading your plan.
        </AgalaAlert>
        <AgalaAlert variant="danger" title="Update failed">
          The system encountered an unexpected error. Please try again later.
        </AgalaAlert>
      </div>

      <h2 style="margin-top: 1.5rem">Alert — Dismissible</h2>
      <div class="stack" style="max-width: 600px">
        <AgalaAlert variant="info" title="Welcome back!" dismissible>
          You have 3 new notifications waiting for you.
        </AgalaAlert>
        <AgalaAlert variant="warning" dismissible>
          This alert can be dismissed by clicking the × button.
        </AgalaAlert>
      </div>

      <h2 style="margin-top: 1.5rem">Alert — Flat (icon + text, minimal)</h2>
      <div class="stack" style="max-width: 600px">
        <AgalaAlert variant="info" flat>New updates are available.</AgalaAlert>
        <AgalaAlert variant="success" flat>Changes saved.</AgalaAlert>
        <AgalaAlert variant="warning" flat>Session expires in 5 minutes.</AgalaAlert>
        <AgalaAlert variant="danger" flat>Connection lost. Reconnecting…</AgalaAlert>
      </div>

      <h2 style="margin-top: 1.5rem">
        Alert — Icon control
      </h2>
      <div class="stack" style="max-width: 600px">
        <AgalaAlert
          variant="info"
          icon="bell"
          title="Notifications paused"
        >
          Re-enable notifications when the maintenance window ends.
        </AgalaAlert>
        <AgalaAlert
          variant="warning"
          :icon="false"
        >
          Inventory counts have not been reconciled today.
        </AgalaAlert>
      </div>
    </section>

  </div>
</template>

<style scoped>
.playground {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: var(--agala-font-sans);
  color: hsl(var(--agala-foreground));
}

.playground > header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: var(--agala-letter-spacing-tight);
  margin: 0 0 0.5rem;
}

.playground > header > p {
  color: hsl(var(--agala-muted-foreground));
  margin: 0;
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem;
}


section {
  margin-bottom: 3rem;
  scroll-margin-top: 1.5rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.muted {
  color: hsl(var(--agala-muted-foreground));
}

/* ─── Floating left nav ─── */
.playground-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 160px;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  background: hsl(var(--agala-card));
  border-right: 1px solid hsl(var(--agala-border));
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.playground-nav__title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: hsl(var(--agala-muted-foreground));
  margin-bottom: 0.375rem;
  padding: 0 0.375rem;
}
.playground-nav a {
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--agala-muted-foreground));
  text-decoration: none;
  padding: 0.25rem 0.375rem;
  border-radius: var(--agala-radius-sm);
  transition: color var(--agala-transition-fast), background var(--agala-transition-fast);
}
.playground-nav a:hover {
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-muted));
}
.playground-nav a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--agala-ring));
}

.playground {
  margin-left: 160px;
}

@media (max-width: 768px) {
  .playground-nav {
    display: none;
  }
  .playground {
    margin-left: 0;
  }
}


/* ─── Theme switcher bar ─── */
.themebar {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.5rem 0.375rem 0.75rem;
  background: hsl(var(--agala-card));
  border: 1px solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) + 4px);
  box-shadow: var(--agala-shadow-md);
  transition: background var(--agala-transition-base), border-color var(--agala-transition-base);
}

.themebar__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: hsl(var(--agala-muted-foreground));
  user-select: none;
}

.themebar__pills {
  display: flex;
  gap: 0.25rem;
}

.themebar__pill {
  padding: 0.25rem 0.625rem;
  border: 1px solid transparent;
  border-radius: calc(var(--agala-radius));
  font-family: var(--agala-font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--agala-muted-foreground));
  background: transparent;
  cursor: pointer;
  transition: all var(--agala-transition-fast);
}

.themebar__pill:hover {
  color: hsl(var(--agala-foreground));
  background: hsl(var(--agala-accent));
}

.themebar__pill--active {
  background: hsl(var(--agala-primary));
  color: hsl(var(--agala-primary-foreground));
  border-color: transparent;
}

/* ─── Theme Tester ─── */
</style>
