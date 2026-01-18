<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { characters } from "./data/events";
import { watch } from "vue";

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

const zoomMode = ref("all"); 
// "all" | "year"

const zoomCenterYear = ref(
  Math.floor(
    (yearBounds.value.minYear + yearBounds.value.maxYear) / 2
  )
);

const zoomRangeYears = 1; // ±1年

watch(zoomMode, mode => {
  if (mode === "year") {
    // 現在の選択イベントがあればそこを中心に
    if (selectedEvent.value) {
      zoomCenterYear.value = selectedEvent.value.year;
    }
  }
});

const selectedEvent = ref(null);

function selectEvent(event) {
  selectedEvent.value = event;
  updateUrl(event.id);
}

function closePanel() {
  selectedEvent.value = null;
  updateUrl(null);
}

function updateUrl(eventId) {
  const params = new URLSearchParams(window.location.search);

  if (eventId) {
    params.set("event", eventId);
  } else {
    params.delete("event");
  }

  const query = params.toString();
  const newUrl =
    window.location.pathname + (query ? "?" + query : "");

  history.replaceState(null, "", newUrl);
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

const viewRange = computed(() => {
  if (zoomMode.value === "year") {
    const center = zoomCenterYear.value * 12;
    return {
      min: center - zoomRangeYears * 12,
      max: center + zoomRangeYears * 12
    };
  }

  return {
    min: Math.min(...times.value),
    max: Math.max(...times.value)
  };
});

const yearBounds = computed(() => {
  const minYear = Math.floor(
    Math.min(...times.value) / 12
  );
  const maxYear = Math.floor(
    Math.max(...times.value) / 12
  );
  return { minYear, maxYear };
});

// SVGサイズ
const width = 1100;
const height =
  topOffset + characters.length * laneHeight + 40;

// time → x
function xPos(time) {
  const { min, max } = viewRange.value;

  return (
    leftLabelWidth +
    ((time - min) / (max - min)) *
      (width - leftLabelWidth - 40)
  );
}

// lane → y
function yPos(laneIndex) {
  return topOffset + laneIndex * laneHeight;
}

// 年スケール
const years = computed(() => {
  const { min, max } = viewRange.value;
  const startYear = Math.floor(min / 12);
  const endYear = Math.floor(max / 12);

  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({
      year: y,
      time: y * 12
    });
  }
  return result;
});

const visibleEvents = computed(() => {
  const { min, max } = viewRange.value;
  return allEvents.value.filter(
    e => e.time >= min && e.time <= max
  );
});

function handleKey(e) {
  if (e.key === "Escape") closePanel();
}

onMounted(() => {
  // URLから event ID を取得
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");

  if (eventId) {
    const found = allEvents.value.find(e => e.id === eventId);
    if (found) {
      selectedEvent.value = found;
    }
  }

  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKey);
});

</script>

<template>
  <h1>キャラクタータイムライン</h1>

  <div class="zoom-controls">
    <button @click="zoomMode = 'all'">全期間</button>
    <button @click="zoomMode = 'year'">2年目を拡大</button>
  </div>

  <div
    class="year-slider"
    v-if="zoomMode === 'year'"
  >
    <label>
      中心年：
      {{ zoomCenterYear }} 年目
    </label>

    <input
      type="range"
      :min="yearBounds.minYear"
      :max="yearBounds.maxYear"
      v-model.number="zoomCenterYear"
      step="1"
    />
  </div>

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
    <g v-for="event in visibleEvents" :key="event.id">
        <circle
          :cx="xPos(event.time)"
          :cy="yPos(event.laneIndex)"
          r="6"
          :fill="event.color"
          class="event-dot"
          @click="selectEvent(event)"
        >
        <title>
          {{ event.character }}
          {{ event.year }}年{{ event.month }}月
          {{ event.title }}
        </title>
      </circle>
    </g>

  </svg>

  <!-- サイド固定の詳細パネル -->
  <aside
    class="side-panel"
    :class="{ open: selectedEvent }"
  >
    <div v-if="selectedEvent" class="panel-content">
      <button class="close-btn" @click="closePanel">×</button>

      <h2>{{ selectedEvent.title }}</h2>

      <p class="meta">
        {{ selectedEvent.character }}
        ｜ {{ selectedEvent.year }}年{{ selectedEvent.month }}月
      </p>

      <p class="detail">
        {{ selectedEvent.detail }}
      </p>
    </div>

    <div v-else class="panel-placeholder">
      イベントを選択してください
    </div>
  </aside>

</template>

<style>
body {
  font-family: system-ui, sans-serif;
}

.event-dot {
  cursor: pointer;
}

.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #ddd;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.side-panel.open {
  transform: translateX(0);
}

.panel-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.panel-placeholder {
  padding: 20px;
  color: #888;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.meta {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.detail {
  line-height: 1.6;
}

.zoom-controls {
  margin-bottom: 10px;
}

.zoom-controls button {
  margin-right: 6px;
}

.year-slider {
  margin-bottom: 12px;
}

.year-slider label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}

.year-slider input[type="range"] {
  width: 300px;
}

</style>
