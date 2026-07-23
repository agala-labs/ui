<script setup lang="ts">
import { computed, ref } from 'vue'
import { AgalaIcon, type IconName } from '@ui'
import { iconCatalog, type IconCategory } from '../../src/lib/components/AgalaIcon/catalog'

const query = ref('')
const category = ref<'all' | IconCategory>('all')
const categories: Array<'all' | IconCategory> = ['all', 'actions', 'navigation', 'status', 'content', 'commerce', 'healthcare', 'system']

const filteredIcons = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return iconCatalog.filter((icon) => {
    const aliases = 'aliases' in icon ? icon.aliases : []
    const matchesQuery = !needle || [icon.name, ...aliases].some(value => value.includes(needle))
    return matchesQuery && (category.value === 'all' || icon.category === category.value)
  })
})

function aliasesFor(icon: (typeof iconCatalog)[number]) {
  return 'aliases' in icon ? icon.aliases.join(', ') : ''
}

function motionFor(icon: (typeof iconCatalog)[number]) {
  return 'motion' in icon ? 'hover' as const : 'none' as const
}
</script>

<template>
  <section class="icon-catalog" aria-labelledby="icon-catalog-title">
    <div class="icon-catalog__heading">
      <div>
        <h2 id="icon-catalog-title">Icon catalog</h2>
        <p>Search the semantic Agala names. Lucide remains an internal implementation detail.</p>
      </div>
      <span class="icon-catalog__count">{{ filteredIcons.length }} icons</span>
    </div>

    <label class="icon-catalog__search">
      <AgalaIcon name="search" size="sm" />
      <span class="sr-only">Search icons</span>
      <input v-model="query" type="search" placeholder="Search icons or aliases…">
    </label>

    <div class="icon-catalog__filters" aria-label="Filter icons by category">
      <button
        v-for="value in categories"
        :key="value"
        type="button"
        :class="{ 'is-active': category === value }"
        :aria-pressed="category === value"
        @click="category = value"
      >
        {{ value }}
      </button>
    </div>

    <div class="icon-catalog__grid" aria-live="polite">
      <article v-for="icon in filteredIcons" :key="icon.name" class="icon-card">
        <div class="icon-card__preview">
          <AgalaIcon
            :name="icon.name as IconName"
            size="lg"
            :motion="motionFor(icon)"
          />
        </div>
        <code>{{ icon.name }}</code>
        <span>{{ icon.category }} · {{ icon.origin }}</span>
        <span v-if="aliasesFor(icon)" class="icon-card__alias">
          <AgalaIcon
            :name="('aliases' in icon ? icon.aliases[0] : icon.name) as IconName"
            size="xs"
          />
          Alias: {{ aliasesFor(icon) }}
        </span>
      </article>
    </div>

    <p v-if="filteredIcons.length === 0" class="icon-catalog__empty">
      No icon matches “{{ query }}”. Try a product concept such as “stock”, “health”, or “receipt”.
    </p>

    <h3 id="icon-motion">Motion</h3>
    <p>Motion is opt-in and contextual. Hover the controls below; reduced-motion preferences are always respected.</p>
    <div class="icon-catalog__motion">
      <button type="button"><AgalaIcon name="bell" motion="hover" /> Notifications</button>
      <button type="button"><AgalaIcon name="external-link" motion="hover" /> Open report</button>
      <button type="button"><AgalaIcon name="trash" motion="hover" /> Delete</button>
      <button type="button"><AgalaIcon name="chevron-down" motion="active" active /> Expanded</button>
    </div>
  </section>
</template>

<style scoped>
.icon-catalog { margin-top: var(--agala-space-10); }
.icon-catalog__heading { display: flex; align-items: end; justify-content: space-between; gap: var(--agala-space-4); }
.icon-catalog__heading h2 { margin-bottom: var(--agala-space-1); }
.icon-catalog__heading p { margin: 0; color: hsl(var(--agala-muted-foreground)); }
.icon-catalog__count { color: hsl(var(--agala-muted-foreground)); font-size: var(--agala-font-size-sm); white-space: nowrap; }
.icon-catalog__search { display: flex; align-items: center; gap: var(--agala-space-2); margin-top: var(--agala-space-5); padding: 0 var(--agala-space-3); min-height: var(--agala-height-md); border: var(--agala-border-width) solid hsl(var(--agala-input)); border-radius: var(--agala-radius-md); background: hsl(var(--agala-input-background)); color: hsl(var(--agala-muted-foreground)); }
.icon-catalog__search:focus-within { border-color: hsl(var(--agala-ring)); box-shadow: 0 0 0 3px hsl(var(--agala-ring) / .16); }
.icon-catalog__search input { width: 100%; border: 0; outline: 0; background: transparent; color: hsl(var(--agala-foreground)); font: inherit; }
.icon-catalog__filters { display: flex; gap: var(--agala-space-1); margin: var(--agala-space-3) 0 var(--agala-space-5); padding-bottom: var(--agala-space-1); overflow-x: auto; }
.icon-catalog__filters button, .icon-catalog__motion button { border: var(--agala-border-width) solid hsl(var(--agala-border)); border-radius: var(--agala-radius-full); background: hsl(var(--agala-card)); color: hsl(var(--agala-muted-foreground)); font: inherit; font-size: var(--agala-font-size-sm); cursor: pointer; }
.icon-catalog__filters button { padding: var(--agala-space-1-5) var(--agala-space-3); text-transform: capitalize; }
.icon-catalog__filters button.is-active { border-color: hsl(var(--agala-primary) / .22); background: hsl(var(--agala-primary) / .09); color: hsl(var(--agala-primary)); }
.icon-catalog__filters button:focus-visible, .icon-catalog__motion button:focus-visible { outline: 0; box-shadow: 0 0 0 3px hsl(var(--agala-ring) / .2); }
.icon-catalog__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: var(--agala-space-2); }
.icon-card { min-width: 0; padding: var(--agala-space-3); border: var(--agala-border-width) solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); background: hsl(var(--agala-card)); }
.icon-card__preview { display: grid; width: 2.5rem; height: 2.5rem; margin-bottom: var(--agala-space-3); place-items: center; border-radius: var(--agala-radius-md); background: hsl(var(--agala-accent)); color: hsl(var(--agala-accent-foreground)); }
.icon-card code { display: block; overflow: hidden; color: hsl(var(--agala-foreground)); font-size: var(--agala-font-size-sm); text-overflow: ellipsis; }
.icon-card > span { display: block; margin-top: var(--agala-space-1); color: hsl(var(--agala-muted-foreground)); font-size: var(--agala-font-size-xs); text-transform: capitalize; }
.icon-card .icon-card__alias { display: flex; align-items: center; gap: var(--agala-space-1); text-transform: none; }
.icon-catalog__empty { padding: var(--agala-space-8); border: var(--agala-border-width) dashed hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); text-align: center; color: hsl(var(--agala-muted-foreground)); }
.icon-catalog__motion { display: flex; flex-wrap: wrap; gap: var(--agala-space-2); }
.icon-catalog__motion button { display: inline-flex; align-items: center; gap: var(--agala-space-2); padding: var(--agala-space-2) var(--agala-space-3); color: hsl(var(--agala-foreground)); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 640px) { .icon-catalog__heading { align-items: start; flex-direction: column; } .icon-catalog__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
