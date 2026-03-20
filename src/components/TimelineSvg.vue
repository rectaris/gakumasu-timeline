<script setup>
import TimelineViewport from "./TimelineViewport.vue";
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
  laneLayouts: { type: Array, required: true },
  yPos: { type: Function, required: true },
  eventBarHeight: { type: Number, required: true },
  characters: { type: Array, required: true },
  visibleEvents: { type: Array, required: true },
  isSingleWithinRange: { type: Function, required: true },
  invertHexColor: { type: Function, required: true },
  leftLabelWidth: { type: Number, required: true },
  onMouseDown: { type: Function, required: true },
  onWheel: { type: Function, required: true },
  onTouchStart: { type: Function, required: true },
  onTouchMove: { type: Function, required: true },
  onTouchEnd: { type: Function, required: true },
  isDragging: { type: Boolean, required: true }
});

const emit = defineEmits(["select"]);
const CLIP_PADDING = 6;
</script>

<template>
  <svg
    class="timeline-svg"
    :class="{ 'timeline-svg--dragging': isDragging }"
    :width="width"
    :height="svgHeight"
    :viewBox="`0 0 ${width} ${svgHeight}`"
    preserveAspectRatio="xMidYMin meet"
    @mousedown="onMouseDown"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <defs>
      <clipPath id="timeline-clip">
        <rect
          :x="timelineViewport.x - CLIP_PADDING"
          :y="timelineViewport.y"
          :width="timelineViewport.width + CLIP_PADDING * 2"
          :height="timelineViewport.height"
        />
      </clipPath>
    </defs>

    <TimelineViewport :timeline-viewport="timelineViewport" />
    <g clip-path="url(#timeline-clip)">
      <TimelineScaleLines
        :years="years"
        :month-ticks="monthTicks"
        :day-ticks="dayTicks"
        :show-month-scale="showMonthScale"
        :show-day-scale="showDayScale"
        :x-pos="xPos"
        :timeline-viewport="timelineViewport"
      />

      <TimelineLaneLines
        :lane-layouts="laneLayouts"
        :timeline-viewport="timelineViewport"
      />

      <TimelineEvents
        :visible-events="visibleEvents"
        :x-pos="xPos"
        :y-pos="yPos"
        :event-bar-height="eventBarHeight"
        :is-single-within-range="isSingleWithinRange"
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
