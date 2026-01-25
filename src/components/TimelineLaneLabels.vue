<script setup>
defineProps({
  characters: { type: Array, required: true },
  laneCenterY: { type: Function, required: true },
  leftLabelWidth: { type: Number, required: true },
  invertHexColor: { type: Function, required: true }
});
</script>

<template>
  <g v-for="(char, index) in characters" :key="char.id">
    <rect
      x="6"
      :y="laneCenterY(index) - 12"
      :width="leftLabelWidth - 12"
      height="24"
      :fill="char.color"
      rx="6"
    />
    <text
      x="10"
      :y="laneCenterY(index)"
      font-size="13"
      dominant-baseline="middle"
      :fill="invertHexColor(char.color)"
    >
      {{ char.name }}
    </text>
  </g>
</template>
