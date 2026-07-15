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
  isRow.value ? 'statRow' : undefined,
  isInline.value ? 'statInline' : undefined,
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div :class="statCls">
    <!-- Row layout: icon + content side by side -->
    <template v-if="isRow">
      <div v-if="icon" :class="iconBgClass">
        <AgalaIcon :name="icon as IconName" :size="16" />
      </div>
      <div class="statBody">
        <span class="statLabel" :style="labelTransform ? { textTransform: labelTransform } : undefined">{{ label }}</span>
        <span class="statValue">{{ value }}</span>
        <span
          v-if="secondaryValue !== undefined"
          class="statSecondary"
        >
          {{ secondaryValue }}
        </span>
        <div v-if="trend !== undefined" :class="['trend', trendCls]">
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
            <polyline v-if="trendDir === 'up'"   points="18 15 12 9 6 15" />
            <polyline v-else                      points="6 9 12 15 18 9" />
          </svg>
          <span class="trendText">{{ trendSign }}{{ trend }}%<template v-if="trendLabel">&ensp;{{ trendLabel }}</template></span>
        </div>
      </div>
    </template>

    <!-- Inline layout: label: value on one line -->
    <template v-else-if="isInline">
      <span class="statLabel" :style="labelTransform ? { textTransform: labelTransform } : undefined">{{ label }}:</span>
      <span class="statValue">{{ value }}</span>
      <span
        v-if="secondaryValue !== undefined"
        class="statSecondary"
      >
        {{ secondaryValue }}
      </span>
      <div v-if="trend !== undefined" :class="['trend', trendCls]">
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
          <polyline v-if="trendDir === 'up'"   points="18 15 12 9 6 15" />
          <polyline v-else                      points="6 9 12 15 18 9" />
        </svg>
        <span class="trendText">{{ trendSign }}{{ trend }}%<template v-if="trendLabel">&ensp;{{ trendLabel }}</template></span>
      </div>
    </template>

    <!-- Vertical layout: current default -->
    <template v-else>
      <span class="statLabel" :style="labelTransform ? { textTransform: labelTransform } : undefined">{{ label }}</span>
      <span class="statValue">{{ value }}</span>
      <span
        v-if="secondaryValue !== undefined"
        class="statSecondary"
      >
        {{ secondaryValue }}
      </span>
      <div v-if="trend !== undefined" :class="['trend', trendCls]">
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
          <polyline v-if="trendDir === 'up'"   points="18 15 12 9 6 15" />
          <polyline v-else                      points="6 9 12 15 18 9" />
        </svg>
        <span class="trendText">{{ trendSign }}{{ trend }}%<template v-if="trendLabel">&ensp;{{ trendLabel }}</template></span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  padding: var(--agala-stat-padding, 1.25rem);
  gap: var(--agala-stat-gap, 0.25rem);
  background: var(--agala-stat-bg, hsl(var(--agala-card)));
  border: var(--agala-stat-border, var(--agala-border-width) solid hsl(var(--agala-border)));
  border-radius: var(--agala-stat-radius, var(--agala-radius-lg));
  box-shadow: var(--agala-stat-shadow, var(--agala-shadow-sm));
}

.statUnbordered {
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.statLabel {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-label-size, var(--agala-font-size-sm));
  font-weight: var(--agala-stat-label-weight, var(--agala-font-weight-medium));
  color: var(--agala-stat-label-color, hsl(var(--agala-muted-foreground)));
  text-transform: var(--agala-stat-label-transform, uppercase);
  letter-spacing: var(--agala-stat-label-spacing, var(--agala-letter-spacing-wide));
}

.statValue {
  font-family: var(--agala-font-sans);
  font-size: var(--agala-stat-value-size, 1.875rem);
  font-weight: var(--agala-stat-value-weight, var(--agala-font-weight-bold));
  color: var(--agala-stat-value-color, hsl(var(--agala-foreground)));
  line-height: 1;
  margin: 0.25rem 0;
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
  margin-top: 0.25rem;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-direction: row;
}
.statRow .statBody {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.statRow .statLabel {
  margin: 0;
}
.statRow .statValue {
  margin: 0;
}

/* Inline layout */
.statInline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.statInline .statLabel {
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
}
.statInline .statValue {
  margin: 0;
}

/* Icon circle */
.statIcon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.statIconPrimary { background: hsl(var(--agala-primary) / 0.1); color: hsl(var(--agala-primary)); }
.statIconDanger { background: hsl(var(--agala-danger) / 0.1); color: hsl(var(--agala-danger)); }
.statIconSuccess { background: hsl(var(--agala-success) / 0.1); color: hsl(var(--agala-success)); }
.statIconWarning { background: hsl(var(--agala-warning) / 0.1); color: hsl(var(--agala-warning)); }
.statIconInfo { background: hsl(var(--agala-accent) / 0.5); color: hsl(var(--agala-accent-foreground)); }
</style>
