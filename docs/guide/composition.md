# Composition

Agala components are designed to be composed in the application. Keep domain
rules, data fetching, and workflow state in application components; use Agala
for the visual structure, interaction behavior, and accessible states.

## Choose the right composition tool

- Use slots when a component owns a region but the application owns its
  content: `AgalaCard` has `header`, default, and `footer` slots; `AgalaModal`
  has a body and a scoped `footer` slot.
- Use `as` when a layout or surface needs a different semantic element. The
  component keeps its styles while rendering `article`, `section`, `nav`, or
  another component.
- Use `as-child` on `AgalaButton` when an action should be rendered by a
  router link or another single-root component. The child receives the Agala
  button styles and interaction attributes.
- Use the structured data API for repeated, predictable content such as table
  columns, sidebar trees, select options, and calendar events. Use slots for
  content that needs application-specific markup.

## Semantic layout

```vue
<AgalaStack as="main" gap="1.5rem">
  <AgalaCard as="article" padding="lg">
    <template #header>Project overview</template>
    <AgalaVStack gap="1rem">
      <AgalaStat label="Open tasks" :value="tasks.length" />
      <AgalaHStack justify="end" gap="0.5rem">
        <AgalaButton variant="ghost">Cancel</AgalaButton>
        <AgalaButton>Save project</AgalaButton>
      </AgalaHStack>
    </AgalaVStack>
  </AgalaCard>
</AgalaStack>
```

`AgalaStack`, `AgalaHStack`, and `AgalaVStack` accept HTML elements or Vue
components through `as`. Choose the element that matches the meaning of the
content; do not use `div` everywhere simply because it is the default.

## Composing teleported and file-upload surfaces

`AgalaModal` exposes `overlay-class` and `content-class` because both elements
are teleported outside the consumer component tree. Use those hooks with
`--agala-modal-align`, `--agala-modal-overlay-padding`,
`--agala-modal-overlay-opacity`, and `--agala-modal-body-padding` for product
surfaces such as command palettes. Ordinary blocking dialogs should keep the
defaults.

`AgalaFileUpload` accepts a consumer `class` and exposes dropzone variables for
`zone-min-height`, `zone-padding`, `zone-border-width`, `zone-border-color`,
`zone-radius`, `zone-background`, hover/dragging border and background,
`zone-focus-ring`, and `drag-text-weight`. Prefix every variable with
`--agala-file-upload-`; do not target the component's internal selectors.

```vue
<AgalaModal
  v-model:open="open"
  overlay-class="command-overlay"
  content-class="command-dialog"
  hide-header
>
  ...
</AgalaModal>

<AgalaFileUpload class="invoice-dropzone" v-model="files" />

<style>
.command-overlay {
  --agala-modal-align: flex-start;
  --agala-modal-overlay-padding: 5rem 1.5rem 1.5rem;
  --agala-modal-overlay-opacity: 0;
}

.command-dialog {
  --agala-modal-body-padding: 0;
}

.invoice-dropzone {
  --agala-file-upload-zone-min-height: 12rem;
  --agala-file-upload-zone-background: hsl(var(--agala-muted) / 0.25);
}
</style>
```

## Router links and custom actions

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <AgalaButton as-child variant="outline">
    <RouterLink to="/projects">View all projects</RouterLink>
  </AgalaButton>
</template>
```

`as-child` expects exactly one root child. Let that child own its destination
props (`to`, `href`, and so on). Do not combine `as-child` with `loading` or an
icon prop; put those elements inside the child when the link needs them.

## Application-level components

Prefer small application components that compose Agala primitives instead of
adding one-off styles to every page:

```vue
<!-- ProjectSummary.vue -->
<template>
  <AgalaCard as="article">
    <template #header>
      <AgalaHStack align="center">
        <AgalaAvatar :src="project.owner.avatar" :alt="project.owner.name" />
        <AgalaVStack gap="0.125rem">
          <h2>{{ project.name }}</h2>
          <span>{{ project.owner.name }}</span>
        </AgalaVStack>
        <AgalaSpacer />
        <AgalaBadge>{{ project.status }}</AgalaBadge>
      </AgalaHStack>
    </template>

    <AgalaStack as="dl" direction="horizontal" wrap gap="1rem">
      <AgalaStat label="Tasks" :value="project.taskCount" layout="inline" :bordered="false" />
      <AgalaStat label="Members" :value="project.memberCount" layout="inline" :bordered="false" />
    </AgalaStack>

    <template #footer>
      <AgalaButton as-child variant="ghost">
        <RouterLink :to="`/projects/${project.id}`">Open project</RouterLink>
      </AgalaButton>
    </template>
  </AgalaCard>
</template>
```

The application owns `ProjectSummary` and its domain data. Agala owns the
reusable visual and interaction contracts. This keeps new screens consistent
without forcing the library to know application-specific models.

## Responsive composition

Compose for the narrowest meaningful width first, then add room with CSS and
the existing responsive props. Use `wrap`, `min-width: 0`, `AgalaSpacer`,
`AgalaSidebar responsive`, and table/tab overflow behavior where appropriate.
Keep critical actions in normal reading order, and verify at 320px, 390px,
landscape mobile, tablet, and desktop widths.

Avoid solving layout with JavaScript media queries unless behavior—not just
presentation—must change. CSS-first composition prevents hydration differences
in Vue SSR and works across Vite, Nuxt, and standalone Vue applications.
