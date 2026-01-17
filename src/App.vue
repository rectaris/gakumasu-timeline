<script setup>
import { computed } from "vue";
import { characters } from "./data/events";

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

// レーン設定
const laneHeight = 60;
const topOffset = 80;
const leftLabelWidth = 100;

// 全イベント（キャラ情報付き）
const allEvents = computed(() => {
  return characters.flatMap((char, index) =>
    char.events.map(ev => ({
      ...ev,
      character: char.name,
      color: char.color,
      laneIndex: index,
      time: timeValue(ev.year, ev.month)
    }))
  );
});

const times = computed(() => allEvents.value.map(e => e.time));

const minTime = Math.min(...times.value);
const maxTime = Math.max(...times.value);

// SVGサイズ
const width = 1100;
const height =
  topOffset + characters.length * laneHeight + 40;

// time → x
function xPos(time) {
  return (
    leftLabelWidth +
    ((time - minTime) / (maxTime - minTime)) *
      (width - leftLabelWidth - 40)
  );
}

// lane → y
function yPos(laneIndex) {
  return topOffset + laneIndex * laneHeight;
}

// 年スケール
const startYear = Math.floor(minTime / 12);
const endYear = Math.floor(maxTime / 12);

const years = computed(() => {
  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({
      year: y,
      time: y * 12
    });
  }
  return result;
});
</script>

<template>
  <h1>キャラクタータイムライン</h1>

  <svg :width="width" :height="height">

    <!-- 年目盛り（全レーン共通） -->
    <g v-for="y in years" :key="y.year">
      <line
        :x1="xPos(y.time)"
        y1="40"
        :x2="xPos(y.time)"
        :y2="height - 20"
        stroke="#eee"
      />
      <text
        :x="xPos(y.time)"
        y="30"
        text-anchor="middle"
        font-size="12"
        fill="#555"
      >
        {{ y.year }}年目
      </text>
    </g>

    <!-- キャラレーン -->
    <g v-for="(char, index) in characters" :key="char.id">

      <!-- キャラ名 -->
      <text
        x="10"
        :y="yPos(index) + 5"
        font-size="13"
        dominant-baseline="middle"
        fill="#333"
      >
        {{ char.name }}
      </text>

      <!-- レーン線 -->
      <line
        :x1="leftLabelWidth"
        :y1="yPos(index)"
        :x2="width - 20"
        :y2="yPos(index)"
        stroke="#ccc"
      />

    </g>

    <!-- イベント -->
    <g v-for="event in allEvents" :key="event.title">
      <circle
        :cx="xPos(event.time)"
        :cy="yPos(event.laneIndex)"
        r="6"
        :fill="event.color"
      >
        <title>
          {{ event.character }}
          {{ event.year }}年{{ event.month }}月
          {{ event.title }}
        </title>
      </circle>
    </g>

  </svg>
</template>

<style>
body {
  font-family: system-ui, sans-serif;
}
</style>
