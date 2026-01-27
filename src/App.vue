<script setup>
import { computed, ref } from "vue";
import {
  characters,
  hatsuboshiCommus,
  eventCommus,
  supportCardCommus
} from "./data";
import { useEventDisplay } from "./composables/useEventDisplay";
import { useKeyboard } from "./composables/useKeyboard";
import { useMenuState } from "./composables/useMenuState";
import { usePointer } from "./composables/usePointer";
import { useCategoryFilter } from "./composables/useCategoryFilter";
import { useSelection } from "./composables/useSelection";
import { useTimelineData } from "./composables/useTimelineData";
import { useTimelineLayout } from "./composables/useTimelineLayout";
import { useTimelineScales } from "./composables/useTimelineScales";
import { useZoomMachine } from "./composables/useZoomMachine";
import ZoomControls from "./components/ZoomControls.vue";
import SidePanel from "./components/SidePanel.vue";
import TimelineSvg from "./components/TimelineSvg.vue";
import { invertHexColor } from "./utils/colors";
import { isSingleWithinRange } from "./utils/events";
import { dayLabel, monthLabel, yearLabel } from "./utils/labels";
import { LEFT_LABEL_WIDTH, RIGHT_PADDING, WIDTH } from "./utils/constants";

const charactersRef = ref(characters);
const hatsuboshiRef = ref(hatsuboshiCommus);
const eventRef = ref(eventCommus);
const supportRef = ref(supportCardCommus);

const {
  categoryOptions,
  selectedCategory,
  laneOptions,
  activeLanes,
  normalizedEvents,
  allSelected,
  isIndeterminate,
  isLaneSelected,
  toggleLane,
  toggleAll
} = useCategoryFilter({
  characters: charactersRef,
  hatsuboshiCommus: hatsuboshiRef,
  eventCommus: eventRef,
  supportCardCommus: supportRef
});

const { isOpen: menuOpen, openMenu, closeMenu, toggleMenu } =
  useMenuState();

const { allEvents, times, timesDay } = useTimelineData(activeLanes);
const { selectedEvent, selectEvent, closePanel } = useSelection(allEvents);

const {
  mode,
  centerYear,
  centerMonth,
  centerDay,
  zoomLabel,
  viewRange,
  yearBounds,
  monthBounds,
  dayBounds,
  isYearMode,
  isMonthMode,
  isDayMode,
  isFullMode,
  isDayScale,
  showMonthScale,
  showDayScale,
  moveYear,
  moveMonth,
  moveDay,
  moveNext,
  movePrev,
  zoomIn,
  zoomOut
} = useZoomMachine(times, timesDay, selectedEvent);

const { eventDisplayStart, eventDisplayEnd } = useEventDisplay(isDayScale);

const { years, monthTicks, dayTicks } = useTimelineScales({
  viewRange,
  isDayScale,
  showMonthScale,
  showDayScale
});

const {
  svgHeight,
  timelineViewport,
  laneCenterY,
  yPos,
  visibleEvents,
  xPos
} = useTimelineLayout({
  characters: activeLanes,
  allEvents,
  viewRange,
  isDayScale,
  eventDisplayStart,
  eventDisplayEnd,
  width: WIDTH,
  leftLabelWidth: LEFT_LABEL_WIDTH,
  rightPadding: RIGHT_PADDING
});

const {
  startHold,
  stopHold,
  handleNavClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd
} = usePointer({ zoomMode: mode, moveYear, moveMonth, moveDay });

useKeyboard({ zoomMode: mode, moveYear, moveMonth, moveDay, closePanel });

const prevYear = () => moveYear(-1);
const nextYear = () => moveYear(1);
const prevMonth = () => moveMonth(-1);
const nextMonth = () => moveMonth(1);
const prevDay = () => moveDay(-1);
const nextDay = () => moveDay(1);

const isCurrentCategoryEmpty = computed(() => laneOptions.value.length === 0);
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button
        class="menu-button"
        type="button"
        aria-label="メニューを開く"
        @click="toggleMenu"
      >☰</button>
      <a
        class="manual-button"
        href="docs/manual.md"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="マニュアルを開く"
      >？</a>
    </div>
    <div class="app-title">キャラクタータイムライン</div>
  </header>

  <div
    v-if="menuOpen"
    class="menu-overlay"
    @click="closeMenu"
  ></div>

  <aside class="side-menu" :class="{ open: menuOpen }">
    <div class="side-menu__header">
      <span>表示設定</span>
      <button
        class="menu-close"
        type="button"
        aria-label="メニューを閉じる"
        @click="closeMenu"
      >
        ×
      </button>
    </div>

    <section class="side-menu__section">
      <p class="menu-section-title">カテゴリ</p>
      <label
        v-for="option in categoryOptions"
        :key="option.id"
        class="menu-option"
      >
        <input
          type="radio"
          name="category"
          :value="option.id"
          v-model="selectedCategory"
        />
        <span>{{ option.label }}</span>
      </label>
    </section>

    <section class="side-menu__section">
      <div class="menu-section-header">
        <p class="menu-section-title">表示レーン</p>
        <label class="menu-bulk-toggle">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="isIndeterminate"
            @change="toggleAll(selectedCategory, $event.target.checked)"
            :disabled="isCurrentCategoryEmpty"
          />
          <span>一括</span>
        </label>
      </div>
      <template v-if="!isCurrentCategoryEmpty">
        <label
          v-for="lane in laneOptions"
          :key="lane.key"
          class="menu-option"
        >
          <input
            type="checkbox"
            :checked="isLaneSelected(selectedCategory, lane.key)"
            @change="toggleLane(selectedCategory, lane.key)"
          />
          <span>{{ lane.label }}</span>
        </label>
      </template>
      <div v-else class="menu-empty">今後追加予定</div>
    </section>
  </aside>

  <ZoomControls
    :zoom-mode="mode"
    :is-year-mode="isYearMode"
    :is-month-mode="isMonthMode"
    :is-day-mode="isDayMode"
    :is-full-mode="isFullMode"
    :zoom-label="zoomLabel"
    :zoom-center-year="centerYear"
    :zoom-center-month="centerMonth"
    :zoom-center-day="centerDay"
    :year-bounds="yearBounds"
    :month-bounds="monthBounds"
    :day-bounds="dayBounds"
    :year-label="yearLabel"
    :month-label="monthLabel"
    :day-label="dayLabel"
    :zoom-in="zoomIn"
    :zoom-out="zoomOut"
    :prev-year="prevYear"
    :next-year="nextYear"
    :prev-month="prevMonth"
    :next-month="nextMonth"
    :prev-day="prevDay"
    :next-day="nextDay"
    :start-hold="startHold"
    :stop-hold="stopHold"
    :handle-nav-click="handleNavClick"
    @update:zoom-center-year="value => (centerYear = value)"
    @update:zoom-center-month="value => (centerMonth = value)"
    @update:zoom-center-day="value => (centerDay = value)"
  />

  <TimelineSvg
    :width="WIDTH"
    :svg-height="svgHeight"
    :timeline-viewport="timelineViewport"
    :years="years"
    :month-ticks="monthTicks"
    :day-ticks="dayTicks"
    :show-month-scale="showMonthScale"
    :show-day-scale="showDayScale"
    :x-pos="xPos"
    :lane-center-y="laneCenterY"
    :y-pos="yPos"
    :characters="activeLanes"
    :visible-events="visibleEvents"
    :is-day-scale="isDayScale"
    :is-single-within-range="isSingleWithinRange"
    :invert-hex-color="invertHexColor"
    :left-label-width="LEFT_LABEL_WIDTH"
    :year-label="yearLabel"
    :on-touch-start="onTouchStart"
    :on-touch-move="onTouchMove"
    :on-touch-end="onTouchEnd"
    @select="selectEvent"
  />

  <SidePanel
    :selected-event="selectedEvent"
    :year-label="yearLabel"
    :close-panel="closePanel"
  />
</template>
