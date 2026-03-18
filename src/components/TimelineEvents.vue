<script setup>
const UNCERTAINTY_MARKER_OFFSET = 8;
const UNCERTAINTY_MARKER_HALF_HEIGHT = 4;

const props = defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  yPos: { type: Function, required: true },
  eventBarHeight: { type: Number, required: true },
  isSingleWithinRange: { type: Function, required: true },
  yearLabel: { type: Function, required: false }
});

const emit = defineEmits(["select"]);

function handleSelect(event) {
  emit("select", event);
}

function startUncertaintyMarker(event, xPos) {
  const startX = xPos(event.displayStart);
  const centerY = props.yPos(event.laneIndex, event.subLaneIndex);
  return `${startX - UNCERTAINTY_MARKER_OFFSET},${centerY} ${startX - 2},${centerY - UNCERTAINTY_MARKER_HALF_HEIGHT} ${startX - 2},${centerY + UNCERTAINTY_MARKER_HALF_HEIGHT}`;
}

function endUncertaintyMarker(event, xPos) {
  const endX = xPos(event.displayEnd);
  const centerY = props.yPos(event.laneIndex, event.subLaneIndex);
  return `${endX + UNCERTAINTY_MARKER_OFFSET},${centerY} ${endX + 2},${centerY - UNCERTAINTY_MARKER_HALF_HEIGHT} ${endX + 2},${centerY + UNCERTAINTY_MARKER_HALF_HEIGHT}`;
}
</script>

<template>
  <g v-for="event in visibleEvents" :key="event.instanceId ?? event.id">
    <g @click="handleSelect(event)" class="event-group">
      <title>
        title:  {{ event.title }}
        detail: {{ event.detail }}
      </title>

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(event.displayStart)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2"
        :width="xPos(event.displayEnd) - xPos(event.displayStart)"
        :height="eventBarHeight"
        :fill="event.color"
        rx="6"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="startUncertaintyMarker(event, xPos)"
        fill="#333"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="endUncertaintyMarker(event, xPos)"
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
