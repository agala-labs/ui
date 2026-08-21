import type { Component } from 'vue'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardAccent = 'top' | 'left' | 'right' | 'bottom'

export interface CardProps {
  as?: string | Component
  padding?: CardPadding
  headerVariant?: 'default' | 'compact'
  class?: string
  accent?: CardAccent
  accentColor?: string
}
