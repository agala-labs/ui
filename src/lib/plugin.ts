import { type App, type Component } from 'vue'
import Button from './components/Button/Button.vue'
import Input from './components/Input/Input.vue'
import FormField from './components/FormField/FormField.vue'
import Select from './components/Select/Select.vue'
import CreatableSelect from './components/CreatableSelect/CreatableSelect.vue'
import DatePicker from './components/DatePicker/DatePicker.vue'
import Calendar from './components/Calendar/Calendar.vue'
import Center from './components/Center/Center.vue'
import ColorPicker from './components/ColorPicker/ColorPicker.vue'
import Divider from './components/Divider/Divider.vue'
import HStack from './components/Stack/HStack.vue'
import ListGroup from './components/ListGroup/ListGroup.vue'
import ListGroupItem from './components/ListGroup/ListGroupItem.vue'
import Modal from './components/Modal/Modal.vue'
import ModalProvider from './components/Modal/ModalProvider.vue'
import Badge from './components/Badge/Badge.vue'
import Checkbox from './components/Checkbox/Checkbox.vue'
import Spacer from './components/Spacer/Spacer.vue'
import Stack from './components/Stack/Stack.vue'
import Toggle from './components/Toggle/Toggle.vue'
import Avatar from './components/Avatar/Avatar.vue'
import ToastProvider from './components/Toast/ToastProvider.vue'
import Textarea from './components/Textarea/Textarea.vue'
import MarkdownEditor from './components/MarkdownEditor/MarkdownEditor.vue'
import MarkdownPreview from './components/MarkdownEditor/MarkdownPreview.vue'
import DropdownMenu from './components/DropdownMenu/DropdownMenu.vue'
import Table from './components/Table/Table.vue'
import Tabs from './components/Tabs/Tabs.vue'
import Card from './components/Card/Card.vue'
import Tooltip from './components/Tooltip/Tooltip.vue'
import RadioGroup from './components/RadioGroup/RadioGroup.vue'
import Sidebar from './components/Sidebar/Sidebar.vue'
import SidebarItem from './components/Sidebar/SidebarItem.vue'
import SidebarGroup from './components/Sidebar/SidebarGroup.vue'
import SidebarToggle from './components/SidebarToggle/SidebarToggle.vue'
import Navbar from './components/Navbar/Navbar.vue'
import Accordion from './components/Accordion/Accordion.vue'
import AccordionItem from './components/Accordion/AccordionItem.vue'
import Skeleton from './components/Skeleton/Skeleton.vue'
import Stat from './components/Stat/Stat.vue'
import EmptyState from './components/EmptyState/EmptyState.vue'
import Progress from './components/Progress/Progress.vue'
import Tag from './components/Tag/Tag.vue'
import SegmentedControl from './components/SegmentedControl/SegmentedControl.vue'
import Pagination from './components/Pagination/Pagination.vue'
import Drawer from './components/Drawer/Drawer.vue'
import FileUpload from './components/FileUpload/FileUpload.vue'
import VStack from './components/Stack/VStack.vue'
import DevEnvBanner from './components/DevEnvBanner/DevEnvBanner.vue'
import Alert from './components/Alert/Alert.vue'

const componentMap: Record<string, Component> = {
  AgalaButton: Button,
  AgalaInput: Input,
  AgalaFormField: FormField,
  AgalaSelect: Select,
  AgalaCreatableSelect: CreatableSelect,
  AgalaDatePicker: DatePicker,
  AgalaCalendar: Calendar,
  AgalaCenter: Center,
  AgalaColorPicker: ColorPicker,
  AgalaDivider: Divider,
  AgalaHStack: HStack,
  AgalaListGroup: ListGroup,
  AgalaListGroupItem: ListGroupItem,
  AgalaModal: Modal,
  AgalaModalProvider: ModalProvider,
  AgalaBadge: Badge,
  AgalaCheckbox: Checkbox,
  AgalaSpacer: Spacer,
  AgalaStack: Stack,
  AgalaToggle: Toggle,
  AgalaAvatar: Avatar,
  AgalaToastProvider: ToastProvider,
  AgalaTextarea: Textarea,
  AgalaMarkdownEditor: MarkdownEditor,
  AgalaMarkdownPreview: MarkdownPreview,
  AgalaDropdownMenu: DropdownMenu,
  AgalaTable: Table,
  AgalaTabs: Tabs,
  AgalaCard: Card,
  AgalaTooltip: Tooltip,
  AgalaRadioGroup: RadioGroup,
  AgalaSidebar: Sidebar,
  AgalaSidebarItem: SidebarItem,
  AgalaSidebarGroup: SidebarGroup,
  AgalaSidebarToggle: SidebarToggle,
  AgalaNavbar: Navbar,
  AgalaAccordion: Accordion,
  AgalaAccordionItem: AccordionItem,
  AgalaSkeleton: Skeleton,
  AgalaStat: Stat,
  AgalaEmptyState: EmptyState,
  AgalaProgress: Progress,
  AgalaTag: Tag,
  AgalaSegmentedControl: SegmentedControl,
  AgalaPagination: Pagination,
  AgalaDrawer: Drawer,
  AgalaFileUpload: FileUpload,
  AgalaVStack: VStack,
  AgalaDevEnvBanner: DevEnvBanner,
  AgalaAlert: Alert,
}

export const AgalaUI = {
  install(app: App) {
    for (const [name, component] of Object.entries(componentMap)) {
      app.component(name, component)
    }
  },
}
