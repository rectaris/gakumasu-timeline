<script setup>
import { computed } from "vue";

const YEAR_LABEL_PADDING = 28;
const MONTH_LABEL_PADDING = 16;
const DAY_LABEL_PADDING = 10;

const props = defineProps({
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  dayTicks: { type: Array, required: true },
  showMonthScale: { type: Boolean, required: true },
  showDayScale: { type: Boolean, required: true },
  xPos: { type: Function, required: true },
  timelineViewport: { type: Object, required: true },
  yearLabel: { type: Function, required: true }
});

function labelBounds(padding) {
  const minX = props.timelineViewport.x + padding;
  const maxX = props.timelineViewport.x + props.timelineViewport.width - padding;

  return {
    minX,
    maxX: Math.max(minX, maxX)
  };
}

function labelX(time, padding) {
  const rawX = props.xPos(time);
  const { minX, maxX } = labelBounds(padding);

  return Math.min(maxX, Math.max(minX, rawX));
}

function labelAnchor(time, padding) {
  const rawX = props.xPos(time);
  const { minX, maxX } = labelBounds(padding);

  if (rawX <= minX) return "start";
  if (rawX >= maxX) return "end";
  return "middle";
}

function buildLabelItems(ticks, padding, getTime, getLabel) {
  const items = ticks.map((tick) => {
    const time = getTime(tick);
    const anchor = labelAnchor(time, padding);

    return {
      key: time,
      text: getLabel(tick),
      x: labelX(time, padding),
      anchor,
    };
  });

  const firstRightIndex = items.findIndex((item) => item.anchor === "end");
  let lastLeftIndex = -1;

  items.forEach((item, index) => {
    if (item.anchor === "start") {
      lastLeftIndex = index;
    }
  });

  return items.filter((item, index) => {
    if (item.anchor === "middle") return true;
    if (item.anchor === "start") return index === lastLeftIndex;
    if (item.anchor === "end") return index === firstRightIndex;
    return false;
  });
}

const yearLabelItems = computed(() =>
  buildLabelItems(props.years, YEAR_LABEL_PADDING, (tick) => tick.time, (tick) =>
    props.yearLabel(tick.year),
  ),
);

const monthLabelItems = computed(() =>
  buildLabelItems(
    props.monthTicks,
    MONTH_LABEL_PADDING,
    (tick) => tick.time,
    (tick) => tick.label,
  ),
);

const dayLabelItems = computed(() =>
  buildLabelItems(
    props.dayTicks,
    DAY_LABEL_PADDING,
    (tick) => tick.time,
    (tick) => tick.day,
  ),
);
</script>

<template>
  <g>
    <text
      v-for="item in yearLabelItems"
      :key="`year-label-${item.key}`"
      :x="item.x"
      :y="timelineViewport.y - 26"
      :text-anchor="item.anchor"
      font-size="12"
      fill="var(--timeline-year-label, var(--text-secondary))"
    >
      {{ item.text }}
    </text>
    <g v-if="showMonthScale">
      <text
        v-for="item in monthLabelItems"
        :key="`month-label-${item.key}`"
        :x="item.x"
        :y="timelineViewport.y - 12"
        :text-anchor="item.anchor"
        font-size="10"
        fill="var(--timeline-month-label, var(--text-muted))"
      >
        {{ item.text }}
      </text>
      <text
        v-if="showDayScale"
        v-for="item in dayLabelItems"
        :key="`day-label-${item.key}`"
        :x="item.x"
        :y="timelineViewport.y - 2"
        :text-anchor="item.anchor"
        font-size="9"
        fill="var(--timeline-day-label, var(--text-faint))"
      >
        {{ item.text }}
      </text>
    </g>
  </g>
</template>
