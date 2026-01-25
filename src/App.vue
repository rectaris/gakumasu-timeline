<script setup>
import { ref } from "vue";
import { characters } from "./data";
import { useEventDisplay } from "./composables/useEventDisplay";
import { useKeyboard } from "./composables/useKeyboard";
import { usePointer } from "./composables/usePointer";
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
import { monthLabel, yearLabel } from "./utils/labels";
import { LEFT_LABEL_WIDTH, RIGHT_PADDING, WIDTH } from "./utils/constants";

const charactersRef = ref(characters);

const { allEvents, times, timesDay } = useTimelineData(charactersRef);
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
  characters: charactersRef,
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
} = usePointer({ zoomMode: mode, moveYear, moveMonth });

useKeyboard({ zoomMode: mode, moveYear, moveMonth, closePanel });

const prevYear = () => moveYear(-1);
const nextYear = () => moveYear(1);
const prevMonth = () => moveMonth(-1);
const nextMonth = () => moveMonth(1);
</script>

<template>
  <h1>キャラクタータイムライン</h1>

  <ZoomControls
    :zoom-mode="mode"
    :is-year-mode="isYearMode"
    :is-month-mode="isMonthMode"
    :is-day-mode="isDayMode"
    :zoom-label="zoomLabel"
    :zoom-center-year="centerYear"
    :zoom-center-month="centerMonth"
    :year-bounds="yearBounds"
    :month-bounds="monthBounds"
    :year-label="yearLabel"
    :month-label="monthLabel"
    :zoom-in="zoomIn"
    :zoom-out="zoomOut"
    :prev-year="prevYear"
    :next-year="nextYear"
    :prev-month="prevMonth"
    :next-month="nextMonth"
    :start-hold="startHold"
    :stop-hold="stopHold"
    :handle-nav-click="handleNavClick"
    @update:zoom-center-year="value => (centerYear = value)"
    @update:zoom-center-month="value => (centerMonth = value)"
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
    :characters="charactersRef"
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
  color: #000000;
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
