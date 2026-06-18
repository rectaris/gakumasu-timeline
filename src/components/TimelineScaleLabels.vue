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

function isVisibleLabel(time, padding) {
  const x = props.xPos(time);
  const { minX, maxX } = labelBounds(padding);

  return x >= minX && x <= maxX;
}

function buildLabelItems(ticks, padding, getTime, getLabel) {
  return ticks.flatMap((tick) => {
    const time = getTime(tick);
    if (!isVisibleLabel(time, padding)) {
      return [];
    }

    return {
      key: time,
      text: getLabel(tick),
      x: props.xPos(time),
    };
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
      class="timeline-scale-label timeline-scale-label--year"
      :x="item.x"
      :y="timelineViewport.y - 26"
      text-anchor="middle"
    >
      {{ item.text }}
    </text>
    <g v-if="showMonthScale">
      <text
        v-for="item in monthLabelItems"
        :key="`month-label-${item.key}`"
        class="timeline-scale-label timeline-scale-label--month"
        :x="item.x"
        :y="timelineViewport.y - 12"
        text-anchor="middle"
      >
        {{ item.text }}
      </text>
      <text
        v-if="showDayScale"
        v-for="item in dayLabelItems"
        :key="`day-label-${item.key}`"
        class="timeline-scale-label timeline-scale-label--day"
        :x="item.x"
        :y="timelineViewport.y - 2"
        text-anchor="middle"
      >
        {{ item.text }}
      </text>
    </g>
  </g>
</template>
