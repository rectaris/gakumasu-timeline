<script setup>
import { estimateTextWidth } from "../utils/labels";

const props = defineProps({
  characters: { type: Array, required: true },
  laneCenterY: { type: Function, required: true },
  leftLabelWidth: { type: Number, required: true },
  invertHexColor: { type: Function, required: true }
});

const FONT_SIZE = 14;
const FONT_WEIGHT = 700;
const H_PADDING = 12;
const GAP_TO_TIMELINE = 8;
const MIN_X = 6;
const ACCENT_WIDTH = 4;
const LABEL_HEIGHT = 28;

function rectRight() {
  return props.leftLabelWidth - GAP_TO_TIMELINE;
}

function rectWidth(text) {
  return Math.min(
    rectRight() - MIN_X,
    Math.max(72, props.leftLabelWidth - GAP_TO_TIMELINE - MIN_X),
  );
}

function rectX(text) {
  const x = rectRight() - rectWidth(text);
  return Math.max(MIN_X, x);
}

function rectHeight() {
  return LABEL_HEIGHT;
}

function textX(text) {
  return rectX(text) + ACCENT_WIDTH + H_PADDING;
}

function maxTextWidth(text) {
  return rectWidth(text) - ACCENT_WIDTH - H_PADDING * 2;
}

function displayName(text) {
  if (estimateTextWidth(text, { fontSize: FONT_SIZE }) <= maxTextWidth(text)) {
    return text;
  }

  const ellipsis = "…";
  let result = "";
  for (const char of Array.from(text)) {
    const candidate = `${result}${char}`;
    if (
      estimateTextWidth(`${candidate}${ellipsis}`, { fontSize: FONT_SIZE }) >
      maxTextWidth(text)
    ) {
      return `${result}${ellipsis}`;
    }
    result = candidate;
  }

  return text;
}

</script>

<template>
  <g v-for="(char, index) in characters" :key="char.id">
    <rect
      class="lane-label lane-label__surface"
      :x="rectX(char.name)"
      :y="laneCenterY(index) - rectHeight() / 2"
      :width="rectWidth(char.name)"
      :height="rectHeight()"
      rx="4"
    />
    <rect
      class="lane-label lane-label__accent"
      :x="rectX(char.name)"
      :y="laneCenterY(index) - rectHeight() / 2 + 4"
      :width="ACCENT_WIDTH"
      :height="rectHeight() - 8"
      :fill="char.colorRoles?.accentStrong ?? char.colorRoles?.accent ?? char.color"
      rx="2"
    />
    <text
      :x="textX(char.name)"
      :y="laneCenterY(index)"
      :font-size="FONT_SIZE"
      :font-weight="FONT_WEIGHT"
      dominant-baseline="middle"
      text-anchor="start"
      fill="var(--timeline-lane-label-text, var(--text-primary))"
    >
      {{ displayName(char.name) }}
    </text>
  </g>
</template>
