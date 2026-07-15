export interface ApiProp {
  name: string
  type: string
  default?: string
  description: string
}

export interface ComponentMeta {
  slug: string
  name: string
  exports: string[]
  description: string
  props: ApiProp[]
  events?: string[]
  slots?: string[]
  accessibility: string
  snippet: string
}

const p = (name: string, type: string, description: string, defaultValue?: string): ApiProp => ({
  name, type, description, default: defaultValue,
})

export const components: ComponentMeta[] = [
  {
    slug: 'button', name: 'Button', exports: ['AgalaButton'], description: 'Triggers an action or submits a form.',
    props: [p('variant', "'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'", 'Visual emphasis.', "'default'"), p('size', "'sm' | 'md' | 'lg' | 'icon'", 'Control size.', "'md'"), p('type', "'button' | 'submit' | 'reset'", 'Native button type.', "'button'"), p('loading', 'boolean', 'Shows progress and prevents repeated activation.', 'false'), p('block', 'boolean', 'Fills the available width.', 'false'), p('icon', 'string', 'Leading Agala icon name.'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — button label'], accessibility: 'Uses a native button. Loading and disabled states prevent activation; icon-only buttons need an accessible name.',
    snippet: `<AgalaButton icon="plus">Create project</AgalaButton>`,
  },
  {
    slug: 'input', name: 'Input', exports: ['AgalaInput'], description: 'Captures a single line of text with optional icons and validation.',
    props: [p('modelValue', 'string', 'Value used by v-model.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('variant', "'default' | 'ghost'", 'Visual treatment.', "'default'"), p('type', 'string', 'Native input type.', "'text'"), p('placeholder', 'string', 'Placeholder text.'), p('iconStart / iconEnd', 'string', 'Agala icon names.'), p('iconEndActionable', 'boolean', 'Makes the trailing icon interactive.', 'false'), p('error', 'boolean', 'Sets invalid styling.', 'false'), p('errorMessage', 'string', 'Inline error copy.'), p('disabled / readonly', 'boolean', 'Native input states.', 'false')],
    events: ['update:modelValue(value: string)', 'icon-end-click'], accessibility: 'For a visible label, pair with FormField. Invalid state is exposed with aria-invalid.',
    snippet: `<AgalaInput v-model="email" type="email" icon-start="mail" placeholder="you@example.com" />`,
  },
  {
    slug: 'form-field', name: 'Form Field', exports: ['AgalaFormField'], description: 'Associates a control with its label, helper copy, and error message.',
    props: [p('label', 'string', 'Visible field label.'), p('helper', 'string', 'Supporting text.'), p('error', 'string', 'Validation message.'), p('htmlFor', 'string', 'ID of the nested control.'), p('required', 'boolean', 'Marks the label as required.', 'false'), p('disabled', 'boolean', 'Styles the field as disabled.', 'false')],
    slots: ['default — form control'], accessibility: 'Set htmlFor to the nested control ID; keep validation copy specific and recoverable.',
    snippet: `<AgalaFormField label="Email" html-for="email" required>\n  <AgalaInput id="email" v-model="email" />\n</AgalaFormField>`,
  },
  {
    slug: 'select', name: 'Select', exports: ['AgalaSelect'], description: 'Selects one or more values from searchable, grouped options.',
    props: [p('options', 'SelectOption[]', 'Required option collection.'), p('modelValue', 'string | string[]', 'Selected value(s).'), p('multiple', 'boolean', 'Enables multi-select.', 'false'), p('searchable', 'boolean', 'Shows filtering input.', 'false'), p('clearable', 'boolean', 'Allows clearing the selection.', 'false'), p('loading', 'boolean', 'Shows a loading state.', 'false'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('placeholder', 'string', 'Empty selection copy.'), p('maxDisplayed', 'number', 'Maximum visible chips.'), p('maxSelections', 'number', 'Selection limit.'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.')],
    events: ['update:modelValue(value)', 'search(query: string)'], accessibility: 'Implements combobox/listbox semantics with keyboard navigation, selected state, and expanded state.',
    snippet: `<AgalaSelect v-model="country" :options="countries" searchable clearable />`,
  },
  {
    slug: 'creatable-select', name: 'Creatable Select', exports: ['AgalaCreatableSelect'], description: 'Builds a multi-value selection and can create missing options.',
    props: [p('options', 'CreatableSelectOption[]', 'Required options.'), p('modelValue', 'string[]', 'Selected IDs.'), p('creatable', 'boolean', 'Allows new values.', 'true'), p('labelKey / idKey', 'string', 'Keys used for custom records.'), p('maxDisplayed', 'number', 'Maximum visible chips.'), p('debounce', 'number', 'Search debounce in milliseconds.'), p('disabled', 'boolean', 'Disables interaction.', 'false')],
    events: ['update:modelValue(values: string[])', 'create(text: string)', 'search(query: string)'], accessibility: 'Supports combobox keyboard navigation and announces selected chips through native labels.',
    snippet: `<AgalaCreatableSelect v-model="skills" :options="options" creatable @create="addSkill" />`,
  },
  {
    slug: 'date-picker', name: 'Date Picker', exports: ['AgalaDatePicker'], description: 'Selects an ISO date through a popover or inline calendar.',
    props: [p('modelValue', 'string', 'ISO date used by v-model.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('min / max', 'string', 'ISO date bounds.'), p('clearable', 'boolean', 'Allows clearing.', 'false'), p('inline', 'boolean', 'Always displays the calendar.', 'false'), p('highlightDates', 'string[]', 'ISO dates to emphasize.'), p('displayMonth', 'string', 'Controlled YYYY-MM display month.'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.')],
    events: ['update:modelValue(date: string)', 'update:displayMonth(month: string)'], accessibility: 'Calendar grid supports arrow keys, Home/End, Enter, Space, and Escape.',
    snippet: `<AgalaDatePicker v-model="date" min="2026-01-01" clearable />`,
  },
  {
    slug: 'color-picker', name: 'Color Picker', exports: ['AgalaColorPicker'], description: 'Selects a color visually or through a hexadecimal value.',
    props: [p('modelValue', 'string', 'Hex color used by v-model.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('placeholder', 'string', 'Empty value copy.'), p('clearable', 'boolean', 'Allows clearing.', 'false'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.')],
    events: ['update:modelValue(value: string)'], accessibility: 'Exposes manual hex entry in addition to pointer-driven color controls.',
    snippet: `<AgalaColorPicker v-model="brandColor" clearable />`,
  },
  {
    slug: 'checkbox', name: 'Checkbox', exports: ['AgalaCheckbox'], description: 'Toggles a boolean choice, including indeterminate state.',
    props: [p('modelValue', 'boolean', 'Checked state used by v-model.'), p('label', 'string', 'Visible label.'), p('indeterminate', 'boolean', 'Displays mixed state.', 'false'), p('error', 'boolean', 'Sets invalid styling.', 'false'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(value: boolean)'], accessibility: 'Uses checkbox semantics and exposes mixed state with aria-checked.',
    snippet: `<AgalaCheckbox v-model="accepted" label="Accept terms" />`,
  },
  {
    slug: 'radio-group', name: 'Radio Group', exports: ['AgalaRadioGroup'], description: 'Selects exactly one value from a related option set.',
    props: [p('options', 'RadioOption[]', 'Required option collection.'), p('modelValue', 'string', 'Selected value.'), p('orientation', "'vertical' | 'horizontal'", 'Layout direction.', "'vertical'"), p('error', 'boolean', 'Sets invalid styling.', 'false'), p('disabled', 'boolean', 'Disables the group.', 'false')],
    events: ['update:modelValue(value: string)'], accessibility: 'Uses radiogroup and radio semantics; disabled options remain understandable but unavailable.',
    snippet: `<AgalaRadioGroup v-model="plan" :options="plans" orientation="horizontal" />`,
  },
  {
    slug: 'textarea', name: 'Textarea', exports: ['AgalaTextarea'], description: 'Captures multi-line plain text.',
    props: [p('modelValue', 'string', 'Value used by v-model.'), p('rows', 'number', 'Visible text rows.'), p('resize', "'none' | 'vertical' | 'both'", 'Resize behavior.', "'vertical'"), p('placeholder', 'string', 'Placeholder copy.'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.'), p('disabled', 'boolean', 'Disables editing.', 'false')],
    events: ['update:modelValue(value: string)'], accessibility: 'Pair with FormField for a persistent label and clear error relationship.',
    snippet: `<AgalaTextarea v-model="notes" :rows="5" placeholder="Add notes" />`,
  },
  {
    slug: 'markdown-editor', name: 'Markdown Editor', exports: ['AgalaMarkdownEditor', 'AgalaMarkdownPreview'], description: 'Edits and safely previews a focused subset of Markdown.',
    props: [p('modelValue', 'string', 'Markdown source.'), p('preview', "'tab' | 'split' | 'none'", 'Preview presentation.', "'tab'"), p('toolbar', 'boolean', 'Shows formatting actions.', 'true'), p('rows', 'number', 'Editor height in rows.'), p('maxlength / showCount', 'number / boolean', 'Length limit and counter.'), p('disabled', 'boolean', 'Disables editing.', 'false'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.'), p('source', 'string', 'MarkdownPreview source.')],
    events: ['update:modelValue(value: string)'], slots: ['No public slots'], accessibility: 'Toolbar controls have labels; preview exposes a configurable accessible label.',
    snippet: `<AgalaMarkdownEditor v-model="description" preview="split" />`,
  },
  {
    slug: 'toggle', name: 'Toggle', exports: ['AgalaToggle'], description: 'Switches a persistent boolean setting.',
    props: [p('modelValue', 'boolean', 'State used by v-model.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(value: boolean)'], accessibility: 'Uses switch semantics and supports Space/Enter keyboard activation.',
    snippet: `<AgalaToggle v-model="notifications" />`,
  },
  {
    slug: 'file-upload', name: 'File Upload', exports: ['AgalaFileUpload'], description: 'Selects files through an inline action or drag-and-drop surface.',
    props: [p('modelValue', 'FileItem[]', 'Files used by v-model.'), p('variant', "'dropzone' | 'inline'", 'Presentation.', "'dropzone'"), p('accept', 'string', 'Accepted MIME types/extensions.'), p('multiple', 'boolean', 'Allows multiple files.', 'false'), p('maxSize / maxFiles', 'number', 'Size and count constraints.'), p('label / helper', 'string', 'Visible field copy.'), p('dragText / browseText / buttonText', 'string', 'Action copy.'), p('disabled', 'boolean', 'Disables selection.', 'false')],
    events: ['update:modelValue(files: FileItem[])', 'change(files)', 'remove(file)', 'error(message)'], accessibility: 'Retains a keyboard-operable native file input behind the custom surface.',
    snippet: `<AgalaFileUpload v-model="files" accept="image/*" multiple :max-files="4" />`,
  },
  {
    slug: 'segmented-control', name: 'Segmented Control', exports: ['AgalaSegmentedControl'], description: 'Switches between a small set of peer views or modes.',
    props: [p('options', 'SegmentedControlOption[]', 'Choices support label, icon, semantic variant, and disabled state.'), p('modelValue', 'string', 'Selected value.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('block', 'boolean', 'Fills the container and shares width across options.', 'false'), p('ariaLabel', 'string', 'Accessible group name.', "'Options'"), p('disabled', 'boolean', 'Disables all choices.', 'false'), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(value: string)'], slots: ['option-<value> — receives { option, selected }'], accessibility: 'Uses a named horizontal radiogroup. Arrow keys and Home/End move focus and selection while skipping disabled choices.',
    snippet: `<AgalaSegmentedControl v-model="view" :options="views" />`,
  },
  {
    slug: 'alert', name: 'Alert', exports: ['AgalaAlert'], description: 'Communicates contextual status or a recoverable issue.',
    props: [p('variant', "'info' | 'success' | 'warning' | 'danger'", 'Semantic status.', "'info'"), p('title', 'string', 'Optional heading.'), p('dismissible', 'boolean', 'Shows an internal close action.', 'false'), p('flat', 'boolean', 'Removes the bordered surface.', 'false'), p('icon', 'string | false', 'Overrides or hides the icon.'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — alert body'], accessibility: 'Uses semantic status styling; urgent messages should be announced by the consuming workflow when appropriate.',
    snippet: `<AgalaAlert variant="warning" title="Sync delayed">Review the connection before retrying.</AgalaAlert>`,
  },
  {
    slug: 'badge', name: 'Badge', exports: ['AgalaBadge'], description: 'Labels compact status or metadata.',
    props: [p('variant', "'default' | 'secondary' | 'outline' | 'subtle' | 'success' | 'warning' | 'danger'", 'Visual/semantic treatment.', "'default'"), p('size', "'sm' | 'md'", 'Badge size.', "'md'"), p('dot', 'boolean', 'Shows a status dot.', 'false'), p('color', 'string', 'Custom color override.'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — badge label'], accessibility: 'Do not communicate status through color alone; keep the slot label meaningful.',
    snippet: `<AgalaBadge variant="success" dot>Active</AgalaBadge>`,
  },
  {
    slug: 'drawer', name: 'Drawer', exports: ['AgalaDrawer'], description: 'Presents a focused task from an edge of the viewport.',
    props: [p('open', 'boolean', 'Required controlled visibility.'), p('title', 'string', 'Visible and accessible drawer heading.'), p('placement', "'left' | 'right' | 'top' | 'bottom'", 'Viewport edge.', "'right'"), p('size', 'string', 'CSS size value, clamped to the viewport.'), p('dismissible', 'boolean', 'Allows backdrop dismissal and shows the close button.', 'true'), p('escapeCloses', 'boolean', 'Allows Escape dismissal independently.', 'true'), p('class', 'string', 'Consumer override class.')],
    events: ['close'], slots: ['header', 'default', 'footer — receives { close }'], accessibility: 'Traps focus while open, restores the opener, locks background scrolling, and respects reduced motion.',
    snippet: `<AgalaDrawer :open="open" title="Inventory filters" @close="open = false">…</AgalaDrawer>`,
  },
  {
    slug: 'modal', name: 'Modal', exports: ['AgalaModal', 'AgalaModalProvider', 'modalManager'], description: 'Presents a blocking decision either declaratively or through the modal manager.',
    props: [p('open', 'boolean', 'Visibility used by v-model:open.'), p('title', 'string', 'Dialog heading.'), p('size', "'sm' | 'md' | 'lg' | 'xl' | 'full'", 'Dialog width.', "'md'"), p('dismissible', 'boolean', 'Allows outside-click dismissal.', 'true'), p('escapeCloses', 'boolean', 'Allows Escape dismissal.', 'true'), p('hideHeader', 'boolean', 'Hides the built-in header.', 'false')],
    events: ['update:open(value: boolean)', 'close'], slots: ['default', 'footer — receives { close }'], accessibility: 'Traps and restores focus. Mount exactly one ModalProvider when using modalManager.',
    snippet: `<AgalaModal v-model:open="open" title="Archive record">Confirm the action.</AgalaModal>`,
  },
  {
    slug: 'toast', name: 'Toast', exports: ['AgalaToastProvider', 'toastManager'], description: 'Displays brief, non-blocking feedback from a single root provider.',
    props: [p('message', 'string', 'Required toast message.'), p('variant', "'default' | 'success' | 'warning' | 'danger'", 'Semantic treatment.', "'default'"), p('duration', 'number', 'Visible duration in milliseconds; 0 persists.'), p('action', '{ label; onClick }', 'Optional toast action.')],
    accessibility: 'Mount one ToastProvider. Keep messages concise and do not use a toast as the only location for recoverable form errors.',
    snippet: `toastManager.show({ message: 'Changes saved', variant: 'success' })`,
  },
  {
    slug: 'tooltip', name: 'Tooltip', exports: ['AgalaTooltip'], description: 'Adds brief supporting text to a hoverable or focusable trigger.',
    props: [p('content', 'string', 'Required tooltip copy.'), p('placement', "'top' | 'bottom' | 'left' | 'right'", 'Preferred placement.', "'top'"), p('delay', 'number', 'Open delay in milliseconds.'), p('block', 'boolean', 'Makes the trigger wrapper block-level.', 'false'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — trigger'], accessibility: 'Opens on keyboard focus as well as hover and connects content to the trigger.',
    snippet: `<AgalaTooltip content="Copy link"><AgalaButton size="icon" icon="link" aria-label="Copy link" /></AgalaTooltip>`,
  },
  {
    slug: 'progress', name: 'Progress', exports: ['AgalaProgress'], description: 'Shows determinate or indeterminate task progress.',
    props: [p('value', 'number', 'Progress from 0 to 100.'), p('variant', "'linear' | 'circular'", 'Presentation.', "'linear'"), p('size', "'sm' | 'md' | 'lg'", 'Indicator size.', "'md'"), p('color', "'primary' | 'success' | 'warning' | 'danger'", 'Semantic color.', "'primary'"), p('indeterminate', 'boolean', 'Shows unknown progress.', 'false')],
    accessibility: 'Exposes progressbar semantics and the determinate value when known.',
    snippet: `<AgalaProgress :value="72" color="success" />`,
  },
  {
    slug: 'skeleton', name: 'Skeleton', exports: ['AgalaSkeleton'], description: 'Reserves content geometry while data is loading.',
    props: [p('variant', "'line' | 'circle' | 'rect'", 'Placeholder shape.', "'line'"), p('width / height', 'string', 'CSS dimensions.'), p('class', 'string', 'Consumer override class.')],
    accessibility: 'Mark the surrounding loading region busy; skeletons themselves are decorative.',
    snippet: `<AgalaSkeleton variant="rect" width="100%" height="8rem" />`,
  },
  {
    slug: 'empty-state', name: 'Empty State', exports: ['AgalaEmptyState'], description: 'Explains an empty collection and offers the next useful action.',
    props: [p('title', 'string', 'Required state title.'), p('description', 'string', 'Supporting explanation.'), p('class', 'string', 'Consumer override class.')],
    slots: ['icon', 'action'], accessibility: 'Keep the title explicit and ensure the action is reachable in normal reading order.',
    snippet: `<AgalaEmptyState title="No projects" description="Create a project to get started."><template #action><AgalaButton>Create project</AgalaButton></template></AgalaEmptyState>`,
  },
  {
    slug: 'dev-env-banner', name: 'Dev Environment Banner', exports: ['AgalaDevEnvBanner'], description: 'Warns users that they are viewing a non-production environment.',
    props: [p('text', 'string', 'Banner message.'), p('class', 'string', 'Consumer override class.')],
    accessibility: 'Uses visible text and a labeled dismiss action rather than relying on color alone.',
    snippet: `<AgalaDevEnvBanner text="Preview environment — data resets daily." />`,
  },
  {
    slug: 'accordion', name: 'Accordion', exports: ['AgalaAccordion', 'AgalaAccordionItem'], description: 'Reveals related sections without leaving the current page.',
    props: [p('multiple', 'boolean', 'Allows more than one open item.', 'false'), p('value', 'string', 'Required item identity.'), p('title', 'string', 'Required item heading.'), p('disabled', 'boolean', 'Disables an item.', 'false'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — AccordionItem children / item content'], accessibility: 'Headers are keyboard-operable buttons with expanded and controls relationships.',
    snippet: `<AgalaAccordion><AgalaAccordionItem value="billing" title="Billing">…</AgalaAccordionItem></AgalaAccordion>`,
  },
  {
    slug: 'dropdown-menu', name: 'Dropdown Menu', exports: ['AgalaDropdownMenu'], description: 'Offers a compact list of contextual commands.',
    props: [p('items', 'DropdownMenuItem[]', 'Required command collection.'), p('placement', "'bottom-start' | 'bottom-end'", 'Menu alignment.', "'bottom-start'"), p('class', 'string', 'Consumer override class.')],
    slots: ['trigger'], accessibility: 'Supports Arrow keys, Enter, Escape, outside click, and disabled menu items.',
    snippet: `<AgalaDropdownMenu :items="actions"><template #trigger><AgalaButton variant="outline">Actions</AgalaButton></template></AgalaDropdownMenu>`,
  },
  {
    slug: 'navbar', name: 'Navbar', exports: ['AgalaNavbar'], description: 'Aligns brand, primary navigation, and top-level actions.',
    props: [p('class', 'string', 'Consumer override class.')], slots: ['brand', 'default — navigation', 'actions'], accessibility: 'Use semantic links inside the navigation region and label icon-only actions.',
    snippet: `<AgalaNavbar><template #brand>Acme</template><a href="/projects">Projects</a><template #actions><AgalaButton>New</AgalaButton></template></AgalaNavbar>`,
  },
  {
    slug: 'pagination', name: 'Pagination', exports: ['AgalaPagination'], description: 'Moves through a known number of paginated records.',
    props: [p('total', 'number', 'Required record count.'), p('modelValue', 'number', 'Required current page.'), p('pageSize', 'number', 'Records per page.'), p('siblingCount', 'number', 'Adjacent page buttons.'), p('showEdges', 'boolean', 'Shows first/last controls.', 'false'), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(page: number)'], accessibility: 'Uses labeled navigation and exposes the current page; mobile layout stays touch-friendly.',
    snippet: `<AgalaPagination v-model="page" :total="240" :page-size="20" show-edges />`,
  },
  {
    slug: 'sidebar', name: 'Sidebar', exports: ['AgalaSidebar', 'AgalaSidebarGroup', 'AgalaSidebarItem', 'AgalaSidebarToggle'], description: 'Navigates hierarchical product areas across desktop and mobile.',
    props: [p('items', 'SidebarNode[]', 'Data-driven navigation tree.'), p('activeValue', 'string', 'Selected item.'), p('expanded / defaultExpanded', 'string[]', 'Controlled or initial open branches.'), p('collapsed', 'boolean', 'Desktop collapsed state.'), p('open', 'boolean', 'Mobile drawer state.'), p('responsive', 'boolean', 'Enables responsive behavior.', 'false'), p('indent', "'compact' | 'comfortable'", 'Nested density.'), p('width / collapsedWidth', 'string', 'CSS widths.')],
    events: ['update:activeValue', 'update:expanded', 'update:collapsed', 'update:open', 'select(value)'], slots: ['default', 'SidebarItem: icon and default'], accessibility: 'Tree branches expose expansion state; use SidebarToggle with aria-controls for mobile or collapsed navigation.',
    snippet: `<AgalaSidebar v-model:active-value="active" v-model:expanded="expanded" :items="items" responsive />`,
  },
  {
    slug: 'table', name: 'Table', exports: ['AgalaTable'], description: 'Displays sortable, selectable tabular records with loading and empty states.',
    props: [p('columns', 'TableColumn[]', 'Definitions support width, minWidth, alignment, and sorting.'), p('rows', 'Record<string, unknown>[]', 'Required records.'), p('rowKey', 'string', 'Unique record key.'), p('variant', "'default' | 'clean' | 'minimal'", 'Border and surface treatment.'), p('density', "'comfortable' | 'compact'", 'Row spacing.', "'comfortable'"), p('selectable', 'boolean', 'Enables row selection.', 'false'), p('selectedRows', 'string[]', 'Selected keys.'), p('sortKey / sortDir', "string / 'asc' | 'desc'", 'Controlled sorting.'), p('interactiveRows', 'boolean', 'Adds keyboard row activation.', 'false'), p('stickyHeader / stickyFirstColumn', 'boolean', 'Pins context inside the table scroller.', 'false'), p('loading / loadingRows', 'boolean / number', 'Shows a deterministic loading layout.', 'false / 5'), p('emptyMessage', 'string', 'Empty collection copy.')],
    events: ['update:selectedRows', 'update:sortKey', 'update:sortDir', 'row-click(row)'], slots: ['cell-<key>', 'empty', 'footer'], accessibility: 'Uses semantic table markup, announces sorting and selection, and makes rows keyboard-operable only when interactiveRows is enabled.',
    snippet: `<AgalaTable :columns="columns" :rows="members" row-key="id" />`,
  },
  {
    slug: 'tabs', name: 'Tabs', exports: ['AgalaTabs'], description: 'Switches among related panels while preserving context.',
    props: [p('tabs', 'TabItem[]', 'Required tab definitions.'), p('modelValue', 'string', 'Required active tab.'), p('variant', "'underline' | 'pills'", 'Visual treatment.', "'underline'"), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(value: string)'], slots: ['panel-<value>', 'tab-<value> — receives { tab, active }'], accessibility: 'Implements tablist, tab, and tabpanel relationships. Arrow keys, Home, and End move focus and skip disabled tabs.',
    snippet: `<AgalaTabs v-model="tab" :tabs="tabs"><template #panel-overview>Overview</template></AgalaTabs>`,
  },
  {
    slug: 'calendar', name: 'Calendar', exports: ['AgalaCalendar'], description: 'Displays events in month, week, day, or list views and supports time-slot selection.',
    props: [p('events', 'CalendarEvent[]', 'Event collection.'), p('view', "'month' | 'week' | 'day' | 'list'", 'Current view.'), p('currentDate', 'string', 'ISO focus date.'), p('availableViews', 'CalendarView[]', 'Enabled views.'), p('dayStart / dayEnd', 'string', 'Visible HH:MM bounds.'), p('snapMinutes', 'number', 'Slot selection interval.', '30'), p('hideHeader', 'boolean', 'Hides built-in controls.', 'false')],
    events: ['update:view', 'update:currentDate', 'select(event)', 'day-click(date)', 'slot-select({ start, end })'], slots: ['header', 'event — receives { event, view, presentation, timeLabel, isCompact }', 'empty-day'], accessibility: 'Grid selection supports keyboard navigation; event controls expose full titles, time context, and consistent focus behavior in every view.',
    snippet: `<AgalaCalendar v-model:view="view" v-model:current-date="date" :events="events" />`,
  },
  {
    slug: 'list-group', name: 'List Group', exports: ['AgalaListGroup', 'AgalaListGroupItem'], description: 'Displays scan-friendly related records or actions.',
    props: [p('variant', "'divided' | 'cards'", 'Group presentation.', "'divided'"), p('gap', 'string', 'Custom gap.'), p('borderless / dividers', 'boolean', 'Border controls.'), p('label', 'string', 'Required item label.'), p('subtitle', 'string', 'Item supporting copy.'), p('icon / actionIcon', 'string', 'Agala icon names.'), p('badge', 'string | number', 'Trailing count/status.'), p('disabled', 'boolean', 'Disables an item.', 'false')],
    slots: ['ListGroup: default', 'ListGroupItem: leading, default, trailing, badge'], accessibility: 'Choose semantic content inside each item and label action icons.',
    snippet: `<AgalaListGroup><AgalaListGroupItem label="Invoices" subtitle="12 open" icon="document" /></AgalaListGroup>`,
  },
  {
    slug: 'avatar', name: 'Avatar', exports: ['AgalaAvatar'], description: 'Represents a person or entity with an image or fallback initials.',
    props: [p('src', 'string', 'Image URL.'), p('alt', 'string', 'Accessible image alternative.'), p('fallback', 'string', 'Text shown without an image.'), p('size', 'string', 'Named or supported size.'), p('shape', "'circle' | 'rounded' | 'square'", 'Avatar shape.', "'circle'"), p('class', 'string', 'Consumer override class.')],
    accessibility: 'Supply meaningful alt text when the image carries identity; decorative avatars can use an empty alt.',
    snippet: `<AgalaAvatar fallback="AG" alt="Agala team" size="lg" />`,
  },
  {
    slug: 'card', name: 'Card', exports: ['AgalaCard'], description: 'Groups one coherent piece of content with optional header, footer, and accent.',
    props: [p('padding', "'none' | 'sm' | 'md' | 'lg'", 'Internal spacing.', "'md'"), p('headerVariant', "'default' | 'compact'", 'Header density.', "'default'"), p('accent', "'top' | 'left' | 'right' | 'bottom'", 'Accent edge.'), p('accentColor', 'string', 'Accent CSS color.'), p('class', 'string', 'Consumer override class.')],
    slots: ['header', 'default', 'footer'], accessibility: 'Cards are visual grouping only; use headings and semantic elements inside them.',
    snippet: `<AgalaCard accent="top"><template #header>Warehouse sync</template>184 items are up to date.</AgalaCard>`,
  },
  {
    slug: 'center', name: 'Center', exports: ['AgalaCenter'], description: 'Centers content along both axes.',
    props: [], slots: ['default'], accessibility: 'Layout-only component with no added interaction semantics.',
    snippet: `<AgalaCenter><AgalaProgress variant="circular" indeterminate /></AgalaCenter>`,
  },
  {
    slug: 'divider', name: 'Divider', exports: ['AgalaDivider'], description: 'Separates related regions horizontally or vertically.',
    props: [p('orientation', "'horizontal' | 'vertical'", 'Divider direction.', "'horizontal'"), p('label', 'string', 'Optional visible label.'), p('labelPosition', "'start' | 'center' | 'end'", 'Label alignment.', "'center'"), p('class', 'string', 'Consumer override class.')],
    accessibility: 'Uses separator semantics; labels should describe the following section, not decoration.',
    snippet: `<AgalaDivider label="Or continue with" />`,
  },
  {
    slug: 'stack', name: 'Stack', exports: ['AgalaStack', 'AgalaHStack', 'AgalaVStack'], description: 'Arranges children with consistent direction, alignment, wrapping, and gap.',
    props: [p('direction', "'vertical' | 'horizontal'", 'Stack direction.', "'vertical'"), p('gap', 'string', 'CSS gap.'), p('align / justify', 'string', 'CSS alignment values.'), p('wrap', 'boolean', 'Allows wrapping.', 'false'), p('as', 'string', 'Rendered HTML element.', "'div'"), p('class', 'string', 'Consumer override class.')],
    slots: ['default'], accessibility: 'Choose an appropriate as element when the children form a semantic list or navigation region.',
    snippet: `<AgalaHStack gap="0.75rem" align="center"><AgalaButton>Save</AgalaButton><AgalaButton variant="ghost">Cancel</AgalaButton></AgalaHStack>`,
  },
  {
    slug: 'spacer', name: 'Spacer', exports: ['AgalaSpacer'], description: 'Consumes remaining flex space between sibling controls.',
    props: [], accessibility: 'Purely presentational; do not use it to create reading-order changes.',
    snippet: `<AgalaHStack><strong>Project</strong><AgalaSpacer /><AgalaButton>Edit</AgalaButton></AgalaHStack>`,
  },
  {
    slug: 'stat', name: 'Stat', exports: ['AgalaStat'], description: 'Displays a key metric with optional trend and icon.',
    props: [p('label', 'string', 'Required metric label.'), p('value', 'string | number', 'Required metric value.'), p('trend', 'number', 'Signed trend value.'), p('trendLabel', 'string', 'Trend context.'), p('icon', 'string', 'Agala icon name.'), p('iconBg', "'primary' | 'danger' | 'success' | 'warning' | 'info'", 'Icon surface.'), p('layout', "'vertical' | 'row' | 'inline'", 'Content arrangement.', "'vertical'"), p('bordered', 'boolean', 'Adds a border.', 'false'), p('labelTransform', 'string', 'CSS text transform override.')],
    accessibility: 'Trend direction is conveyed by signed text and labels as well as color/icon.',
    snippet: `<AgalaStat label="Monthly revenue" value="$24,800" :trend="12.4" trend-label="vs last month" />`,
  },
  {
    slug: 'tag', name: 'Tag', exports: ['AgalaTag'], description: 'Represents a compact label that may be interactive or removable.',
    props: [p('label', 'string', 'Visible tag text.'), p('variant', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'", 'Treatment.', "'default'"), p('size', "'sm' | 'md'", 'Tag size.', "'md'"), p('removable', 'boolean', 'Shows removal action.', 'false'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('color', 'string', 'Custom CSS color.'), p('class', 'string', 'Consumer override class.')],
    events: ['click', 'remove'], accessibility: 'Removal has a labeled control; use badges rather than interactive tags for status-only text.',
    snippet: `<AgalaTag label="Vue" variant="success" removable @remove="removeTag" />`,
  },
  {
    slug: 'icon', name: 'Icon', exports: ['AgalaIcon', 'IconName'], description: 'Renders the library’s local inline SVG icon set.',
    props: [p('name', 'IconName', 'Required icon identifier.'), p('size', 'number', 'Rendered size in pixels.', '16')],
    accessibility: 'Icons are aria-hidden by default. Put the accessible name on the interactive control that contains the icon.',
    snippet: `<AgalaIcon name="calendar" aria-hidden="true" />`,
  },
]

export const componentMap = Object.fromEntries(components.map(component => [component.slug, component]))
