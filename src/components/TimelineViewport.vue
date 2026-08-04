<script setup>
defineProps({
  timelineViewport: { type: Object, required: true }
});
</script>

<template>
  <rect
    class="timeline-viewport"
    :x="timelineViewport.x"
    :y="timelineViewport.y"
    :width="timelineViewport.width"
    :height="timelineViewport.height"
  />
</template>
