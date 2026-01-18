<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { characters } from "./data";
import { watch } from "vue";

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

const zoomMode = ref("all"); 
// "all" | "year"

const zoomCenterYear = ref(0);
const zoomRangeYears = 1;

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
    char.events.map(ev => {
      const startTime = timeValue(
        ev.start.year,
        ev.start.month
      );
      const endTime = timeValue(
        ev.end.year,
        ev.end.month
      );

      return {
        ...ev,
        character: char.name,
        color: char.color,
        laneIndex: index,
        startTime,
        endTime
      };
    })
  );
});

const times = computed(() =>
  allEvents.value.flatMap(e => [e.startTime, e.endTime])
);

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
  const minYear = Math.floor(Math.min(...times.value) / 12);
  const maxYear = Math.floor(Math.max(...times.value) / 12);

  if (maxYear - minYear < 2) {
    return {
      minYear: minYear - 1,
      maxYear: maxYear + 1
    };
  }

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

function yearLabel(year) {
  if (year === 1) return "1年目";

  if (year > 1) {
    return `${year}年目`;
  }

  // year < 1
  const diff = 1 - year;
  return `${diff}年前`;
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
  return allEvents.value.filter(e =>
    e.endTime >= min && e.startTime <= max
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

  zoomCenterYear.value = 1;

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
    <button @click="zoomMode = 'year'">年ズーム</button>
  </div>

  <div
    class="year-slider"
    v-if="zoomMode === 'year'"
  >
    <label>
      中心年：
      {{ yearLabel(zoomCenterYear) }}
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
        {{ yearLabel(y.year) }}
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
      <g @click="selectEvent(event)" class="event-group">

        <title>
          {{ event.character }}
          {{ yearLabel(event.start.year) }} {{ event.start.month }}月
          <template v-if="
            event.start.year !== event.end.year ||
            event.start.month !== event.end.month
          ">
            〜 {{ yearLabel(event.end.year) }} {{ event.end.month }}月
          </template>
          {{ event.title }}
        </title>

        <!-- 期間バー -->
        <rect
          :x="xPos(event.startTime)"
          :y="yPos(event.laneIndex) - 6"
          :width="xPos(event.endTime) - xPos(event.startTime)"
          height="12"
          :fill="event.color"
          rx="6"
        />

        <!-- 開始点マーカー -->
        <circle
          :cx="xPos(event.startTime)"
          :cy="yPos(event.laneIndex)"
          r="5"
          fill="#fff"
          stroke="#333"
        />
      </g>
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
        {{ selectedEvent.character }}<br />
        {{ yearLabel(selectedEvent.start.year) }}
        {{ selectedEvent.start.month }}月
        <template v-if="
          selectedEvent.start.year !== selectedEvent.end.year ||
          selectedEvent.start.month !== selectedEvent.end.month
        ">
          〜
          {{ yearLabel(selectedEvent.end.year) }}
          {{ selectedEvent.end.month }}月
        </template>
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

.event-group {
  cursor: pointer;
}

.event-group:hover rect {
  opacity: 0.8;
}

</style>
