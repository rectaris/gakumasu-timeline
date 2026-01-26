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
  const asciiWidth = FONT_SIZE * 0.58;
  const spaceWidth = FONT_SIZE * 0.28;
  const halfKanaWidth = FONT_SIZE * 0.72;
  const wideWidth = FONT_SIZE * 0.98;
  return Array.from(text).reduce((total, char) => {
    if (char === " ") return total + spaceWidth;
    if (/^[\uFF61-\uFF9F]$/.test(char)) return total + halfKanaWidth;
    if (/^[\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF]$/.test(char)) {
      return total + wideWidth;
    }
    if (char.charCodeAt(0) <= 0x007f) return total + asciiWidth;
    return total + wideWidth;
  }, 0);
}

function rectRight() {
  return props.leftLabelWidth - GAP_TO_TIMELINE;
}

function rectWidth(text) {
  return estimateTextWidth(text) + H_PADDING * 2;
}

function rectX(text) {
  const x = rectRight() - rectWidth(text);
  return Math.max(MIN_X, x);
}

function rectHeight() {
  return FONT_SIZE + 8;
}

function textX(text) {
  return rectX(text) + rectWidth(text) / 2;
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
      :x="textX(char.name)"
      :y="laneCenterY(index)"
      :font-size="FONT_SIZE"
      :font-weight="FONT_WEIGHT"
      dominant-baseline="middle"
      text-anchor="middle"
      :fill="char.textColor ?? invertHexColor(char.color)"
    >
      {{ char.name }}
    </text>
  </g>
</template>
