<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { characters } from "./data";
import { watch } from "vue";

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

const zoomMode = ref("all"); 
// "all" | "year" | "month"

const zoomCenterYear = ref(0);
const zoomRangeYears = 1;
const zoomCenterMonth = ref(0);
const zoomRangeMonths = 6;

const zoomLabels = {
  all: "全期間表示",
  year: "年表示",
  month: "月表示"
};

watch(zoomMode, mode => {
  if (mode === "year") {
    // 現在の選択イベントがあればそこを中心に
    if (selectedEvent.value) {
      zoomCenterYear.value = selectedEvent.value.start.year;
    }
  }
  if (mode === "month") {
    if (selectedEvent.value) {
      zoomCenterMonth.value = selectedEvent.value.startTime;
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
const EVENT_BAR_HEIGHT = 12;
const EVENT_ROW_GAP = 6;
const EVENT_ROW_HEIGHT = EVENT_BAR_HEIGHT + EVENT_ROW_GAP;
const LANE_PADDING = 10;
const MIN_LANE_HEIGHT = 60;
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

  if (zoomMode.value === "month") {
    return {
      min: zoomCenterMonth.value - zoomRangeMonths,
      max: zoomCenterMonth.value + zoomRangeMonths
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

const monthBounds = computed(() => {
  const min = Math.min(...times.value);
  const max = Math.max(...times.value);

  return {
    min,
    max
  };
});

const zoomLabel = computed(() => zoomLabels[zoomMode.value]);

// SVGサイズ
const width = 1100;

// time → x
function xPos(time) {
  const { min, max } = viewRange.value;

  return (
    leftLabelWidth +
    ((time - min) / (max - min)) *
      (width - leftLabelWidth - 40)
  );
}

function buildLaneLayout(events) {
  const subLaneEndTimes = [];
  const eventsWithLane = events
    .slice()
    .sort((a, b) => a.startTime - b.startTime)
    .map(event => {
      let subLaneIndex = subLaneEndTimes.findIndex(
        endTime => endTime < event.startTime
      );

      if (subLaneIndex === -1) {
        subLaneIndex = subLaneEndTimes.length;
        subLaneEndTimes.push(event.endTime);
      } else {
        subLaneEndTimes[subLaneIndex] = event.endTime;
      }

      return { ...event, subLaneIndex };
    });

  return {
    events: eventsWithLane,
    subLaneCount: Math.max(1, subLaneEndTimes.length)
  };
}

const laneEventLayouts = computed(() => {
  return characters.map((char, laneIndex) => {
    const laneEvents = allEvents.value.filter(
      event => event.laneIndex === laneIndex
    );
    const layout = buildLaneLayout(laneEvents);

    return {
      laneIndex,
      characterId: char.id,
      ...layout
    };
  });
});

const laneLayouts = computed(() => {
  let currentTop = topOffset;

  return characters.map((char, laneIndex) => {
    const laneData = laneEventLayouts.value[laneIndex];
    const subLaneCount = laneData?.subLaneCount ?? 1;
    const laneHeight = Math.max(
      MIN_LANE_HEIGHT,
      subLaneCount * EVENT_ROW_HEIGHT + LANE_PADDING * 2
    );
    const laneTop = currentTop;
    const centerY = laneTop + laneHeight / 2;

    currentTop += laneHeight;

    return {
      laneIndex,
      laneTop,
      laneHeight,
      centerY,
      subLaneCount
    };
  });
});

const svgHeight = computed(() => {
  const lastLane = laneLayouts.value.at(-1);
  const contentHeight = lastLane
    ? lastLane.laneTop + lastLane.laneHeight
    : topOffset;
  return contentHeight + 40;
});

function laneCenterY(laneIndex) {
  return laneLayouts.value[laneIndex]?.centerY ?? topOffset;
}

function eventY(event) {
  const lane = laneLayouts.value[event.laneIndex];
  if (!lane) return topOffset;

  return (
    lane.laneTop +
    LANE_PADDING +
    event.subLaneIndex * EVENT_ROW_HEIGHT +
    EVENT_BAR_HEIGHT / 2
  );
}

function isSingleWithinRange(event) {
  return event.occurrenceType === "singleWithinRange";
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

function timeToYearMonth(time) {
  const year = Math.floor(time / 12);
  const monthIndex = ((time % 12) + 12) % 12;
  return { year, month: monthIndex + 1 };
}

function monthLabel(time) {
  const { year, month } = timeToYearMonth(time);
  return `${yearLabel(year)} ${month}月`;
}

function dayTime(monthTime, day) {
  return monthTime + (day - 1) / 31;
}

const dayTicks = computed(() => {
  if (zoomMode.value !== "month") return [];

  const { min, max } = viewRange.value;
  const startMonth = Math.floor(min);
  const endMonth = Math.floor(max);
  const ticks = [];

  for (let monthTime = startMonth; monthTime <= endMonth; monthTime += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const time = dayTime(monthTime, day);
      if (time < min || time > max) continue;
      ticks.push({ time, day });
    }
  }

  return ticks;
});

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

const allEventsWithLayout = computed(() =>
  laneEventLayouts.value.flatMap(lane => lane.events)
);

const visibleEvents = computed(() => {
  const { min, max } = viewRange.value;
  return allEventsWithLayout.value.filter(
    e => e.endTime >= min && e.startTime <= max
  );
});

function handleKey(e) {
  if (e.key === "Escape") closePanel();
}

function zoomIn() {
  if (zoomMode.value === "all") {
    zoomMode.value = "year";
    return;
  }
  if (zoomMode.value === "year") {
    zoomMode.value = "month";
  }
}

function zoomOut() {
  if (zoomMode.value === "month") {
    zoomMode.value = "year";
    return;
  }
  if (zoomMode.value === "year") {
    zoomMode.value = "all";
  }
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
  zoomCenterMonth.value = timeValue(1, 1);

  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKey);
});

</script>

<template>
  <h1>キャラクタータイムライン</h1>

  <div class="zoom-controls">
    <button
      class="zoom-button"
      @click="zoomOut"
      :disabled="zoomMode === 'all'"
    >
      −
    </button>
    <span class="zoom-label">{{ zoomLabel }}</span>
    <button
      class="zoom-button"
      @click="zoomIn"
      :disabled="zoomMode === 'month'"
    >
      ＋
    </button>
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

  <div
    class="month-slider"
    v-if="zoomMode === 'month'"
  >
    <label>
      中心年月：
      {{ monthLabel(zoomCenterMonth) }}
    </label>

    <input
      type="range"
      :min="monthBounds.min"
      :max="monthBounds.max"
      v-model.number="zoomCenterMonth"
      step="1"
    />
  </div>

  <svg :width="width" :height="svgHeight">

    <!-- 年目盛り（全レーン共通） -->
    <g v-for="y in years" :key="y.year">
      <line
        :x1="xPos(y.time)"
        y1="40"
        :x2="xPos(y.time)"
        :y2="svgHeight - 20"
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

    <!-- 月ズーム時の日付補助スケール -->
    <g v-if="zoomMode === 'month'">
      <text
        v-for="tick in dayTicks"
        :key="`${tick.time}-${tick.day}`"
        :x="xPos(tick.time)"
        y="48"
        text-anchor="middle"
        font-size="9"
        fill="#bbb"
      >
        {{ tick.day }}
      </text>
    </g>

    <!-- キャラレーン -->
    <g v-for="(char, index) in characters" :key="char.id">

      <!-- キャラ名 -->
      <text
        x="10"
        :y="laneCenterY(index)"
        font-size="13"
        dominant-baseline="middle"
        fill="#333"
      >
        {{ char.name }}
      </text>

      <!-- レーン線 -->
      <line
        :x1="leftLabelWidth"
        :y1="laneCenterY(index)"
        :x2="width - 20"
        :y2="laneCenterY(index)"
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
          <template v-if="isSingleWithinRange(event)">
            （期間内の1日）
          </template>
          {{ event.title }}
        </title>

        <!-- 期間バー -->
        <rect
          class="event-bar"
          :class="{ 'event-bar--single': isSingleWithinRange(event) }"
          :x="xPos(event.startTime)"
          :y="eventY(event) - EVENT_BAR_HEIGHT / 2"
          :width="xPos(event.endTime) - xPos(event.startTime)"
          :height="EVENT_BAR_HEIGHT"
          :fill="event.color"
          rx="6"
        />

        <!-- 期間内1日イベントのマーカー -->
        <circle
          v-if="isSingleWithinRange(event)"
          :cx="(xPos(event.startTime) + xPos(event.endTime)) / 2"
          :cy="eventY(event)"
          r="3"
          fill="#333"
        />

        <!-- 開始点マーカー -->
        <circle
          :cx="xPos(event.startTime)"
          :cy="eventY(event)"
          r="5"
          :fill="event.color"
          stroke="#333"
        />

        <!-- 終了点マーカー -->
        <circle
          :cx="xPos(event.endTime)"
          :cy="eventY(event)"
          r="5"
          :fill="event.color"
          stroke="#333"
          stroke-width="1.5"
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.zoom-button {
  width: 28px;
  height: 28px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
  font-size: 16px;
  padding: 0;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-label {
  font-size: 13px;
  color: #444;
  min-width: 70px;
  text-align: center;
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

.month-slider {
  margin-bottom: 12px;
}

.month-slider label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}

.month-slider input[type="range"] {
  width: 300px;
}

.event-group {
  cursor: pointer;
}

.event-group:hover rect {
  opacity: 0.8;
}

.event-bar--single {
  stroke: #333;
  stroke-width: 1;
  stroke-dasharray: 3 2;
}

</style>
