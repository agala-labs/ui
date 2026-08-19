import type { Component } from 'vue'
import {
  Archive, ArrowDown, ArrowLeft, ArrowLeftRight, ArrowUp, Barcode, Bell, Bold, Bot, Boxes,
  Building2, Calendar, ChartBar, Check, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, CircleAlert, CircleCheck, ClipboardPlus, Clock, Columns3, Copy,
  CreditCard, Database, Download, Ellipsis, EllipsisVertical, ExternalLink, Eye,
  EyeOff, File, FileText, Filter, Flag, FlaskConical, Grid2X2, HeartPulse, House, Inbox,
  Info, Italic, KeyRound, Link, List, ListOrdered, LoaderCircle, Lock, LogOut,
  Mail, Map, MapPin, Menu, MessageCircle, Minus, MonitorSmartphone, Move, Navigation,
  Network, Package, PanelLeft, Pencil, Percent, Phone, Plus, Printer, ReceiptText,
  RefreshCw, Save, Scan, ScanBarcode, Search, Settings, ShieldPlus, Sparkles,
  Stethoscope, Store, Tags, Trash2, TrendingDown, TrendingUp, TriangleAlert, Truck, Upload, User,
  UserPlus, Users, WalletCards, Warehouse, X,
} from '@lucide/vue'
import type { IconName } from './types'
import {
  CashRegisterIcon, DiagnosisLinkIcon, HealthCoverageIcon, OdontogramIcon,
  PriceCompareIcon, StockLocationIcon, ToothIcon,
} from './customIcons'

export const iconAliases = {
  chevron: 'chevron-down',
  edit: 'pencil',
  'linked-diagnosis': 'diagnosis-link',
  receipt: 'receipt-text',
  wallet: 'wallet-cards',
  terminal: 'monitor-smartphone',
  flask: 'flask-conical',
} as const

type IconAlias = keyof typeof iconAliases
type CanonicalIconName = Exclude<IconName, IconAlias>

const iconRegistry = {
  search: Search, mail: Mail, eye: Eye, 'eye-off': EyeOff, user: User, users: Users,
  'user-plus': UserPlus, flag: Flag, 'chevron-down': ChevronDown,
  'chevron-right': ChevronRight, 'chevron-left': ChevronLeft, 'chevron-up': ChevronUp,
  check: Check, x: X, calendar: Calendar, clock: Clock, refresh: RefreshCw, minus: Minus,
  'check-circle': CircleCheck, 'alert-triangle': TriangleAlert, 'alert-circle': CircleAlert,
  info: Info, 'more-vertical': EllipsisVertical, 'more-horizontal': Ellipsis,
  'arrow-up': ArrowUp, 'arrow-down': ArrowDown, 'arrow-left': ArrowLeft,
  'arrow-left-right': ArrowLeftRight,
  'trending-up': TrendingUp, 'trending-down': TrendingDown, home: House, bell: Bell,
  bold: Bold, settings: Settings, menu: Menu, 'panel-left': PanelLeft, pencil: Pencil,
  italic: Italic, link: Link, 'external-link': ExternalLink, copy: Copy, trash: Trash2,
  plus: Plus, filter: Filter, move: Move, save: Save, print: Printer, upload: Upload,
  download: Download, file: File, building: Building2, document: FileText, 'credit-card': CreditCard,
  lock: Lock, 'sign-out': LogOut, 'chart-bar': ChartBar, archive: Archive, inbox: Inbox,
  key: KeyRound, grid: Grid2X2, columns: Columns3, list: List,
  'list-ordered': ListOrdered, spinner: LoaderCircle, phone: Phone, map: Map, 'map-pin': MapPin,
  directions: Navigation, store: Store, package: Package, boxes: Boxes,
  warehouse: Warehouse, barcode: Barcode, scan: Scan, 'scan-barcode': ScanBarcode,
  'receipt-text': ReceiptText, truck: Truck, tags: Tags, percent: Percent,
  'wallet-cards': WalletCards, 'monitor-smartphone': MonitorSmartphone,
  database: Database, network: Network,
  stethoscope: Stethoscope, 'clipboard-medical': ClipboardPlus,
  'heart-pulse': HeartPulse, 'flask-conical': FlaskConical, 'shield-plus': ShieldPlus,
  bot: Bot, sparkles: Sparkles, 'message-circle': MessageCircle,
  tooth: ToothIcon, odontogram: OdontogramIcon, 'diagnosis-link': DiagnosisLinkIcon,
  'health-coverage': HealthCoverageIcon, 'cash-register': CashRegisterIcon,
  'stock-location': StockLocationIcon, 'price-compare': PriceCompareIcon,
} satisfies Record<CanonicalIconName, Component>

export function resolveIcon(name: IconName | string): Component | undefined {
  const canonicalName = resolveIconName(name)
  return iconRegistry[canonicalName as CanonicalIconName]
}

export function resolveIconName(name: IconName | string): string {
  return iconAliases[name as IconAlias] ?? name
}

const warnedIcons = new Set<string>()

export function warnUnknownIcon(name: string) {
  if (!warnedIcons.has(name)) {
    warnedIcons.add(name)
    console.warn(`[AgalaIcon] Unknown icon name: "${name}"`)
  }
}

export function hasIcon(name: string): name is IconName {
  return Boolean(resolveIcon(name))
}
