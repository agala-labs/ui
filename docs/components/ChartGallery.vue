<script setup lang="ts">
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const revenue = [
  { name: '2026', data: [120, 180, 165, 240, 225, 310] },
  { name: '2025', data: [90, 125, 150, 175, 190, 215] },
]
const plans = [
  { name: 'Starter', data: [48, 56, 62, 71, 75, 84] },
  { name: 'Pro', data: [22, 28, 36, 42, 51, 59] },
]
const scatter = [{ name: 'Accounts', data: [[2, 18], [4, 31], [6, 44], [8, 63], [11, 72], [14, 88]] }]
const radar = [
  { name: 'Current', data: [88, 74, 92, 67, 81] },
  { name: 'Previous', data: [72, 69, 85, 61, 76] },
]
const indicators = [
  { name: 'Quality', max: 100 }, { name: 'Speed', max: 100 }, { name: 'Coverage', max: 100 },
  { name: 'Adoption', max: 100 }, { name: 'Reliability', max: 100 },
]
</script>

<template>
  <div class="chart-gallery">
    <article>
      <header>
        <div><h3>Revenue trend</h3><p>Line · multiple series</p></div><AgalaBadge variant="success">
          +18.6%
        </AgalaBadge>
      </header><BaseChart
        type="line"
        :labels="months"
        :datasets="revenue"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Members by plan</h3><p>Bar · grouped categories</p></div></header><BaseChart
        type="bar"
        :labels="months"
        :datasets="plans"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Plan mix</h3><p>Pie · category share</p></div></header><BaseChart
        type="pie"
        :labels="['Starter', 'Pro', 'Business', 'Enterprise']"
        :datasets="[{ name: 'Members', data: [42, 31, 19, 8] }]"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Feature health</h3><p>Radar · comparative profile</p></div></header><BaseChart
        type="radar"
        :indicators="indicators"
        :datasets="radar"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Engagement correlation</h3><p>Scatter · paired values</p></div></header><BaseChart
        type="scatter"
        :datasets="scatter"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Capacity</h3><p>Gauge · single value</p></div></header><BaseChart
        type="gauge"
        :datasets="[{ name: 'Used', data: [74] }]"
        :max="100"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Subscriptions</h3><p>Stacked bar</p></div></header><BaseChart
        type="bar"
        stacked
        :labels="months"
        :datasets="plans"
        :height="280"
      />
    </article>
    <article>
      <header><div><h3>Member growth</h3><p>Stacked area</p></div></header><BaseChart
        type="line"
        stacked
        :labels="months"
        :datasets="plans.map(item => ({ ...item, areaStyle: true }))"
        :height="280"
      />
    </article>
  </div>
</template>

<style scoped>
.chart-gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.chart-gallery article { min-width: 0; padding: 1rem; border: 1px solid hsl(var(--agala-border)); border-radius: var(--agala-radius-lg); background: hsl(var(--agala-card)); }
.chart-gallery header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.chart-gallery h3 { margin: 0; border: 0; font-size: 0.95rem; }
.chart-gallery p { margin: 0.2rem 0 0; color: hsl(var(--agala-muted-foreground)); font-size: 0.75rem; }
@media (max-width: 820px) { .chart-gallery { grid-template-columns: 1fr; } }
</style>
