<script setup>
const UNCERTAINTY_MARKER_OFFSET = 8;
const UNCERTAINTY_MARKER_HALF_HEIGHT = 4;

const props = defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  yPos: { type: Function, required: true },
  eventBarHeight: { type: Number, required: true },
  isSingleWithinRange: { type: Function, required: true },
  selectedEvent: { type: Object, default: null }
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

function eventFill(event) {
  return event.colorRoles?.eventFill ?? event.color;
}

function eventStroke(event) {
  return event.colorRoles?.eventStroke ?? "var(--timeline-event-stroke, var(--text-primary))";
}

function markerFill(event) {
  return event.colorRoles?.markerFill ?? eventFill(event);
}

function selectedStroke(event) {
  return event.colorRoles?.selectedStroke ?? "var(--timeline-selected-event-stroke, var(--text-primary))";
}

function uncertainMarkerFill(event) {
  return event.colorRoles?.uncertainMarker ?? "var(--timeline-uncertain-marker, var(--text-primary))";
}

function isSelectedEvent(event) {
  const selected = props.selectedEvent;
  if (!selected) return false;
  if (selected.instanceId && event.instanceId) {
    return selected.instanceId === event.instanceId;
  }
  return selected.canonicalId === event.canonicalId;
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
    <g
      @click="handleSelect(event)"
      class="event-group"
      :class="{ 'event-group--selected': isSelectedEvent(event) }"
    >
      <title>{{ eventTitleText(event) }}</title>

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(event.renderStartDay)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay)"
        :height="eventBarHeight"
        :fill="eventFill(event)"
        :stroke="eventStroke(event)"
        stroke-width="1"
        rx="6"
      />

      <rect
        v-if="isSelectedEvent(event)"
        class="event-selection-ring"
        :x="xPos(event.renderStartDay) - 2"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2 - 2"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay) + 4"
        :height="eventBarHeight + 4"
        fill="none"
        :stroke="selectedStroke(event)"
        stroke-width="3"
        rx="8"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'start')"
        :fill="uncertainMarkerFill(event)"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        :points="uncertaintyMarker(event, 'end')"
        :fill="uncertainMarkerFill(event)"
      />

      <circle
        :cx="xPos(event.renderStartDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="markerFill(event)"
        :stroke="isSelectedEvent(event) ? selectedStroke(event) : eventStroke(event)"
        :stroke-width="isSelectedEvent(event) ? 2.5 : 1.5"
      />

      <circle
        :cx="xPos(event.renderEndDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="5"
        :fill="markerFill(event)"
        :stroke="isSelectedEvent(event) ? selectedStroke(event) : eventStroke(event)"
        :stroke-width="isSelectedEvent(event) ? 2.5 : 1.5"
      />
    </g>
  </g>
</template>
