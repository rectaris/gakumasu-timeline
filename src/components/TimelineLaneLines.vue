<script setup>
defineProps({
  laneLayouts: { type: Array, required: true },
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <g v-for="lane in laneLayouts" :key="lane.laneIndex">
    <line
      class="timeline-lane-line"
      :x1="timelineViewport.x"
      :y1="lane.laneTop"
      :x2="timelineViewport.x + timelineViewport.width"
      :y2="lane.laneTop"
    />
  </g>
  <line
    v-if="laneLayouts.length"
    class="timeline-lane-line timeline-lane-line--last"
    :x1="timelineViewport.x"
    :y1="laneLayouts[laneLayouts.length - 1].laneTop + laneLayouts[laneLayouts.length - 1].laneHeight"
    :x2="timelineViewport.x + timelineViewport.width"
    :y2="laneLayouts[laneLayouts.length - 1].laneTop + laneLayouts[laneLayouts.length - 1].laneHeight"
  />
</template>
