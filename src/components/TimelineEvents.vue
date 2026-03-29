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

function eventTitleText(event) {
  return [event.title, event.detail]
    .map(value => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
}

function uncertaintyMarker(event, edge) {
  const edgeX =
    edge === "start"
      ? props.xPos(event.renderStartDay)
      : props.xPos(event.renderEndDay);
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
      <title>{{ eventTitleText(event) }}</title>

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(event.renderStartDay)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay)"
        :height="eventBarHeight"
        :fill="event.color"
        rx="6"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'start')"
        fill="var(--timeline-event-stroke, var(--text-primary))"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'end')"
        fill="var(--timeline-event-stroke, var(--text-primary))"
      />

      <circle
        :cx="xPos(event.renderStartDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="var(--timeline-event-stroke, var(--text-primary))"
      />

      <circle
        :cx="xPos(event.renderEndDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="event.color"
        stroke="var(--timeline-event-stroke, var(--text-primary))"
        stroke-width="1.5"
      />
    </g>
  </g>
</template>
