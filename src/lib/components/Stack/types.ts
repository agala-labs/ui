import type { Component } from 'vue'

export interface StackProps {
  direction?: 'vertical' | 'horizontal'
  gap?: string
  align?: string
  justify?: string
  wrap?: boolean
  as?: string | Component
  class?: string
}
