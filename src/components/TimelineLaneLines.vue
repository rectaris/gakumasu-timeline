<script setup>
defineProps({
  characters: { type: Array, required: true },
  laneCenterY: { type: Function, required: true },
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <g v-for="(char, index) in characters" :key="char.id">
    <line
      :x1="timelineViewport.x"
      :y1="laneCenterY(index)"
      :x2="timelineViewport.x + timelineViewport.width"
      :y2="laneCenterY(index)"
      stroke="#ccc"
    />
  </g>
</template>
