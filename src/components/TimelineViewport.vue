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
    fill="#fafafa"
    stroke="#ddd"
  />
</template>
