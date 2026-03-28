<script setup>
defineProps({
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <rect
    :x="timelineViewport.x"
    :y="timelineViewport.y"
    :width="timelineViewport.width"
    :height="timelineViewport.height"
    fill="var(--timeline-viewport-fill, var(--surface-soft))"
    stroke="var(--timeline-viewport-stroke, var(--border))"
  />
</template>
