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

function handleKeydown(event, timelineEvent) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleSelect(timelineEvent);
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

function eventStyle(event) {
  return {
    "--event-fill": eventFill(event),
    "--event-stroke": eventStroke(event),
    "--event-marker-fill": markerFill(event),
    "--event-selected-stroke": selectedStroke(event),
    "--event-uncertain-marker": uncertainMarkerFill(event),
  };
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
      @keydown="handleKeydown($event, event)"
      class="event-group"
      :class="{
        'event-group--selected': isSelectedEvent(event),
        'event-group--single': isSingleWithinRange(event),
        'event-group--common': event.isCommon,
      }"
      :style="eventStyle(event)"
      tabindex="0"
      role="button"
      :aria-label="eventTitleText(event)"
    >
      <title>{{ eventTitleText(event) }}</title>

      <rect
        v-if="isSingleWithinRange(event)"
        class="event-uncertainty-band"
        :x="xPos(event.renderStartDay)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2 - 3"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay)"
        :height="eventBarHeight + 6"
        rx="7"
      />

      <rect
        class="event-bar"
        :class="{ 'event-bar--single': isSingleWithinRange(event) }"
        :x="xPos(event.renderStartDay)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay)"
        :height="eventBarHeight"
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
        rx="8"
      />

      <rect
        class="event-focus-ring"
        :x="xPos(event.renderStartDay) - 4"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2 - 4"
        :width="xPos(event.renderEndDay) - xPos(event.renderStartDay) + 8"
        :height="eventBarHeight + 8"
        fill="none"
        rx="9"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        class="event-uncertainty-marker"
        :points="uncertaintyMarker(event, 'start')"
      />

      <polygon
        v-if="isSingleWithinRange(event)"
        class="event-uncertainty-marker"
        :points="uncertaintyMarker(event, 'end')"
      />

      <circle
        class="event-end-marker"
        :cx="xPos(event.renderStartDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="4.8"
      />

      <circle
        class="event-end-marker"
        :cx="xPos(event.renderEndDay)"
        :cy="yPos(event.laneIndex, event.subLaneIndex)"
        r="4.8"
      />
    </g>
  </g>
</template>
