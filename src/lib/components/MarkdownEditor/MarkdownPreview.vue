<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import type { MarkdownPreviewProps } from './types'

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
})

const defaultLinkOpen = markdown.renderer.rules.link_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token.attrGet('href') || ''

  if (/^(https?:)?\/\//i.test(href)) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}

const props = withDefaults(defineProps<MarkdownPreviewProps>(), {
  source: '',
  emptyText: 'Nothing to preview yet.',
  ariaLabel: 'Markdown preview',
  rows: 8,
})

const renderedHtml = computed(() => markdown.render(props.source || ''))

const wrapperCls = computed(() => [
  'preview',
  !props.source ? 'previewEmpty' : undefined,
  props.class,
].filter(Boolean).join(' '))

const previewStyle = computed<Record<string, string>>(() => ({
  '--agala-markdown-preview-rows': String(props.rows),
}))
</script>

<template>
  <div
    :class="wrapperCls"
    :style="previewStyle"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- eslint-disable vue/no-v-html -- markdown-it escapes raw HTML because html is false -->
    <div
      v-if="source"
      class="previewContent"
      v-html="renderedHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
    <p
      v-else
      class="emptyPreview"
    >
      {{ emptyText }}
    </p>
  </div>
</template>

<style scoped>
.preview {
  box-sizing: border-box;
  min-height: calc((1lh * var(--agala-markdown-preview-rows)) + 1rem + (var(--agala-border-width) * 2));
  width: 100%;
  overflow: auto;
  border: var(--agala-border-width) solid hsl(var(--agala-border));
  border-radius: calc(var(--agala-radius) - 2px);
  background: hsl(var(--agala-background));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-sans);
  font-size: var(--agala-font-size-base);
  line-height: var(--agala-line-height-relaxed);
  padding: 0.75rem;
}

.previewEmpty {
  display: flex;
  align-items: center;
}

.emptyPreview {
  margin: 0;
  color: hsl(var(--agala-muted-foreground));
  font-size: var(--agala-font-size-sm);
}

.previewContent {
  color: hsl(var(--agala-foreground));
}

.previewContent :deep(*) {
  margin-top: 0;
}

.previewContent :deep(*:last-child) {
  margin-bottom: 0;
}

.previewContent :deep(h1),
.previewContent :deep(h2),
.previewContent :deep(h3),
.previewContent :deep(h4) {
  color: hsl(var(--agala-foreground));
  font-weight: var(--agala-font-weight-semibold);
  line-height: var(--agala-line-height-tight);
  margin-bottom: 0.5rem;
}

.previewContent :deep(h1) {
  font-size: 1.5rem;
}

.previewContent :deep(h2) {
  font-size: 1.25rem;
}

.previewContent :deep(h3) {
  font-size: 1.125rem;
}

.previewContent :deep(p),
.previewContent :deep(ul),
.previewContent :deep(ol),
.previewContent :deep(blockquote),
.previewContent :deep(pre),
.previewContent :deep(table) {
  margin-bottom: 0.75rem;
}

.previewContent :deep(ul),
.previewContent :deep(ol) {
  padding-left: 1.25rem;
}

.previewContent :deep(a) {
  color: hsl(var(--agala-primary));
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.previewContent :deep(code) {
  border-radius: var(--agala-radius-sm);
  background: hsl(var(--agala-muted));
  color: hsl(var(--agala-foreground));
  font-family: var(--agala-font-mono);
  font-size: 0.9em;
  padding: 0.125rem 0.25rem;
}

.previewContent :deep(pre) {
  overflow: auto;
  border-radius: calc(var(--agala-radius) - 2px);
  background: hsl(var(--agala-muted));
  padding: 0.75rem;
}

.previewContent :deep(pre code) {
  background: transparent;
  padding: 0;
}

.previewContent :deep(blockquote) {
  border-left: 3px solid hsl(var(--agala-border));
  color: hsl(var(--agala-muted-foreground));
  padding-left: 0.75rem;
}
</style>
