<script setup>
defineProps({
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  dayTicks: { type: Array, required: true },
  showMonthScale: { type: Boolean, required: true },
  showDayScale: { type: Boolean, required: true },
  xPos: { type: Function, required: true },
  timelineViewport: { type: Object, required: true },
  yearLabel: { type: Function, required: true }
});
</script>

<template>
  <g>
    <text
      v-for="y in years"
      :key="`year-label-${y.year}`"
      :x="xPos(y.time)"
      :y="timelineViewport.y - 26"
      text-anchor="middle"
      font-size="12"
      fill="var(--timeline-year-label, var(--text-secondary))"
    >
      {{ yearLabel(y.year) }}
    </text>
    <g v-if="showMonthScale">
      <text
        v-for="tick in monthTicks"
        :key="`month-label-${tick.time}`"
        :x="xPos(tick.time)"
        :y="timelineViewport.y - 12"
        text-anchor="middle"
        font-size="10"
        fill="var(--timeline-month-label, var(--text-muted))"
      >
        {{ tick.label }}
      </text>
      <text
        v-if="showDayScale"
        v-for="tick in dayTicks"
        :key="`day-label-${tick.time}-${tick.day}`"
        :x="xPos(tick.time)"
        :y="timelineViewport.y - 2"
        text-anchor="middle"
        font-size="9"
        fill="var(--timeline-day-label, var(--text-faint))"
      >
        {{ tick.day }}
      </text>
    </g>
  </g>
</template>
