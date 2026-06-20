<script setup>
import { getCurrentInstance } from "vue";
import TimelineViewport from "./TimelineViewport.vue";
import TimelineScaleLines from "./TimelineScaleLines.vue";
import TimelineLaneLines from "./TimelineLaneLines.vue";
import TimelineLaneLabels from "./TimelineLaneLabels.vue";
import TimelineEvents from "./TimelineEvents.vue";

const props = defineProps({
  renderContext: { type: Object, required: true },
  interactionHandlers: { type: Object, required: true },
  isDragging: { type: Boolean, required: true }
});

const emit = defineEmits(["select"]);
const CLIP_PADDING = 6;
const clipId = `timeline-clip-${getCurrentInstance()?.uid ?? "default"}`;
</script>

<template>
  <svg
    class="timeline-svg"
    :class="{ 'timeline-svg--dragging': isDragging }"
    :width="renderContext.width"
    :height="renderContext.svgHeight"
    :viewBox="`0 0 ${renderContext.width} ${renderContext.svgHeight}`"
    preserveAspectRatio="xMidYMin meet"
    role="img"
    aria-label="キャラクタータイムライン"
    @mousedown="interactionHandlers.onMouseDown"
    @wheel="interactionHandlers.onWheel"
    @touchstart="interactionHandlers.onTouchStart"
    @touchmove="interactionHandlers.onTouchMove"
    @touchend="interactionHandlers.onTouchEnd"
    @touchcancel="interactionHandlers.onTouchEnd"
  >
    <defs>
      <clipPath :id="clipId">
        <rect
          :x="renderContext.timelineViewport.x - CLIP_PADDING"
          :y="renderContext.timelineViewport.y"
          :width="renderContext.timelineViewport.width + CLIP_PADDING * 2"
          :height="renderContext.timelineViewport.height"
        />
      </clipPath>
    </defs>

    <TimelineViewport :timeline-viewport="renderContext.timelineViewport" />
    <g :clip-path="`url(#${clipId})`">
      <TimelineScaleLines
        :years="renderContext.years"
        :month-ticks="renderContext.monthTicks"
        :day-ticks="renderContext.dayTicks"
        :show-month-scale="renderContext.showMonthScale"
        :show-day-scale="renderContext.showDayScale"
        :x-pos="renderContext.xPos"
        :timeline-viewport="renderContext.timelineViewport"
      />

      <TimelineLaneLines
        :lane-layouts="renderContext.laneLayouts"
        :timeline-viewport="renderContext.timelineViewport"
      />

      <TimelineEvents
        :visible-events="renderContext.visibleEvents"
        :x-pos="renderContext.xPos"
        :y-pos="renderContext.yPos"
        :event-bar-height="renderContext.eventBarHeight"
        :is-single-within-range="renderContext.isSingleWithinRange"
        :selected-event="renderContext.selectedEvent"
        :timeline-viewport="renderContext.timelineViewport"
        @select="event => emit('select', event)"
      />
    </g>

    <TimelineLaneLabels
      :characters="renderContext.characters"
      :lane-center-y="renderContext.laneCenterY"
      :left-label-width="renderContext.leftLabelWidth"
      :invert-hex-color="renderContext.invertHexColor"
    />
  </svg>
</template>
