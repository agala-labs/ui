import './tokens.css'

export { useMediaQuery } from './composables/useMediaQuery'
export {
  parseDate,
  formatISODate,
  formatISODateTime,
  formatTime,
  formatTime24,
  formatDateLabel,
  formatMonthYear,
  formatFullDate,
  isSameDay,
  isToday,
  startOfWeek,
  addDays,
  getMonthGrid,
  getWeekDays,
} from './composables/useDateUtils'

export { AgalaIcon } from './components/AgalaIcon'
export type { IconName } from './components/AgalaIcon/types'

export { default as AgalaButton } from './components/Button/Button.vue'
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button'

export { default as AgalaInput } from './components/Input/Input.vue'
export type { InputProps, InputVariant, InputSize } from './components/Input'

export { default as AgalaFormField } from './components/FormField/FormField.vue'
export type { FormFieldProps } from './components/FormField'

export { default as AgalaSelect } from './components/Select/Select.vue'
export type { SelectOption, SelectSize, SelectProps } from './components/Select'

export { default as AgalaCreatableSelect } from './components/CreatableSelect/CreatableSelect.vue'
export type { CreatableSelectOption, CreatableSelectProps } from './components/CreatableSelect'

export { default as AgalaDatePicker } from './components/DatePicker/DatePicker.vue'
export type { DatePickerProps, DatePickerSize } from './components/DatePicker'

export { default as AgalaCalendar } from './components/Calendar/Calendar.vue'
export type { CalendarEvent, CalendarView, CalendarProps, CalendarEmits, SlotSelectPayload } from './components/Calendar'

export { default as AgalaCenter } from './components/Center/Center.vue'

export { default as AgalaColorPicker } from './components/ColorPicker/ColorPicker.vue'
export type { ColorPickerProps, ColorPickerSize } from './components/ColorPicker'

export { default as AgalaDivider } from './components/Divider/Divider.vue'
export type { DividerProps } from './components/Divider'

export { default as AgalaHStack } from './components/Stack/HStack.vue'

export { default as AgalaListGroup } from './components/ListGroup/ListGroup.vue'
export { default as AgalaListGroupItem } from './components/ListGroup/ListGroupItem.vue'
export type { ListGroupProps, ListGroupItemProps, ListGroupItemVariant } from './components/ListGroup'

export { default as AgalaModal } from './components/Modal/Modal.vue'
export { default as AgalaModalProvider } from './components/Modal/ModalProvider.vue'
export { modalManager } from './components/Modal/ModalManager'
export type { ModalSize, ModalOptions, ModalResult } from './components/Modal'

export { default as AgalaBadge } from './components/Badge/Badge.vue'
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/Badge'

export { default as AgalaCheckbox } from './components/Checkbox/Checkbox.vue'
export type { CheckboxProps } from './components/Checkbox'

export { default as AgalaSpacer } from './components/Spacer/Spacer.vue'

export { default as AgalaStack } from './components/Stack/Stack.vue'
export type { StackProps } from './components/Stack'

export { default as AgalaToggle } from './components/Toggle/Toggle.vue'
export type { ToggleProps, ToggleSize } from './components/Toggle'

export { default as AgalaAvatar } from './components/Avatar/Avatar.vue'
export type { AvatarProps, AvatarSize } from './components/Avatar'

export { default as AgalaToastProvider } from './components/Toast/ToastProvider.vue'
export { toastManager } from './components/Toast/ToastManager'
export type { ToastOptions, ToastItem, ToastVariant } from './components/Toast'

export { default as AgalaTextarea } from './components/Textarea/Textarea.vue'
export type { TextareaProps, TextareaResize } from './components/Textarea'

export { default as AgalaMarkdownEditor } from './components/MarkdownEditor/MarkdownEditor.vue'
export { default as AgalaMarkdownPreview } from './components/MarkdownEditor/MarkdownPreview.vue'
export type { MarkdownEditorPreview, MarkdownEditorProps, MarkdownPreviewProps, MarkdownToolbarAction, MarkdownToolbarActionKey } from './components/MarkdownEditor'

export { default as AgalaDropdownMenu } from './components/DropdownMenu/DropdownMenu.vue'
export type { DropdownMenuProps, DropdownMenuItem, DropdownMenuPlacement, DropdownMenuItemVariant } from './components/DropdownMenu'

export { default as AgalaTable } from './components/Table/Table.vue'
export type { TableColumn, TableProps, SortDir, ColumnAlign } from './components/Table'

export { default as AgalaTabs } from './components/Tabs/Tabs.vue'
export type { TabsProps, TabItem } from './components/Tabs'

export { default as AgalaSectionNav } from './components/SectionNav/SectionNav.vue'
export type { SectionNavProps, SectionNavItem, SectionNavVariant, SectionNavDensity, SectionNavResponsive } from './components/SectionNav'

export { default as AgalaCard } from './components/Card/Card.vue'
export type { CardProps, CardPadding, CardAccent } from './components/Card'

export { default as AgalaTooltip } from './components/Tooltip/Tooltip.vue'
export type { TooltipProps, TooltipPlacement } from './components/Tooltip'

export { default as AgalaRadioGroup } from './components/RadioGroup/RadioGroup.vue'
export type { RadioGroupProps, RadioOption, RadioOrientation } from './components/RadioGroup'

export { default as AgalaSidebar } from './components/Sidebar/Sidebar.vue'
export { default as AgalaSidebarItem } from './components/Sidebar/SidebarItem.vue'
export { default as AgalaSidebarGroup } from './components/Sidebar/SidebarGroup.vue'
export { default as AgalaSidebarToggle } from './components/SidebarToggle/SidebarToggle.vue'
export type { SidebarProps, SidebarItemProps, SidebarGroupProps, SidebarItemBadgeVariant, SidebarItemDotVariant, SidebarIndent, SidebarNavItem, SidebarNode, SidebarSection } from './components/Sidebar'
export type { SidebarToggleProps } from './components/SidebarToggle'

export { default as AgalaNavbar } from './components/Navbar/Navbar.vue'
export type { NavbarProps } from './components/Navbar'

export { default as AgalaAccordion } from './components/Accordion/Accordion.vue'
export { default as AgalaAccordionItem } from './components/Accordion/AccordionItem.vue'
export type { AccordionProps, AccordionItemProps } from './components/Accordion'

export { default as AgalaSkeleton } from './components/Skeleton/Skeleton.vue'
export type { SkeletonProps, SkeletonVariant } from './components/Skeleton'

export { default as AgalaStat } from './components/Stat/Stat.vue'
export type { StatProps } from './components/Stat'

export { default as AgalaEmptyState } from './components/EmptyState/EmptyState.vue'
export type { EmptyStateProps } from './components/EmptyState'

export { default as AgalaProgress } from './components/Progress/Progress.vue'
export type { ProgressProps, ProgressVariant, ProgressSize, ProgressColor } from './components/Progress'

export { default as AgalaTag } from './components/Tag/Tag.vue'
export type { TagProps, TagVariant, TagSize } from './components/Tag'

export { default as AgalaSegmentedControl } from './components/SegmentedControl/SegmentedControl.vue'
export type { SegmentedControlProps, SegmentedControlOption, SegmentedControlSize, SegmentedControlVariant } from './components/SegmentedControl'

export { default as AgalaPagination } from './components/Pagination/Pagination.vue'
export type { PaginationProps } from './components/Pagination'

export { default as AgalaDrawer } from './components/Drawer/Drawer.vue'
export type { DrawerProps, DrawerPlacement } from './components/Drawer'

export { default as AgalaFileUpload } from './components/FileUpload/FileUpload.vue'
export type { FileUploadProps, FileUploadVariant, FileItem, FileStatus } from './components/FileUpload'

export { default as AgalaVStack } from './components/Stack/VStack.vue'

export { default as AgalaDevEnvBanner } from './components/DevEnvBanner/DevEnvBanner.vue'
export type { DevEnvBannerProps } from './components/DevEnvBanner'

export { default as AgalaAlert } from './components/Alert/Alert.vue'
export type { AlertProps, AlertVariant } from './components/Alert'

export { AgalaUI } from './plugin'
