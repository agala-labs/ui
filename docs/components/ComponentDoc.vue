<script setup lang="ts">
import { computed } from 'vue'
import { componentMap } from '../data/components'
import ComponentPreview from './ComponentPreview.vue'
import DemoFrame from './DemoFrame.vue'

const props = defineProps<{ slug: string }>()
const component = computed(() => componentMap[props.slug])
</script>

<template>
  <article
    v-if="component"
    class="component-doc"
  >
    <p class="component-doc__eyebrow">
      @el-agala/ui
    </p>
    <h1>{{ component.name }}</h1>
    <p class="component-doc__lead">
      {{ component.description }}
    </p>

    <h2 id="example">
      Example
    </h2>
    <DemoFrame :code="component.snippet">
      <ComponentPreview :slug="component.slug" />
    </DemoFrame>

    <h2 id="import">
      Import
    </h2>
    <pre><code>import { {{ component.exports.join(', ') }} } from '@el-agala/ui'</code></pre>

    <h2 id="api">
      API
    </h2>
    <p v-if="component.props.length === 0">
      This component has no public props.
    </p>
    <table v-else>
      <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr
          v-for="prop in component.props"
          :key="prop.name"
        >
          <td><code>{{ prop.name }}</code></td>
          <td><code>{{ prop.type }}</code></td>
          <td><code v-if="prop.default">{{ prop.default }}</code><span v-else>—</span></td>
          <td>{{ prop.description }}</td>
        </tr>
      </tbody>
    </table>

    <template v-if="component.events?.length">
      <h3 id="events">
        Events
      </h3>
      <ul>
        <li
          v-for="event in component.events"
          :key="event"
        >
          <code>{{ event }}</code>
        </li>
      </ul>
    </template>

    <template v-if="component.slots?.length">
      <h3 id="slots">
        Slots
      </h3>
      <ul>
        <li
          v-for="slot in component.slots"
          :key="slot"
        >
          <code>{{ slot }}</code>
        </li>
      </ul>
    </template>

    <h2 id="accessibility">
      Accessibility
    </h2>
    <p>{{ component.accessibility }}</p>
  </article>
  <AgalaAlert
    v-else
    variant="danger"
    title="Unknown component"
  >
    No catalog entry exists for <code>{{ slug }}</code>.
  </AgalaAlert>
</template>

<style scoped>
.component-doc__eyebrow {
  margin: 0 0 0.4rem;
  color: hsl(var(--agala-primary));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.component-doc h1 { margin-top: 0; }
.component-doc__lead { margin-top: -0.5rem; font-size: 1.12rem; color: hsl(var(--agala-muted-foreground)); }
</style>
