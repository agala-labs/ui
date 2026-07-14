<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { AgalaModalProvider, AgalaToastProvider } from '@ui'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout />
  <AgalaModalProvider />
  <AgalaToastProvider />
</template>
