<script setup lang="ts">
import { computed } from 'vue'
import { AgalaIcon } from '../AgalaIcon'
import type { StatProps } from './types'
import type { IconName } from '../AgalaIcon/types'

const props = withDefaults(defineProps<StatProps>(), {
  bordered: true,
  layout: 'vertical',
  icon: '',
  iconBg: 'primary',
})

const trendDir = computed(() => {
  if (props.trend === undefined || props.trend === 0) return 'neutral'
  return props.trend > 0 ? 'up' : 'down'
})

const trendCls = computed(() => {
  if (trendDir.value === 'up')   return 'trendUp'
  if (trendDir.value === 'down') return 'trendDown'
  return 'trendNeutral'
})

const trendSign = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend > 0 ? '+' : ''
})

const isRow = computed(() => props.layout === 'row')
const isInline = computed(() => props.layout === 'inline')

const iconBgClass = computed(() => {
  if (!props.icon) return ''
  const map: Record<string, string> = {
    primary: 'statIconPrimary',
    danger: 'statIconDanger',
    success: 'statIconSuccess',
    warning: 'statIconWarning',
    info: 'statIconInfo',
  }
  return ['statIcon', map[props.iconBg] ?? 'statIconPrimary'].join(' ')
})

const statCls = computed(() => [
  'stat',
  props.bordered === false ? 'statUnbordered' : undefined,
  props.icon ? 'statHasIcon' : undefined,
  isRow.value ? 'statRow' : undefined,
  isInline.value ? 'statInline' : undefined,
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div :class="statCls">
    <span
      v-if="icon"
      :class="iconBgClass"
      aria-hidden="true"
    >
      <AgalaIcon
        :name="icon as IconName"
        :size="16"
      />
    </span>

    <span
      class="statLabel"
      :style="labelTransform ? { textTransform: labelTransform } : undefined"
    >
      {{ label }}<template v-if="isInline">:</template>
    </span>

    <span class="statValue">{{ value }}</span>

    <div
      v-if="secondaryValue !== undefined || trend !== undefined"
      class="statMeta"
    >
      <span
        v-if="secondaryValue !== undefined"
        class="statSecondary"
      >
        {{ secondaryValue }}
      </span>
      <div
        v-if="trend !== undefined"
        :class="['trend', trendCls]"
      >
        <svg
          v-if="trendDir !== 'neutral'"
          class="trendIcon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline
            v-if="trendDir === 'up'"
            points="18 15 12 9 6 15"
          />
          <polyline
            v-else
            points="6 9 12 15 18 9"
          />
        </svg>
        <span class="trendText">{{ trendSign }}{{ trend }}%<template v-if="trendLabel">&ensp;{{ trendLabel }}</template></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'label icon'
    'value value'
    'meta meta';
  gap: var(--agala-stat-row-gap, 0.375rem) var(--agala-stat-column-gap, 0.75rem);
  padding: var(--agala-stat-padding, 1rem);
  background: var(--agala-stat-bg, hsl(var(--agala-card)));
  border: var(--agala-stat-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  border-radius: var(--agala-stat-radius, var(--agala-radius-md));
  box-shadow: var(--agala-stat-shadow, none);
}

.statUnbordered {
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.statLabel {
  grid-area: label;
  align-self: center;
  min-width: 0;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-label-size, var(--agala-font-size-sm));
  font-weight: var(--agala-stat-label-weight, var(--agala-font-weight-medium));
  color: var(--agala-stat-label-color, hsl(var(--agala-muted-foreground)));
  line-height: 1.25;
  text-transform: var(--agala-stat-label-transform, none);
  letter-spacing: var(--agala-stat-label-spacing, normal);
}

.statValue {
  grid-area: value;
  min-width: 0;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-value-size, 1.75rem);
  font-weight: var(--agala-stat-value-weight, var(--agala-font-weight-bold));
  color: var(--agala-stat-value-color, hsl(var(--agala-foreground)));
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--agala-letter-spacing-tight);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.statMeta {
  grid-area: meta;
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
}

.statSecondary {
  min-width: 0;
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-secondary-size, var(--agala-font-size-sm));
  font-weight: var(--agala-stat-secondary-weight, var(--agala-font-weight-normal));
  line-height: var(--agala-line-height-normal);
  color: var(--agala-stat-secondary-color, hsl(var(--agala-muted-foreground)));
  overflow-wrap: anywhere;
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.trendIcon {
  flex-shrink: 0;
}

.trendText {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-trend-size, var(--agala-font-size-sm));
  font-weight: var(--agala-font-weight-medium);
}

.trendUp   { color: hsl(var(--agala-success)); }
.trendDown { color: hsl(var(--agala-danger)); }
.trendNeutral { color: hsl(var(--agala-muted-foreground)); }

/* Row layout */
.statRow {
  grid-template-columns: 2rem minmax(0, 1fr);
  grid-template-areas:
    'icon label'
    'icon value'
    'icon meta';
  align-content: start;
  align-self: flex-start;
  row-gap: 0.125rem;
}

.statRow:not(.statHasIcon) {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'label'
    'value'
    'meta';
}

/* Inline layout */
.statInline {
  display: flex;
  min-height: 0;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  align-content: flex-start;
  align-self: flex-start;
  gap: 0.25rem 0.625rem;
}

.statInline > * {
  grid-area: auto;
}

.statInline .statValue {
  font-size: var(--agala-stat-inline-value-size, 1.375rem);
}

.statInline .statMeta {
  display: inline-flex;
  flex: 0 1 auto;
  align-self: baseline;
}

/* Semantic icon marker */
.statIcon {
  grid-area: icon;
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  align-self: start;
  flex-shrink: 0;
  border-radius: var(--agala-radius-sm);
}
.statIconPrimary { background: hsl(var(--agala-primary) / 0.1); color: hsl(var(--agala-primary)); }
.statIconDanger { background: hsl(var(--agala-danger) / 0.1); color: hsl(var(--agala-danger)); }
.statIconSuccess { background: hsl(var(--agala-success) / 0.1); color: hsl(var(--agala-success)); }
.statIconWarning { background: hsl(var(--agala-warning) / 0.1); color: hsl(var(--agala-warning)); }
.statIconInfo { background: hsl(var(--agala-accent) / 0.5); color: hsl(var(--agala-accent-foreground)); }
</style>
