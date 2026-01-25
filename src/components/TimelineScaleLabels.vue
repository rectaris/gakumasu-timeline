<script setup>
defineProps({
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  dayTicks: { type: Array, required: true },
  zoomMode: { type: String, required: true },
  xPos: { type: Function, required: true },
  timelineViewport: { type: Object, required: true },
  yearLabel: { type: Function, required: true }
});
</script>

<template>
  <g>
    <text
      v-for="y in years"
      :key="`year-label-${y.year}`"
      :x="xPos(y.time)"
      :y="timelineViewport.y - 26"
      text-anchor="middle"
      font-size="12"
      fill="#555"
    >
      {{ yearLabel(y.year) }}
    </text>
    <g v-if="zoomMode === 'month'">
      <text
        v-for="tick in monthTicks"
        :key="`month-label-${tick.time}`"
        :x="xPos(tick.time)"
        :y="timelineViewport.y - 12"
        text-anchor="middle"
        font-size="10"
        fill="#777"
      >
        {{ tick.label }}
      </text>
      <text
        v-for="tick in dayTicks"
        :key="`day-label-${tick.time}-${tick.day}`"
        :x="xPos(tick.time)"
        :y="timelineViewport.y - 2"
        text-anchor="middle"
        font-size="9"
        fill="#bbb"
      >
        {{ tick.day }}
      </text>
    </g>
  </g>
</template>
