<script setup>
import { EVENT_BAR_HEIGHT } from "../utils/constants";

defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  eventDisplayStart: { type: Function, required: true },
  eventDisplayEnd: { type: Function, required: true },
  eventY: { type: Function, required: true },
  isSingleWithinRange: { type: Function, required: true },
  selectEvent: { type: Function, required: true },
  yearLabel: { type: Function, required: true }
});
</script>

<template>
  <g v-for="event in visibleEvents" :key="event.id">
    <g @click="selectEvent(event)" class="event-group">
      <title>
        {{ event.character }}
        {{ yearLabel(event.start.year) }} {{ event.start.month }}月
        <template
          v-if="
            event.start.year !== event.end.year ||
            event.start.month !== event.end.month
          "
        >
          〜 {{ yearLabel(event.end.year) }} {{ event.end.month }}月
        </template>
        <template v-if="isSingleWithinRange(event)">
          （期間内の1日）
        </template>
        {{ event.title }}
      </title>

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(eventDisplayStart(event))"
        :y="eventY(event) - EVENT_BAR_HEIGHT / 2"
        :width="xPos(eventDisplayEnd(event)) - xPos(eventDisplayStart(event))"
        :height="EVENT_BAR_HEIGHT"
        :fill="event.color"
        rx="6"
      />

      <circle
        v-if="isSingleWithinRange(event)"
        :cx="(xPos(eventDisplayStart(event)) + xPos(eventDisplayEnd(event))) / 2"
        :cy="eventY(event)"
        r="3"
        fill="#333"
      />

      <circle
        :cx="xPos(eventDisplayStart(event))"
        :cy="eventY(event)"
        r="5"
        :fill="event.color"
        stroke="#333"
      />

      <circle
        :cx="xPos(eventDisplayEnd(event))"
        :cy="eventY(event)"
        r="5"
        :fill="event.color"
        stroke="#333"
        stroke-width="1.5"
      />
    </g>
  </g>
</template>
