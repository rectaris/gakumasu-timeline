<script setup>
const props = defineProps({
  characters: { type: Array, required: true },
  laneCenterY: { type: Function, required: true },
  leftLabelWidth: { type: Number, required: true },
  invertHexColor: { type: Function, required: true }
});

const FONT_SIZE = 17;
const FONT_WEIGHT = 700;
const H_PADDING = 8;
const GAP_TO_TIMELINE = 8;
const MIN_X = 6;

function estimateTextWidth(text) {
  if (!text) return 0;
  return text.length * (FONT_SIZE * 0.6);
}

function textX() {
  return props.leftLabelWidth - GAP_TO_TIMELINE;
}

function rectWidth(text) {
  return estimateTextWidth(text) + H_PADDING * 2;
}

function rectX(text) {
  const x = textX() - rectWidth(text);
  return Math.max(MIN_X, x);
}

function rectHeight() {
  return FONT_SIZE + 8;
}
</script>

<template>
  <g v-for="(char, index) in characters" :key="char.id">
    <rect
      :x="rectX(char.name)"
      :y="laneCenterY(index) - rectHeight() / 2"
      :width="rectWidth(char.name)"
      :height="rectHeight()"
      :fill="char.color"
      rx="6"
    />
    <text
      :x="textX()"
      :y="laneCenterY(index)"
      :font-size="FONT_SIZE"
      :font-weight="FONT_WEIGHT"
      dominant-baseline="middle"
      text-anchor="end"
      :fill="char.textColor ?? invertHexColor(char.color)"
    >
      {{ char.name }}
    </text>
  </g>
</template>
