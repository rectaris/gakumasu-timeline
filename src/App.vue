<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { characters } from "./data";
import { watch } from "vue";

const DAYS_IN_MONTH = 31;

function timeValue(year, month) {
  return year * 12 + (month - 1);
}

function dayTimeValue(year, month, day = 1) {
  return timeValue(year, month) * DAYS_IN_MONTH + (day - 1);
}

const zoomMode = ref("all"); 
// "all" | "year" | "month"

const zoomCenterYear = ref(0);
const zoomRangeYears = 1;
const zoomCenterMonth = ref(0);
const zoomRangeMonths = 1;

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

function normalizeHexColor(color) {
  if (!color) return null;
  const hex = color.replace("#", "");
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map(ch => ch + ch)
      .join("")}`;
  }
  if (hex.length === 6) return `#${hex}`;
  return null;
}

function invertHexColor(color) {
  const hex = normalizeHexColor(color);
  if (!hex) return "#ffffff";
  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
        endTime,
        startTimeDay: dayTimeValue(
          ev.start.year,
          ev.start.month,
          ev.start.day ?? 1
        ),
        endTimeDay: dayTimeValue(
          ev.end.year,
          ev.end.month,
          ev.end.day ?? 1
        )
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
    const startMonth = zoomCenterMonth.value - zoomRangeMonths;
    const endMonth = zoomCenterMonth.value + zoomRangeMonths;
    return {
      min: startMonth * DAYS_IN_MONTH,
      max: endMonth * DAYS_IN_MONTH + (DAYS_IN_MONTH - 1)
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
  const minMonth = Math.min(...times.value);
  const maxMonth = Math.max(...times.value);

  if (maxMonth - minMonth < 2) {
    return {
      minMonth: minMonth - 1,
      maxMonth: maxMonth + 1
    };
  }

  return { minMonth, maxMonth };
});

const zoomLabel = computed(() => zoomLabels[zoomMode.value]);

const isDayScale = computed(() => zoomMode.value === "month");

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

function displayTimeForMonth(monthTime) {
  return isDayScale.value
    ? monthTime * DAYS_IN_MONTH
    : monthTime;
}

function eventDisplayStart(event) {
  return isDayScale.value
    ? event.startTimeDay
    : event.startTime;
}

function eventDisplayEnd(event) {
  return isDayScale.value
    ? event.endTimeDay
    : event.endTime;
}

function buildLaneLayout(events) {
  const useDayScale = isDayScale.value;
  const subLaneEndTimes = [];
  const eventsWithLane = events
    .slice()
    .sort((a, b) =>
      (useDayScale ? a.startTimeDay : a.startTime) -
        (useDayScale ? b.startTimeDay : b.startTime)
    )
    .map(event => {
      const startTime = useDayScale
        ? event.startTimeDay
        : event.startTime;
      const endTime = useDayScale
        ? event.endTimeDay
        : event.endTime;
      let subLaneIndex = subLaneEndTimes.findIndex(
        laneEndTime => laneEndTime < startTime
      );

      if (subLaneIndex === -1) {
        subLaneIndex = subLaneEndTimes.length;
        subLaneEndTimes.push(endTime);
      } else {
        subLaneEndTimes[subLaneIndex] = endTime;
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
  return monthTime * DAYS_IN_MONTH + (day - 1);
}

const dayTicks = computed(() => {
  if (zoomMode.value !== "month") return [];

  const { min, max } = viewRange.value;
  const startMonth = Math.floor(min / DAYS_IN_MONTH);
  const endMonth = Math.floor(max / DAYS_IN_MONTH);
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

const monthTicks = computed(() => {
  if (zoomMode.value !== "month") return [];

  const { min, max } = viewRange.value;
  const startMonth = Math.floor(min / DAYS_IN_MONTH);
  const endMonth = Math.floor(max / DAYS_IN_MONTH);
  const ticks = [];

  for (let monthTime = startMonth; monthTime <= endMonth; monthTime += 1) {
    const { month } = timeToYearMonth(monthTime);
    ticks.push({
      time: dayTime(monthTime, 1),
      label: `${month}月`
    });
  }

  return ticks;
});

// 年スケール
const years = computed(() => {
  const { min, max } = viewRange.value;
  const minMonth = isDayScale.value
    ? Math.floor(min / DAYS_IN_MONTH)
    : Math.floor(min);
  const maxMonth = isDayScale.value
    ? Math.floor(max / DAYS_IN_MONTH)
    : Math.floor(max);
  const startYear = Math.floor(minMonth / 12);
  const endYear = Math.floor(maxMonth / 12);

  const result = [];
  for (let y = startYear; y <= endYear; y++) {
    result.push({
      year: y,
      time: displayTimeForMonth(y * 12)
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
    e =>
      eventDisplayEnd(e) >= min &&
      eventDisplayStart(e) <= max
  );
});

function handleKey(e) {
  if (e.key === "Escape") closePanel();
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

  const target = e.target;
  const tagName = target?.tagName?.toLowerCase();
  const isFormElement =
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target?.isContentEditable;

  if (isFormElement) return;

  const delta = e.key === "ArrowRight" ? 1 : -1;

  if (e.shiftKey) {
    moveYear(delta);
    return;
  }

  if (zoomMode.value === "month") {
    moveMonth(delta);
  } else if (zoomMode.value === "year") {
    moveYear(delta);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function moveYear(delta) {
  zoomCenterYear.value = clamp(
    zoomCenterYear.value + delta,
    yearBounds.value.minYear,
    yearBounds.value.maxYear
  );
}

function moveMonth(delta) {
  zoomCenterMonth.value = clamp(
    zoomCenterMonth.value + delta,
    monthBounds.value.minMonth,
    monthBounds.value.maxMonth
  );
}

function prevYear() {
  moveYear(-1);
}

function nextYear() {
  moveYear(1);
}

function prevMonth() {
  moveMonth(-1);
}

function nextMonth() {
  moveMonth(1);
}

const holdIntervalId = ref(null);
const holdTimeoutId = ref(null);
const suppressClick = ref(false);

function stopHold() {
  if (holdTimeoutId.value) {
    clearTimeout(holdTimeoutId.value);
    holdTimeoutId.value = null;
  }
  if (holdIntervalId.value) {
    clearInterval(holdIntervalId.value);
    holdIntervalId.value = null;
  }
}

function startHold(action) {
  suppressClick.value = true;
  stopHold();
  action();
  holdTimeoutId.value = setTimeout(() => {
    holdIntervalId.value = setInterval(action, 100);
  }, 300);
}

function handleNavClick(action) {
  if (suppressClick.value) {
    suppressClick.value = false;
    return;
  }
  action();
}

const touchStartX = ref(0);
const touchStartY = ref(0);
const touchActive = ref(false);

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  touchActive.value = true;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
}

function onTouchMove(e) {
  if (!touchActive.value || e.touches.length !== 1) return;
}

function onTouchEnd(e) {
  if (!touchActive.value) return;
  touchActive.value = false;

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const diffX = endX - touchStartX.value;
  const diffY = endY - touchStartY.value;

  if (Math.abs(diffX) < 40 || Math.abs(diffX) <= Math.abs(diffY)) return;

  const delta = diffX < 0 ? 1 : -1;

  if (zoomMode.value === "month") {
    moveMonth(delta);
  } else if (zoomMode.value === "year") {
    moveYear(delta);
  }
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
  stopHold();
});

</script>

<template>
  <h1>キャラクタータイムライン</h1>

  <div class="zoom-controls">
    <button
      class="zoom-button zoom-button--out"
      @click="zoomOut"
      :disabled="zoomMode === 'all'"
    >
      −
    </button>
    <span class="zoom-label">{{ zoomLabel }}</span>
    <button
      class="zoom-button zoom-button--in"
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

    <div class="slider-row">
      <button
        class="slider-nav slider-nav--prev"
        @mousedown="startHold(prevYear)"
        @touchstart="startHold(prevYear)"
        @click="handleNavClick(prevYear)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterYear <= yearBounds.minYear"
      >
        &lt;
      </button>
      <input
        type="range"
        :min="yearBounds.minYear"
        :max="yearBounds.maxYear"
        v-model.number="zoomCenterYear"
        step="1"
      />
      <button
        class="slider-nav slider-nav--next"
        @mousedown="startHold(nextYear)"
        @touchstart="startHold(nextYear)"
        @click="handleNavClick(nextYear)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterYear >= yearBounds.maxYear"
      >
        &gt;
      </button>
    </div>
  </div>

  <div
    class="month-slider"
    v-if="zoomMode === 'month'"
  >
    <label>
      中心月：
      {{ monthLabel(zoomCenterMonth) }}
    </label>

    <div class="slider-row">
      <button
        class="slider-nav slider-nav--prev"
        @mousedown="startHold(prevMonth)"
        @touchstart="startHold(prevMonth)"
        @click="handleNavClick(prevMonth)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterMonth <= monthBounds.minMonth"
      >
        &lt;
      </button>
      <input
        type="range"
        :min="monthBounds.minMonth"
        :max="monthBounds.maxMonth"
        v-model.number="zoomCenterMonth"
        step="1"
      />
      <button
        class="slider-nav slider-nav--next"
        @mousedown="startHold(nextMonth)"
        @touchstart="startHold(nextMonth)"
        @click="handleNavClick(nextMonth)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
        @touchend="stopHold"
        @touchcancel="stopHold"
        :disabled="zoomCenterMonth >= monthBounds.maxMonth"
      >
        &gt;
      </button>
    </div>
  </div>

  <svg
    :width="width"
    :height="svgHeight"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >

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

    <!-- 月ズーム時の月名表示 -->
    <g v-if="zoomMode === 'month'">
      <text
        v-for="tick in monthTicks"
        :key="`month-${tick.time}`"
        :x="xPos(tick.time)"
        y="40"
        text-anchor="middle"
        font-size="10"
        fill="#777"
      >
        {{ tick.label }}
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
      <rect
        x="6"
        :y="laneCenterY(index) - 12"
        :width="leftLabelWidth - 12"
        height="24"
        :fill="invertHexColor(char.color)"
        rx="6"
      />
      <text
        x="10"
        :y="laneCenterY(index)"
        font-size="13"
        dominant-baseline="middle"
        :fill="char.color"
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
          :x="xPos(eventDisplayStart(event))"
          :y="eventY(event) - EVENT_BAR_HEIGHT / 2"
          :width="xPos(eventDisplayEnd(event)) - xPos(eventDisplayStart(event))"
          :height="EVENT_BAR_HEIGHT"
          :fill="event.color"
          rx="6"
        />

        <!-- 期間内1日イベントのマーカー -->
        <circle
          v-if="isSingleWithinRange(event)"
          :cx="(xPos(eventDisplayStart(event)) + xPos(eventDisplayEnd(event))) / 2"
          :cy="eventY(event)"
          r="3"
          fill="#333"
        />

        <!-- 開始点マーカー -->
        <circle
          :cx="xPos(eventDisplayStart(event))"
          :cy="eventY(event)"
          r="5"
          :fill="event.color"
          stroke="#333"
        />

        <!-- 終了点マーカー -->
        <circle
          :cx="xPos(eventDisplayEnd(event))"
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
  display: block;
  min-height: auto;
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
  position: fixed;
  top: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1100;
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

.zoom-button--in {
  color: #d60000;
}

.zoom-button--out {
  color: #0066cc;
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

.slider-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.slider-nav {
  width: 22px;
  height: 22px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 0;
}

.slider-nav--prev {
  color: #0066cc;
}

.slider-nav--next {
  color: #d60000;
}

.slider-nav:hover {
  background: #f3f3f3;
}

.slider-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
