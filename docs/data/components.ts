export interface ApiProp {
  name: string
  type: string
  default?: string
  description: string
}

export interface ComponentExample {
  id: string
  label: string
  description?: string
  snippet: string
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
  examples?: ComponentExample[]
}

type AdditionalExample = Omit<ComponentExample, 'id'>

const additionalExamples: Record<string, AdditionalExample> = {
  input: { label: 'Validation', description: 'Keep the entered value visible and explain how to recover.', snippet: `<AgalaInput model-value="invalid@" error error-message="Enter a complete email address." />` },
  'form-field': { label: 'Validation', description: 'Put the actionable error beside the labeled control.', snippet: `<AgalaFormField label="Workspace name" error="A workspace name is required." required>\n  <AgalaInput model-value="" error />\n</AgalaFormField>` },
  select: { label: 'Multiple', description: 'Use multiple selection only when several peers may be chosen together.', snippet: `<AgalaSelect v-model="regions" :options="options" multiple searchable />` },
  'creatable-select': { label: 'Disabled', description: 'Preserve selected values while making the unavailable state clear.', snippet: `<AgalaCreatableSelect v-model="skills" :options="options" disabled />` },
  'date-picker': { label: 'Inline', description: 'Inline calendars suit scheduling surfaces where the calendar is the task.', snippet: `<AgalaDatePicker v-model="date" inline :highlight-dates="highlightDates" />` },
  'color-picker': { label: 'Validation', description: 'Pair invalid color input with direct recovery copy.', snippet: `<AgalaColorPicker model-value="#12" error error-message="Enter a six-digit hex color." />` },
  checkbox: { label: 'States', description: 'Mixed and disabled states remain explicit in the label.', snippet: `<AgalaCheckbox :model-value="false" indeterminate label="Some locations selected" />\n<AgalaCheckbox :model-value="false" disabled label="Managed by policy" />` },
  'radio-group': { label: 'Unavailable option', description: 'Keep unavailable plans visible while preventing selection.', snippet: `<AgalaRadioGroup v-model="plan" :options="plansWithDisabled" />` },
  textarea: { label: 'Validation', description: 'Long-form input keeps the user’s text when validation fails.', snippet: `<AgalaTextarea model-value="Too short" error error-message="Add at least 20 characters." />` },
  'markdown-editor': { label: 'Read-only preview', description: 'Use MarkdownPreview when editing controls are not needed.', snippet: `<AgalaMarkdownPreview source="## Release notes\n\nInventory sync is complete." />` },
  toggle: { label: 'Disabled', description: 'Explain externally why a managed setting cannot change.', snippet: `<AgalaToggle :model-value="true" disabled />\n<span>Required by workspace policy</span>` },
  'file-upload': { label: 'Inline', description: 'Inline upload works inside compact forms with an existing label.', snippet: `<AgalaFileUpload v-model="files" variant="inline" accept=".pdf" :max-files="1" />` },
  'segmented-control': { label: 'Compared with Tabs', description: 'Segmented Control changes one immediate value inside an enclosed track; Tabs navigate related content panels.', snippet: `<AgalaSegmentedControl v-model="density" :options="densityOptions" size="sm" aria-label="Table density" />\n<AgalaTabs v-model="tab" :tabs="tabs" variant="pills" aria-label="Project sections">…</AgalaTabs>` },
  alert: { label: 'Without icon', description: 'Hide the icon only when the message and context already carry the status.', snippet: `<AgalaAlert variant="info" :icon="false">Scheduled maintenance starts at 22:00.</AgalaAlert>` },
  badge: { label: 'Metadata and custom color', description: 'Passive badges label counts and states without becoming controls. Custom colors accept any valid CSS color.', snippet: `<AgalaBadge variant="secondary">12 items</AgalaBadge>\n<AgalaBadge variant="outline">Draft</AgalaBadge>\n<AgalaBadge size="sm">128</AgalaBadge>\n<AgalaBadge color="rebeccapurple">Custom</AgalaBadge>` },
  drawer: { label: 'Top placement', description: 'Use a top drawer for a short viewport-wide task, not a long form.', snippet: `<AgalaDrawer :open="open" placement="top" size="14rem" title="Quick search" @close="open = false">…</AgalaDrawer>` },
  modal: { label: 'Policy and manager', description: 'Reserve non-dismissible dialogs for decisions with an explicit path. Provider-managed modals use the same leave lifecycle.', snippet: `<AgalaModal v-model:open="open" title="Resolve conflict" :dismissible="false" :escape-closes="false">…</AgalaModal>\nmodalManager.open(ManagedConfirmation, { title: 'Managed confirmation', size: 'sm' })` },
  toast: { label: 'Recovery action', description: 'A toast action may offer one immediate, reversible follow-up.', snippet: `toastManager.show({ message: 'Draft archived', variant: 'warning', action: { label: 'Undo', onClick: restoreDraft } })` },
  tooltip: { label: 'Placement', description: 'Placement is a preference; collision handling keeps the tooltip visible.', snippet: `<AgalaTooltip content="Exports the current report" placement="bottom">\n  <AgalaButton variant="outline">Export</AgalaButton>\n</AgalaTooltip>` },
  progress: { label: 'Indeterminate', description: 'Use indeterminate progress only when completion cannot be estimated.', snippet: `<AgalaProgress indeterminate />` },
  skeleton: { label: 'List row', description: 'Match the loading placeholder to the content geometry it replaces.', snippet: `<div class="loading-row"><AgalaSkeleton variant="circle" width="2.5rem" height="2.5rem" /><AgalaSkeleton width="70%" /></div>` },
  'empty-state': { label: 'Filtered results', description: 'Filtered empty states should offer a direct way back to results.', snippet: `<AgalaEmptyState size="compact" title="No matching records" description="Try changing or clearing the filters.">\n  <template #action><AgalaButton variant="ghost" size="sm">Clear filters</AgalaButton></template>\n</AgalaEmptyState>` },
  'dev-env-banner': { label: 'Environment copy', description: 'Name the environment and the consequence that matters.', snippet: `<AgalaDevEnvBanner text="Staging environment — payments are simulated." />` },
  accordion: { label: 'Rich content and states', description: 'Allow multiple open items only when users need to compare rich sections; disabled items remain visible.', snippet: `<AgalaAccordion multiple>\n  <AgalaAccordionItem value="access" title="Access"><p>Workspace roles…</p><ul>…</ul></AgalaAccordionItem>\n  <AgalaAccordionItem value="billing" title="Billing" disabled>…</AgalaAccordionItem>\n</AgalaAccordion>` },
  'dropdown-menu': { label: 'Destructive command', description: 'Separate destructive commands and keep unavailable commands visible.', snippet: `<AgalaDropdownMenu :items="[{ label: 'Duplicate' }, { label: 'Archive', separator: true }, { label: 'Delete', variant: 'danger' }]">…</AgalaDropdownMenu>` },
  navbar: { label: 'Compact actions', description: 'Keep product navigation primary and utility actions concise.', snippet: `<AgalaNavbar><template #brand>Inventory</template><a href="#stock">Stock</a><template #actions><AgalaButton size="icon" aria-label="Notifications" icon="bell" /></template></AgalaNavbar>` },
  pagination: { label: 'Compact result set', description: 'Small result sets omit unnecessary edge controls.', snippet: `<AgalaPagination v-model="page" :total="48" :page-size="10" :show-edges="false" />` },
  sidebar: { label: 'Comfortable tree', description: 'Use comfortable indentation when nested destinations need stronger hierarchy.', snippet: `<AgalaSidebar v-model:active-value="active" v-model:expanded="expanded" :items="items" indent="comfortable" />` },
  table: { label: 'Loading and empty', description: 'Tables preserve their columns while loading and explain an empty result.', snippet: `<AgalaTable :columns="columns" :rows="[]" loading :loading-rows="3" empty-message="No matching members" />` },
  tabs: { label: 'Pills navigation', description: 'Use loose pills for secondary content navigation; they remain tabs, not form values or mode toggles.', snippet: `<AgalaTabs v-model="tab" :tabs="tabs" variant="pills" aria-label="Project sections"><template #panel-overview>Project overview</template></AgalaTabs>` },
  calendar: { label: 'List view', description: 'List view prioritizes chronological scanning in narrow or agenda-focused contexts.', snippet: `<AgalaCalendar v-model:view="view" v-model:current-date="date" :events="events" :available-views="['list']" />` },
  'list-group': { label: 'Card rows', description: 'Card rows suit independently actionable records with clear separation.', snippet: `<AgalaListGroup variant="cards" gap="0.5rem"><AgalaListGroupItem label="Main warehouse" subtitle="184 products" action-icon="chevron-right" /></AgalaListGroup>` },
  avatar: { label: 'Shapes', description: 'Choose shape from the represented object, not decoration.', snippet: `<AgalaAvatar fallback="AL" shape="circle" />\n<AgalaAvatar fallback="HQ" shape="square" />` },
  card: { label: 'Quiet container', description: 'Use a plain card when content already provides the hierarchy.', snippet: `<AgalaCard padding="lg"><template #header>Clinic details</template><p>Contact and scheduling information.</p></AgalaCard>` },
  center: { label: 'Empty region', description: 'Center a compact empty-state message inside a bounded region.', snippet: `<AgalaCenter><AgalaEmptyState size="compact" title="Nothing selected" /></AgalaCenter>` },
  divider: { label: 'Vertical', description: 'Vertical dividers separate adjacent controls, never unrelated page regions.', snippet: `<AgalaHStack><span>List</span><AgalaDivider orientation="vertical" /><span>Grid</span></AgalaHStack>` },
  stack: { label: 'Vertical form actions', description: 'Vertical stacking keeps narrow actions readable and ordered.', snippet: `<AgalaVStack gap="0.5rem"><AgalaButton block>Continue</AgalaButton><AgalaButton block variant="ghost">Cancel</AgalaButton></AgalaVStack>` },
  spacer: { label: 'Status bar', description: 'Spacer can push secondary metadata to the far edge of one row.', snippet: `<AgalaHStack><strong>Inventory sync</strong><AgalaSpacer /><span>Updated 2 min ago</span></AgalaHStack>` },
  stat: { label: 'Inline summary', description: 'Inline stats belong in dense summaries rather than stretched metric cards.', snippet: `<AgalaStat label="Pending reviews" value="12" secondary-value="0 overdue" layout="inline" :bordered="false" />` },
  tag: { label: 'Removal and passive states', description: 'A removable tag exposes only its labeled remove button. Passive and disabled tags stay out of the tab order.', snippet: `<AgalaTag label="Mar del Plata" removable @remove="removeLocation" />\n<AgalaTag label="Managed" disabled />` },
  icon: { label: 'Sizes', description: 'Icons inherit current color and should match the control or text they support.', snippet: `<AgalaIcon name="settings" :size="16" />\n<AgalaIcon name="settings" :size="24" />` },
}

export function getComponentExamples(component: ComponentMeta): ComponentExample[] {
  const additional = additionalExamples[component.slug]
  const examples = component.examples?.length
    ? component.examples
    : [
        { id: 'default', label: 'Default', snippet: component.snippet },
        ...(additional ? [{ id: 'states', ...additional }] : []),
      ]

  if (import.meta.env.DEV) {
    const ids = examples.map(example => example.id)
    if (new Set(ids).size !== ids.length) {
      console.warn(`[Agala docs] Duplicate example id for ${component.slug}.`)
    }
    if (examples.length < 2) {
      console.warn(`[Agala docs] ${component.slug} needs at least two examples.`)
    }
  }

  return examples
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
    examples: [
      {
        id: 'variants',
        label: 'Variants',
        description: 'Choose emphasis from the consequence and frequency of the action.',
        snippet: `<AgalaButton icon="plus">Create project</AgalaButton>\n<AgalaButton variant="secondary">Secondary</AgalaButton>\n<AgalaButton variant="outline">Outline</AgalaButton>\n<AgalaButton variant="danger">Delete</AgalaButton>`,
      },
      {
        id: 'states',
        label: 'States',
        description: 'Loading prevents repeat submission; disabled explains unavailable actions through surrounding copy.',
        snippet: `<AgalaButton loading>Saving</AgalaButton>\n<AgalaButton disabled>Unavailable</AgalaButton>`,
      },
    ],
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
    slug: 'select', name: 'Select', exports: ['AgalaSelect'], description: 'Selects one or more values from a searchable, collision-aware top-layer listbox.',
    props: [p('options', 'SelectOption[]', 'Required option collection.'), p('modelValue', 'string | string[]', 'Selected value(s).'), p('multiple', 'boolean', 'Enables multi-select.', 'false'), p('searchable', 'boolean', 'Shows filtering input.', 'false'), p('clearable', 'boolean', 'Allows clearing the selection.', 'false'), p('loading', 'boolean', 'Shows a loading state.', 'false'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('placeholder', 'string', 'Empty selection copy.'), p('maxDisplayed', 'number', 'Maximum visible chips.'), p('maxSelections', 'number', 'Selection limit.'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.')],
    events: ['update:modelValue(value)', 'search(query: string)'], accessibility: 'Implements combobox/listbox semantics with keyboard navigation, selected state, and expanded state.',
    snippet: `<AgalaSelect v-model="country" :options="countries" searchable clearable />`,
  },
  {
    slug: 'creatable-select', name: 'Creatable Select', exports: ['AgalaCreatableSelect'], description: 'Builds a multi-value selection in a collision-aware top-layer listbox and can create missing options.',
    props: [p('options', 'CreatableSelectOption[]', 'Required options.'), p('modelValue', 'string[]', 'Selected IDs.'), p('creatable', 'boolean', 'Allows new values.', 'true'), p('labelKey / idKey', 'string', 'Keys used for custom records.'), p('maxDisplayed', 'number', 'Maximum visible chips.'), p('debounce', 'number', 'Search debounce in milliseconds.'), p('disabled', 'boolean', 'Disables interaction.', 'false')],
    events: ['update:modelValue(values: string[])', 'create(text: string)', 'search(query: string)'], accessibility: 'Supports combobox keyboard navigation and announces selected chips through native labels.',
    snippet: `<AgalaCreatableSelect v-model="skills" :options="options" creatable @create="addSkill" />`,
  },
  {
    slug: 'date-picker', name: 'Date Picker', exports: ['AgalaDatePicker'], description: 'Selects an ISO date through a collision-aware top-layer popover or inline calendar.',
    props: [p('modelValue', 'string', 'ISO date used by v-model.'), p('size', "'sm' | 'md' | 'lg'", 'Control size.', "'md'"), p('min / max', 'string', 'ISO date bounds.'), p('clearable', 'boolean', 'Allows clearing.', 'false'), p('inline', 'boolean', 'Always displays the calendar.', 'false'), p('highlightDates', 'string[]', 'ISO dates to emphasize.'), p('displayMonth', 'string', 'Controlled YYYY-MM display month.'), p('disabled', 'boolean', 'Disables interaction.', 'false'), p('error / errorMessage', 'boolean / string', 'Validation state and copy.')],
    events: ['update:modelValue(date: string)', 'update:displayMonth(month: string)'], accessibility: 'Calendar grid supports arrow keys, Home/End, Enter, Space, and Escape.',
    snippet: `<AgalaDatePicker v-model="date" min="2026-01-01" clearable />`,
  },
  {
    slug: 'color-picker', name: 'Color Picker', exports: ['AgalaColorPicker'], description: 'Selects a color in a viewport-aware top-layer panel or through a hexadecimal value.',
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
    props: [p('variant', "'info' | 'success' | 'warning' | 'danger'", 'Semantic status.', "'info'"), p('title', 'string', 'Optional heading.'), p('dismissible', 'boolean', 'Shows an internal close action.', 'false'), p('flat', 'boolean', 'Removes the neutral surface and radius.', 'false'), p('icon', 'string | false', 'Overrides or hides the icon.'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — alert body', 'action — recovery or follow-up control'], accessibility: 'Icon, content, action, and dismissal remain in DOM order. Actions wrap below narrow messages while staying keyboard reachable. Urgent messages should be announced by the consuming workflow when appropriate.',
    snippet: `<AgalaAlert variant="danger" title="Could not load"><template #default>Try again.</template><template #action><AgalaButton size="sm" variant="outline">Retry</AgalaButton></template></AgalaAlert>`,
  },
  {
    slug: 'badge', name: 'Badge', exports: ['AgalaBadge'], description: 'Reports compact, passive status, counts, or metadata.',
    props: [p('variant', "'default' | 'secondary' | 'outline' | 'subtle' | 'success' | 'warning' | 'danger'", 'Visual/semantic treatment.', "'default'"), p('size', "'sm' | 'md'", 'Badge size.', "'md'"), p('dot', 'boolean', 'Shows a status dot.', 'false'), p('color', 'string', 'Custom color override.'), p('class', 'string', 'Consumer override class.')],
    slots: ['default — badge label'], accessibility: 'Badge is always passive and never enters the tab order. Do not communicate status through color or a dot alone; keep the slot label meaningful.',
    snippet: `<AgalaBadge variant="success" dot>Active</AgalaBadge>`,
  },
  {
    slug: 'drawer', name: 'Drawer', exports: ['AgalaDrawer'], description: 'Presents a focused task from an edge of the viewport.',
    props: [p('open', 'boolean', 'Required controlled visibility.'), p('title', 'string', 'Visible and accessible drawer heading.'), p('placement', "'left' | 'right' | 'top' | 'bottom'", 'Viewport edge and enter/leave direction.', "'right'"), p('size', 'string', 'CSS size value, clamped to the viewport.'), p('dismissible', 'boolean', 'Allows backdrop dismissal and shows the close button.', 'true'), p('escapeCloses', 'boolean', 'Allows Escape dismissal independently.', 'true'), p('class', 'string', 'Consumer override class.')],
    events: ['close'], slots: ['header', 'default', 'footer — receives { close }'], accessibility: 'Traps focus while present, keeps background scrolling locked through the leave transition, then restores the opener. Entry and exit follow the configured edge and reduced motion removes meaningful travel.',
    snippet: `<AgalaDrawer :open="open" title="Inventory filters" @close="open = false">…</AgalaDrawer>`,
  },
  {
    slug: 'modal', name: 'Modal', exports: ['AgalaModal', 'AgalaModalProvider', 'modalManager'], description: 'Presents a blocking decision either declaratively or through the modal manager.',
    props: [p('open', 'boolean', 'Visibility used by v-model:open.'), p('title', 'string', 'Dialog heading.'), p('size', "'sm' | 'md' | 'lg' | 'xl' | 'full'", 'Dialog width.', "'md'"), p('dismissible', 'boolean', 'Allows outside-click dismissal.', 'true'), p('escapeCloses', 'boolean', 'Allows Escape dismissal.', 'true'), p('hideHeader', 'boolean', 'Hides the built-in header.', 'false')],
    events: ['update:open(value: boolean)', 'close', 'after-leave'], slots: ['default', 'footer — receives { close }'], accessibility: 'Traps focus while present, retains background scroll lock through leave, and restores the opener after exit. Mount exactly one ModalProvider when using modalManager. Reduced motion removes meaningful transform travel.',
    snippet: `<AgalaModal v-model:open="open" title="Archive record">Confirm the action.</AgalaModal>`,
  },
  {
    slug: 'toast', name: 'Toast', exports: ['AgalaToastProvider', 'toastManager'], description: 'Displays brief, non-blocking feedback from a single root provider.',
    props: [p('message', 'string', 'Required toast message.'), p('variant', "'default' | 'success' | 'warning' | 'danger'", 'Semantic treatment.', "'default'"), p('duration', 'number', 'Visible duration in milliseconds; 0 persists.'), p('action', '{ label; onClick }', 'Optional toast action.')],
    accessibility: 'Mount one ToastProvider. Keep messages concise and do not use a toast as the only location for recoverable form errors.',
    snippet: `toastManager.show({ message: 'Changes saved', variant: 'success' })`,
  },
  {
    slug: 'tooltip', name: 'Tooltip', exports: ['AgalaTooltip'], description: 'Adds collision-aware top-layer supporting text to a hoverable or focusable trigger.',
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
    props: [p('title', 'string', 'Required state title.'), p('description', 'string', 'Supporting explanation.'), p('size', "'default' | 'compact'", 'Presentation density.', "'default'"), p('class', 'string', 'Consumer override class.')],
    slots: ['icon', 'action'], accessibility: 'Keep the title explicit and ensure the action is reachable in normal reading order.',
    snippet: `<AgalaEmptyState size="compact" title="No results" description="Try another filter."><template #action><AgalaButton size="sm" variant="ghost">Clear filters</AgalaButton></template></AgalaEmptyState>`,
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
    slots: ['default — AccordionItem children / item content'], accessibility: 'Headers are native disclosure buttons linked to labeled regions with expanded and controls relationships. Height and chevron transitions respect reduced motion.',
    snippet: `<AgalaAccordion><AgalaAccordionItem value="billing" title="Billing">…</AgalaAccordionItem></AgalaAccordion>`,
  },
  {
    slug: 'dropdown-menu', name: 'Dropdown Menu', exports: ['AgalaDropdownMenu'], description: 'Offers contextual commands in a top-layer menu that flips and shifts around viewport collisions.',
    props: [p('items', 'DropdownMenuItem[]', 'Required command collection.'), p('placement', "'bottom-start' | 'bottom-end'", 'Preferred menu alignment; the vertical side flips when needed.', "'bottom-end'"), p('class', 'string', 'Consumer override class.')],
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
    events: ['update:activeValue', 'update:expanded', 'update:collapsed', 'update:open', 'select(value)'], slots: ['default', 'SidebarItem: icon and default'], accessibility: 'Tree branches expose expansion state, animate their disclosure height, and keep the selected surface on the active leaf. Use SidebarToggle with aria-controls for mobile or collapsed navigation.',
    snippet: `<AgalaSidebar v-model:active-value="active" v-model:expanded="expanded" :items="items" responsive />`,
  },
  {
    slug: 'table', name: 'Table', exports: ['AgalaTable'], description: 'Displays sortable, selectable tabular records with loading and empty states.',
    props: [p('columns', 'TableColumn[]', 'Definitions support width, minWidth, alignment, and sorting.'), p('rows', 'Record<string, unknown>[]', 'Required records.'), p('rowKey', 'string', 'Unique record key.'), p('variant', "'default' | 'clean' | 'minimal'", 'Border and surface treatment.'), p('density', "'comfortable' | 'compact'", 'Row spacing.', "'comfortable'"), p('selectable', 'boolean', 'Enables row selection.', 'false'), p('selectedRows', 'string[]', 'Selected keys.'), p('sortKey / sortDir', "string / 'asc' | 'desc'", 'Controlled sorting.'), p('interactiveRows', 'boolean', 'Adds keyboard row activation.', 'false'), p('stickyHeader / stickyFirstColumn', 'boolean', 'Pins context inside the table scroller.', 'false'), p('loading / loadingRows', 'boolean / number', 'Shows a deterministic loading layout.', 'false / 5'), p('emptyMessage', 'string', 'Empty collection copy.')],
    events: ['update:selectedRows', 'update:sortKey', 'update:sortDir', 'row-click(row)'], slots: ['cell-<key>', 'empty', 'footer'], accessibility: 'Uses semantic table markup, announces sorting and selection, and makes rows keyboard-operable only when interactiveRows is enabled.',
    snippet: `<AgalaTable :columns="columns" :rows="members" row-key="id" />`,
  },
  {
    slug: 'tabs', name: 'Tabs', exports: ['AgalaTabs'], description: 'Navigates among related content panels while preserving context.',
    props: [p('tabs', 'TabItem[]', 'Required tab definitions.'), p('modelValue', 'string', 'Required active tab.'), p('variant', "'underline' | 'pills'", 'Visual treatment.', "'underline'"), p('ariaLabel', 'string', 'Accessible name for the tab list.'), p('class', 'string', 'Consumer override class.')],
    events: ['update:modelValue(value: string)'], slots: ['panel-<value>', 'tab-<value> — receives { tab, active }'], accessibility: 'Implements tablist, tab, and tabpanel relationships. Arrow keys, Home, and End move focus and skip disabled tabs. Use Segmented Control instead when changing a form value or immediate view mode.',
    snippet: `<AgalaTabs v-model="tab" :tabs="tabs"><template #panel-overview>Overview</template></AgalaTabs>`,
  },
  {
    slug: 'calendar', name: 'Calendar', exports: ['AgalaCalendar'], description: 'Displays events in month, week, day, or list views and supports time-slot selection.',
    props: [p('events', 'CalendarEvent[]', 'Event collection.'), p('view', "'month' | 'week' | 'day' | 'list'", 'Current view.'), p('currentDate', 'string', 'ISO focus date.'), p('availableViews', 'CalendarView[]', 'Enabled views.'), p('dayStart / dayEnd', 'string', 'Visible HH:MM bounds.'), p('snapMinutes', 'number', 'Slot selection interval.', '30'), p('hideHeader', 'boolean', 'Hides built-in controls.', 'false')],
    events: ['update:view', 'update:currentDate', 'select(event)', 'day-click(date)', 'slot-select({ start, end })'], slots: ['header', 'event — receives { event, view, presentation, timeLabel, isCompact }', 'empty-day'], accessibility: 'Grid selection supports keyboard navigation. Default timed event cards progressively show title, time, and subtitle as space allows while their accessible labels retain the complete event context.',
    snippet: `<AgalaCalendar v-model:view="view" v-model:current-date="date" :events="events" />`,
  },
  {
    slug: 'list-group', name: 'List Group', exports: ['AgalaListGroup', 'AgalaListGroupItem'], description: 'Displays scan-friendly related records or actions.',
    props: [p('variant', "'divided' | 'cards'", 'Group presentation.', "'divided'"), p('gap', 'string', 'Custom gap.'), p('borderless / dividers', 'boolean', 'Border controls.'), p('label', 'string', 'Required item label.'), p('subtitle', 'string', 'Item supporting copy.'), p('icon / actionIcon', 'string', 'Agala icon names.'), p('badge', 'string | number', 'Trailing count/status.'), p('badgeVariant', "'default' | 'primary' | 'success' | 'warning' | 'danger'", 'Built-in badge semantic treatment.', "'default'"), p('disabled', 'boolean', 'Disables an item.', 'false')],
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
    slug: 'stat', name: 'Stat', exports: ['AgalaStat'], description: 'Presents one key metric with optional supporting context, trend, and icon.',
    props: [p('label', 'string', 'Required metric label.'), p('value', 'string | number', 'Required metric value.'), p('secondaryValue', 'string | number', 'Neutral supporting value rendered before any trend.'), p('trend', 'number', 'Signed trend value.'), p('trendLabel', 'string', 'Trend context.'), p('icon', 'string', 'Agala icon name.'), p('iconBg', "'primary' | 'danger' | 'success' | 'warning' | 'info'", 'Icon surface.'), p('layout', "'vertical' | 'row' | 'inline'", 'Vertical cards, icon-led rows, or intrinsic inline summaries.', "'vertical'"), p('bordered', 'boolean', 'Adds the quiet grouped surface.', 'true'), p('labelTransform', 'string', 'CSS text transform override.')],
    accessibility: 'Trend direction is conveyed by signed text and labels as well as color/icon.',
    snippet: `<AgalaStat label="Needs attention" value="4" secondary-value="$280k at risk" layout="row" />`,
    examples: [
      {
        id: 'dashboard',
        label: 'Dashboard cards',
        description: 'Vertical cards support side-by-side comparison of a small set of decision-relevant metrics.',
        snippet: `<AgalaStat label="Monthly revenue" value="$24,800" :trend="12.4" trend-label="vs last month" icon="trending-up" />\n<AgalaStat label="Active members" value="1,284" secondary-value="Across 18 teams" :trend="-2.1" trend-label="vs last month" icon="users" />`,
      },
      {
        id: 'attention-row',
        label: 'Attention row',
        description: 'Row layout ties one semantic icon to a compact exception summary.',
        snippet: `<AgalaStat label="Needs attention" value="4" secondary-value="$280k at risk" layout="row" icon="alert-triangle" icon-bg="danger" />`,
      },
      {
        id: 'inline-summary',
        label: 'Inline summary',
        description: 'Inline layout stays intrinsic-height inside dense lists and toolbars.',
        snippet: `<AgalaStat label="Pending reviews" value="12" secondary-value="0 overdue" layout="inline" :bordered="false" />`,
      },
    ],
  },
  {
    slug: 'tag', name: 'Tag', exports: ['AgalaTag'], description: 'Represents a user-applied label that may be explicitly interactive or removable.',
    props: [p('label', 'string', 'Visible tag text.'), p('variant', "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'", 'Treatment.', "'default'"), p('size', "'sm' | 'md'", 'Tag size.', "'md'"), p('removable', 'boolean', 'Shows a labeled native remove button.', 'false'), p('interactive', 'boolean', 'Renders the root as a native button and enables the click event. Ignored when removable.', 'false'), p('disabled', 'boolean', 'Disables available interaction.', 'false'), p('color', 'string', 'Any valid CSS color.'), p('class', 'string', 'Consumer override class.')],
    events: ['click — emitted only when interactive', 'remove'], accessibility: 'Choose Badge for system state/count and Tag for user-applied labels or filters. Passive tags are not focusable; removable tags expose only their labeled remove button; interactive tags use native button semantics.',
    snippet: `<AgalaTag label="Needs review" interactive @click="filterByTag" />`,
  },
  {
    slug: 'icon', name: 'Icon', exports: ['AgalaIcon', 'IconName'], description: 'Renders the library’s local inline SVG icon set.',
    props: [p('name', 'IconName', 'Required icon identifier.'), p('size', 'number', 'Rendered size in pixels.', '16')],
    accessibility: 'Icons are aria-hidden by default. Put the accessible name on the interactive control that contains the icon.',
    snippet: `<AgalaIcon name="calendar" aria-hidden="true" />`,
  },
]

export const componentMap = Object.fromEntries(components.map(component => [component.slug, component]))
