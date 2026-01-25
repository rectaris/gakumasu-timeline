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
import { dayLabel, monthLabel, yearLabel } from "./utils/labels";
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
} = usePointer({ zoomMode: mode, moveYear, moveMonth, moveDay });

useKeyboard({ zoomMode: mode, moveYear, moveMonth, moveDay, closePanel });

const prevYear = () => moveYear(-1);
const nextYear = () => moveYear(1);
const prevMonth = () => moveMonth(-1);
const nextMonth = () => moveMonth(1);
const prevDay = () => moveDay(-1);
const nextDay = () => moveDay(1);
</script>

<template>
  <h1>キャラクタータイムライン</h1>

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
