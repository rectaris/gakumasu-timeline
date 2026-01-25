<script setup>
import TimelineViewport from "./TimelineViewport.vue";
import TimelineScaleLabels from "./TimelineScaleLabels.vue";
import TimelineScaleLines from "./TimelineScaleLines.vue";
import TimelineLaneLines from "./TimelineLaneLines.vue";
import TimelineLaneLabels from "./TimelineLaneLabels.vue";
import TimelineEvents from "./TimelineEvents.vue";

const props = defineProps({
  width: { type: Number, required: true },
  svgHeight: { type: Number, required: true },
  timelineViewport: { type: Object, required: true },
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  dayTicks: { type: Array, required: true },
  showMonthScale: { type: Boolean, required: true },
  showDayScale: { type: Boolean, required: true },
  xPos: { type: Function, required: true },
  laneCenterY: { type: Function, required: true },
  yPos: { type: Function, required: true },
  characters: { type: Array, required: true },
  visibleEvents: { type: Array, required: true },
  isDayScale: { type: Boolean, required: true },
  isSingleWithinRange: { type: Function, required: true },
  invertHexColor: { type: Function, required: true },
  leftLabelWidth: { type: Number, required: true },
  yearLabel: { type: Function, required: true },
  onTouchStart: { type: Function, required: true },
  onTouchMove: { type: Function, required: true },
  onTouchEnd: { type: Function, required: true }
});

const emit = defineEmits(["select"]);
</script>

<template>
  <svg
    :width="width"
    :height="svgHeight"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <defs>
      <clipPath id="timeline-clip">
        <rect
          :x="timelineViewport.x"
          :y="timelineViewport.y"
          :width="timelineViewport.width"
          :height="timelineViewport.height"
        />
      </clipPath>
    </defs>

    <TimelineViewport :timeline-viewport="timelineViewport" />

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

    <g clip-path="url(#timeline-clip)">
      <TimelineScaleLines
        :years="years"
        :month-ticks="monthTicks"
        :show-month-scale="showMonthScale"
        :x-pos="xPos"
        :timeline-viewport="timelineViewport"
      />

      <TimelineLaneLines
        :characters="characters"
        :lane-center-y="laneCenterY"
        :timeline-viewport="timelineViewport"
      />

      <TimelineEvents
        :visible-events="visibleEvents"
        :x-pos="xPos"
        :y-pos="yPos"
        :is-day-scale="isDayScale"
        :is-single-within-range="isSingleWithinRange"
        :year-label="yearLabel"
        @select="event => emit('select', event)"
      />
    </g>

    <TimelineLaneLabels
      :characters="characters"
      :lane-center-y="laneCenterY"
      :left-label-width="leftLabelWidth"
      :invert-hex-color="invertHexColor"
    />
  </svg>
</template>
