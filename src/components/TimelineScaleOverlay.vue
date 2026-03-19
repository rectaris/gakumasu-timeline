<script setup>
import TimelineScaleLabels from "./TimelineScaleLabels.vue";

defineProps({
  width: { type: Number, required: true },
  overlayHeight: { type: Number, required: true },
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
  <div class="timeline-scale-overlay" aria-hidden="true">
    <svg
      :width="width"
      :height="overlayHeight"
      :viewBox="`0 0 ${width} ${overlayHeight}`"
      preserveAspectRatio="none"
    >
      <TimelineScaleLabels
        :years="years"
        :month-ticks="monthTicks"
        :day-ticks="dayTicks"
        :show-month-scale="showMonthScale"
        :show-day-scale="showDayScale"
        :x-pos="xPos"
        :timeline-viewport="timelineViewport"
        :year-label="yearLabel"
      />
    </svg>
  </div>
</template>
