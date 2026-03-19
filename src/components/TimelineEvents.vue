<script setup>
const UNCERTAINTY_MARKER_OFFSET = 8;
const UNCERTAINTY_MARKER_HALF_HEIGHT = 4;

const props = defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  yPos: { type: Function, required: true },
  eventBarHeight: { type: Number, required: true },
  isSingleWithinRange: { type: Function, required: true }
});

const emit = defineEmits(["select"]);

function handleSelect(event) {
  emit("select", event);
}

function uncertaintyMarker(event, edge) {
  const edgeX =
    edge === "start"
      ? props.xPos(event.displayStartDay)
      : props.xPos(event.displayEndDay);
  const centerY = props.yPos(event.laneIndex, event.subLaneIndex);
  const direction = edge === "start" ? -1 : 1;
  const tipX = edgeX + UNCERTAINTY_MARKER_OFFSET * direction;
  const baseX = edgeX + 2 * direction;

  return `${tipX},${centerY} ${baseX},${centerY - UNCERTAINTY_MARKER_HALF_HEIGHT} ${baseX},${centerY + UNCERTAINTY_MARKER_HALF_HEIGHT}`;
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
        :x="xPos(event.displayStartDay)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2"
        :width="xPos(event.displayEndDay) - xPos(event.displayStartDay)"
        :height="eventBarHeight"
        :fill="event.color"
        rx="6"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'start')"
        fill="#333"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'end')"
        fill="#333"
      />

      <circle
        :cx="xPos(event.displayStartDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="#333"
      />

      <circle
        :cx="xPos(event.displayEndDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="#333"
        stroke-width="1.5"
      />
    </g>
  </g>
</template>
