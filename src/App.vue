<script setup>
import { computed } from "vue";
import { characters } from "./data/events";

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

// 全イベントをフラット化
const allEvents = computed(() => {
  return characters.flatMap(char =>
    char.events.map(ev => ({
      ...ev,
      character: char.name,
      color: char.color,
      time: timeValue(ev.year, ev.month)
    }))
  );
});

const times = computed(() => allEvents.value.map(e => e.time));

const minTime = Math.min(...times.value);
const maxTime = Math.max(...times.value);

const width = 1000;
const height = 240;
const padding = 60;
const axisY = 140;

// time → x座標
function xPos(time) {
  return (
    padding +
    ((time - minTime) / (maxTime - minTime)) * (width - padding * 2)
  );
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

    <!-- 年目盛り -->
    <g v-for="y in years" :key="y.year">
      <!-- 縦線 -->
      <line
        :x1="xPos(y.time)"
        y1="40"
        :x2="xPos(y.time)"
        :y2="axisY"
        stroke="#ddd"
      />
      <!-- 年ラベル -->
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

    <!-- メイン軸 -->
    <line
      :x1="padding"
      :y1="axisY"
      :x2="width - padding"
      :y2="axisY"
      stroke="#999"
    />

    <!-- イベント -->
    <g v-for="event in allEvents" :key="event.title">
      <circle
        :cx="xPos(event.time)"
        :cy="axisY"
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
