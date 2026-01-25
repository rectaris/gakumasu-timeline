<script setup>
import { EVENT_BAR_HEIGHT } from "../utils/constants";

defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  yPos: { type: Function, required: true },
  isDayScale: { type: Boolean, required: true },
  isSingleWithinRange: { type: Function, required: true },
  yearLabel: { type: Function, required: true }
});

const emit = defineEmits(["select"]);

function handleSelect(event) {
  emit("select", event);
}
</script>

<template>
  <g v-for="event in visibleEvents" :key="event.id">
    <g @click="handleSelect(event)" class="event-group">
      <title>
        {{ event.title }}
        <template v-if="event.detail">
          {{ event.detail }}
        </template>
      </title>

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(event.displayStart)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - EVENT_BAR_HEIGHT / 2"
        :width="xPos(event.displayEnd) - xPos(event.displayStart)"
        :height="EVENT_BAR_HEIGHT"
        :fill="event.color"
        rx="6"
      />

      <circle
        v-if="isSingleWithinRange(event)"
        :cx="(xPos(event.displayStart) + xPos(event.displayEnd)) / 2"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="3"
        fill="#333"
      />

      <circle
        :cx="xPos(event.displayStart)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="#333"
      />

      <circle
        :cx="xPos(event.displayEnd)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="#333"
        stroke-width="1.5"
      />
    </g>
  </g>
</template>
