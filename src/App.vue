<script setup>
import { computed, ref } from "vue";
import {
  idolCommu,
  hatsuboshiCommus,
  eventCommus,
  supportCardCommus,
  commonTimeline
} from "./data";
import { useKeyboard } from "./composables/useKeyboard";
import { useMenuState } from "./composables/useMenuState";
import { usePointer } from "./composables/usePointer";
import { useCategoryFilter } from "./composables/useCategoryFilter";
import { useSelection } from "./composables/useSelection";
import { useTimelineData } from "./composables/useTimelineData";
import { useTimelineLayout } from "./composables/useTimelineLayout";
import { useTimelineScales } from "./composables/useTimelineScales";
import { useZoomMachine } from "./composables/useZoomMachine";
import ManualModal from "./components/ManualModal.vue";
import ZoomControls from "./components/ZoomControls.vue";
import SidePanel from "./components/SidePanel.vue";
import TimelineSvg from "./components/TimelineSvg.vue";
import { invertHexColor } from "./utils/colors";
import { isSingleWithinRange } from "./utils/events";
import { yearLabel } from "./utils/labels";
import { LEFT_LABEL_WIDTH, RIGHT_PADDING, WIDTH } from "./utils/constants";
import manualContent from "../docs/manual.md?raw";

const idolCommuRef = ref(idolCommu);
const hatsuboshiRef = ref(hatsuboshiCommus);
const eventRef = ref(eventCommus);
const supportRef = ref(supportCardCommus);
const timelineStageRef = ref(null);

const {
  categoryOptions,
  selectedCategory,
  laneOptions,
  activeLanes,
  allSelected,
  isIndeterminate,
  isLaneSelected,
  toggleLane,
  toggleAll
} = useCategoryFilter({
  idolCommu: idolCommuRef,
  hatsuboshiCommus: hatsuboshiRef,
  eventCommus: eventRef,
  supportCardCommus: supportRef
});

const { isOpen: menuOpen, openMenu, closeMenu, toggleMenu } =
  useMenuState();

const {
  isOpen: manualOpen,
  openMenu: openManual,
  closeMenu: closeManual
} = useMenuState();

const { allEvents, timesDay } = useTimelineData(activeLanes, commonTimeline);
const { selectedEvent, selectEvent, closePanel } = useSelection(allEvents);

const {
  viewRange,
  horizontalSpan,
  verticalScale,
  horizontalZoomLabel,
  verticalZoomLabel,
  showMonthScale,
  showDayScale,
  canZoomInHorizontal,
  canZoomOutHorizontal,
  canZoomInVertical,
  canZoomOutVertical,
  panHorizontally,
  panByViewportRatio,
  zoomHorizontallyBy,
  zoomInHorizontal,
  zoomOutHorizontal,
  resetHorizontalZoom,
  zoomInVertical,
  zoomOutVertical,
  resetVerticalZoom
} = useZoomMachine(timesDay, selectedEvent);

const { years, monthTicks, dayTicks } = useTimelineScales({
  viewRange,
  showMonthScale,
  showDayScale
});

const {
  svgHeight,
  timelineViewport,
  laneCenterY,
  yPos,
  visibleEvents,
  xPos,
  eventBarHeight
} = useTimelineLayout({
  characters: activeLanes,
  allEvents,
  viewRange,
  verticalScale,
  width: WIDTH,
  leftLabelWidth: LEFT_LABEL_WIDTH,
  rightPadding: RIGHT_PADDING
});

function getRenderedViewportWidth(svgElement) {
  const rect = svgElement?.getBoundingClientRect?.();
  if (!rect?.width) return 0;

  return rect.width * (timelineViewport.value.width / WIDTH);
}

function clampRatio(value) {
  return Math.min(1, Math.max(0, value));
}

function panByPixels(deltaPixels, svgElement) {
  const renderedViewportWidth = getRenderedViewportWidth(svgElement);
  if (!renderedViewportWidth) return;

  panHorizontally((deltaPixels / renderedViewportWidth) * horizontalSpan.value);
}

function panVerticallyByPixels(deltaPixels) {
  const stageElement = timelineStageRef.value;
  if (!stageElement) return;

  stageElement.scrollTop -= deltaPixels;
}

function handleTimelineWheel(event) {
  const svgElement = event.currentTarget;
  const isHorizontalWheel = Math.abs(event.deltaX) > Math.abs(event.deltaY);

  event.preventDefault();

  if (isHorizontalWheel) {
    panByPixels(event.deltaX, svgElement);
    return;
  }

  const rect = svgElement.getBoundingClientRect();
  if (!rect.width) return;

  const scaleX = WIDTH / rect.width;
  const svgX = (event.clientX - rect.left) * scaleX;
  const anchorRatio = clampRatio(
    (svgX - timelineViewport.value.x) / timelineViewport.value.width
  );

  zoomHorizontallyBy(Math.exp(event.deltaY * 0.0015), anchorRatio);
}

const {
  isDragging,
  onClickCapture,
  onMouseDown,
  onTouchStart,
  onTouchMove,
  onTouchEnd
} = usePointer({
  panByPixels,
  panVerticallyByPixels
});

useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  closePanel
});

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
      <button
        class="manual-button"
        type="button"
        aria-label="マニュアルを開く"
        @click="openManual"
      >？</button>
    </div>
    <div class="app-title">キャラクタータイムライン</div>
  </header>

  <ManualModal
    :open="manualOpen"
    :content="manualContent"
    :on-close="closeManual"
  />

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
    :horizontal-zoom-label="horizontalZoomLabel"
    :vertical-zoom-label="verticalZoomLabel"
    :can-zoom-in-horizontal="canZoomInHorizontal"
    :can-zoom-out-horizontal="canZoomOutHorizontal"
    :can-zoom-in-vertical="canZoomInVertical"
    :can-zoom-out-vertical="canZoomOutVertical"
    :zoom-in-horizontal="zoomInHorizontal"
    :zoom-out-horizontal="zoomOutHorizontal"
    :reset-horizontal-zoom="resetHorizontalZoom"
    :zoom-in-vertical="zoomInVertical"
    :zoom-out-vertical="zoomOutVertical"
    :reset-vertical-zoom="resetVerticalZoom"
  />

  <div class="timeline-shell">
    <div ref="timelineStageRef" class="timeline-stage">
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
        :event-bar-height="eventBarHeight"
        :characters="activeLanes"
        :visible-events="visibleEvents"
        :is-single-within-range="isSingleWithinRange"
        :invert-hex-color="invertHexColor"
        :left-label-width="LEFT_LABEL_WIDTH"
        :year-label="yearLabel"
        :on-wheel="handleTimelineWheel"
        :on-click-capture="onClickCapture"
        :on-mouse-down="onMouseDown"
        :on-touch-start="onTouchStart"
        :on-touch-move="onTouchMove"
        :on-touch-end="onTouchEnd"
        :is-dragging="isDragging"
        @select="selectEvent"
      />
    </div>
  </div>

  <SidePanel
    :selected-event="selectedEvent"
    :year-label="yearLabel"
    :close-panel="closePanel"
  />
</template>
