<script setup>
defineProps({
  years: { type: Array, required: true },
  monthTicks: { type: Array, required: true },
  zoomMode: { type: String, required: true },
  xPos: { type: Function, required: true },
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <g>
    <g v-for="y in years" :key="y.year">
      <line
        :x1="xPos(y.time)"
        :y1="timelineViewport.y"
        :x2="xPos(y.time)"
        :y2="timelineViewport.y + timelineViewport.height"
        stroke="#eee"
      />
    </g>

    <g v-if="zoomMode === 'month'">
      <g v-for="tick in monthTicks" :key="`month-${tick.time}`">
        <line
          :x1="xPos(tick.time)"
          :y1="timelineViewport.y"
          :x2="xPos(tick.time)"
          :y2="timelineViewport.y + timelineViewport.height"
          stroke="#e0e0e0"
        />
      </g>
    </g>
  </g>
</template>
