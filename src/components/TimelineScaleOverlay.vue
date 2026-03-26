<script setup>
import { getCurrentInstance } from "vue";
import TimelineScaleLabels from "./TimelineScaleLabels.vue";

const props = defineProps({
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

const clipId = `timeline-scale-overlay-clip-${getCurrentInstance()?.uid ?? "default"}`;
</script>

<template>
  <div class="timeline-scale-overlay" aria-hidden="true">
    <svg
      :width="width"
      :height="overlayHeight"
      :viewBox="`0 0 ${width} ${overlayHeight}`"
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath :id="clipId">
          <rect
            :x="props.timelineViewport.x"
            y="0"
            :width="props.timelineViewport.width"
            :height="props.overlayHeight"
          />
        </clipPath>
      </defs>
      <g :clip-path="`url(#${clipId})`">
        <TimelineScaleLabels
          :years="props.years"
          :month-ticks="props.monthTicks"
          :day-ticks="props.dayTicks"
          :show-month-scale="props.showMonthScale"
          :show-day-scale="props.showDayScale"
          :x-pos="props.xPos"
          :timeline-viewport="props.timelineViewport"
          :year-label="props.yearLabel"
        />
      </g>
    </svg>
  </div>
</template>
