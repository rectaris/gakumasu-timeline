<script setup>
import { ref } from "vue";
import {
  EVENT_CONTEXT_LABEL_MAX_WIDTH,
  eventContextLabel,
  eventInlineLabel,
} from "../utils/labels";

const UNCERTAINTY_MARKER_OFFSET = 8;
const UNCERTAINTY_MARKER_HALF_HEIGHT = 4;
const COMMON_INDICATOR_SIZE = 4;
const CONTEXT_LABEL_PADDING_X = 8;
const CONTEXT_LABEL_HEIGHT = 20;
const CONTEXT_LABEL_GAP = 7;
const CONTEXT_LABEL_VIEWPORT_PADDING = 4;

const props = defineProps({
  visibleEvents: { type: Array, required: true },
  xPos: { type: Function, required: true },
  yPos: { type: Function, required: true },
  eventBarHeight: { type: Number, required: true },
  isSingleWithinRange: { type: Function, required: true },
  selectedEvent: { type: Object, default: null },
  timelineViewport: { type: Object, required: true }
});

const emit = defineEmits(["select", "select-summary"]);
const hoveredEventKey = ref(null);
const focusedEventKey = ref(null);

function handleSelect(event) {
  emit("select", event);
}

function handleSummarySelect(summary) {
  emit("select-summary", summary);
}

function handleKeydown(event, timelineEvent) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleSelect(timelineEvent);
}

function handleSummaryKeydown(event, summary) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  handleSummarySelect(summary);
}

function eventTitleText(event) {
  if (event.isSummary) return summaryTitleText(event);

  return [event.title, event.detail]
    .map(value => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
}

function eventKey(event) {
  if (event.isSummary) return event.summaryId;
  return event.instanceId ?? event.id ?? event.canonicalId;
}

function setHoveredEvent(event) {
  hoveredEventKey.value = eventKey(event);
}

function clearHoveredEvent(event) {
  if (hoveredEventKey.value === eventKey(event)) {
    hoveredEventKey.value = null;
  }
}

function setFocusedEvent(event) {
  focusedEventKey.value = eventKey(event);
}

function clearFocusedEvent(event) {
  if (focusedEventKey.value === eventKey(event)) {
    focusedEventKey.value = null;
  }
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

function isInteractiveEvent(event) {
  const key = eventKey(event);
  return (
    isSelectedEvent(event) ||
    hoveredEventKey.value === key ||
    focusedEventKey.value === key
  );
}

function eventVisibleWidth(event) {
  return Math.max(
    0,
    props.xPos(event.renderEndDay) - props.xPos(event.renderStartDay),
  );
}

function summaryVisibleWidth(summary) {
  return Math.max(28, eventVisibleWidth(summary));
}

function summaryX(summary) {
  return eventCenterX(summary) - summaryVisibleWidth(summary) / 2;
}

function summaryLabel(summary) {
  const countLabel =
    summary.canonicalCount && summary.canonicalCount !== summary.eventCount
      ? `${summary.canonicalCount}/${summary.eventCount}件`
      : `${summary.eventCount}件`;
  return summary.summaryKind === "uncertain"
    ? `期間内 ${countLabel}`
    : countLabel;
}

function summaryTitleText(summary) {
  const rangeKind =
    summary.summaryKind === "uncertain"
      ? "期間内の1日イベント"
      : "密集イベント";
  return `${rangeKind}: ${summaryLabel(summary)}`;
}

function eventCenterX(event) {
  return props.xPos(event.renderStartDay) + eventVisibleWidth(event) / 2;
}

function eventCenterY(event) {
  return props.yPos(event.laneIndex, event.subLaneIndex);
}

function inlineLabel(event) {
  return eventInlineLabel({
    title: event.title,
    visibleWidth: eventVisibleWidth(event),
    eventBarHeight: props.eventBarHeight,
    isCommon: event.isCommon,
    isSingleWithinRange: props.isSingleWithinRange(event),
    isSelected: isSelectedEvent(event),
    isInteractive: isInteractiveEvent(event),
  });
}

function contextLabel(event) {
  if (!isInteractiveEvent(event)) return null;
  if (inlineLabel(event)) return null;

  const label = eventContextLabel(event.title, EVENT_CONTEXT_LABEL_MAX_WIDTH);
  if (!label) return null;

  const rectWidth = label.width + CONTEXT_LABEL_PADDING_X * 2;
  const minCenter =
    props.timelineViewport.x + CONTEXT_LABEL_VIEWPORT_PADDING + rectWidth / 2;
  const maxCenter =
    props.timelineViewport.x +
    props.timelineViewport.width -
    CONTEXT_LABEL_VIEWPORT_PADDING -
    rectWidth / 2;
  if (minCenter > maxCenter) return null;

  const centerX = Math.min(maxCenter, Math.max(minCenter, eventCenterX(event)));
  const barTop = eventCenterY(event) - props.eventBarHeight / 2;
  const barBottom = eventCenterY(event) + props.eventBarHeight / 2;
  const aboveY = barTop - CONTEXT_LABEL_GAP - CONTEXT_LABEL_HEIGHT;
  const belowY = barBottom + CONTEXT_LABEL_GAP;
  const rectY =
    aboveY >= props.timelineViewport.y + CONTEXT_LABEL_VIEWPORT_PADDING
      ? aboveY
      : belowY;

  return {
    text: label.text,
    rectX: centerX - rectWidth / 2,
    rectY,
    rectWidth,
    textX: centerX,
    textY: rectY + CONTEXT_LABEL_HEIGHT / 2,
  };
}

function commonIndicatorPoints(event) {
  const x = eventCenterX(event);
  const y = eventCenterY(event);
  const size = COMMON_INDICATOR_SIZE;

  return `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`;
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
  <g v-for="event in visibleEvents" :key="event.summaryId ?? event.instanceId ?? event.id">
    <g
      v-if="event.isSummary"
      class="event-summary-group"
      :class="{ 'event-summary-group--uncertain': event.summaryKind === 'uncertain' }"
      tabindex="0"
      role="button"
      :data-event-key="event.summaryId"
      :aria-label="summaryTitleText(event)"
      @click="handleSummarySelect(event)"
      @keydown="handleSummaryKeydown($event, event)"
    >
      <title>{{ summaryTitleText(event) }}</title>
      <rect
        class="event-summary-bar"
        :x="summaryX(event)"
        :y="yPos(event.laneIndex, event.subLaneIndex) - eventBarHeight / 2 - 2"
        :width="summaryVisibleWidth(event)"
        :height="eventBarHeight + 4"
        rx="6"
      />
      <text
        class="event-summary-label"
        :x="eventCenterX(event)"
        :y="eventCenterY(event)"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ summaryLabel(event) }}
      </text>
    </g>
    <g
      v-else
      @click="handleSelect(event)"
      @keydown="handleKeydown($event, event)"
      class="event-group"
      :class="{
        'event-group--selected': isSelectedEvent(event),
        'event-group--single': isSingleWithinRange(event),
        'event-group--common': event.isCommon,
        'event-group--interactive': isInteractiveEvent(event),
      }"
      :style="eventStyle(event)"
      tabindex="0"
      role="button"
      :data-event-key="eventKey(event)"
      :data-canonical-id="event.canonicalId ?? event.id"
      :aria-label="eventTitleText(event)"
      @mouseenter="setHoveredEvent(event)"
      @mouseleave="clearHoveredEvent(event)"
      @focus="setFocusedEvent(event)"
      @blur="clearFocusedEvent(event)"
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

      <polygon
        v-if="event.isCommon"
        class="event-common-indicator"
        :points="commonIndicatorPoints(event)"
      />

      <text
        v-if="inlineLabel(event)"
        class="event-inline-label"
        :x="eventCenterX(event)"
        :y="eventCenterY(event)"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ inlineLabel(event).text }}
      </text>

      <g v-if="contextLabel(event)" class="event-context-label">
        <rect
          class="event-context-label__surface"
          :x="contextLabel(event).rectX"
          :y="contextLabel(event).rectY"
          :width="contextLabel(event).rectWidth"
          :height="CONTEXT_LABEL_HEIGHT"
          rx="4"
        />
        <text
          class="event-context-label__text"
          :x="contextLabel(event).textX"
          :y="contextLabel(event).textY"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ contextLabel(event).text }}
        </text>
      </g>
    </g>
  </g>
</template>
