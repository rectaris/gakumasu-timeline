<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
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
import { usePersistedSettings } from "./composables/usePersistedSettings";
import ManualModal from "./components/ManualModal.vue";
import ZoomControls from "./components/ZoomControls.vue";
import SidePanel from "./components/SidePanel.vue";
import AdSlot from "./components/AdSlot.vue";
import IntroGuide from "./components/IntroGuide.vue";
import TimelineScaleOverlay from "./components/TimelineScaleOverlay.vue";
import TimelineSvg from "./components/TimelineSvg.vue";
import { invertHexColor } from "./utils/colors";
import { isFormElementTarget } from "./utils/dom";
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
  laneSortOptions,
  laneSearchQuery,
  laneSortMode,
  laneOptions,
  visibleLaneCount,
  totalLaneCount,
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
const {
  isOpen: settingsOpen,
  closeMenu: closeSettings,
  toggleMenu: toggleSettings
} = useMenuState();

const TIMELINE_FOOTER_AD_SLOT = "1582586734";

const {
  themeMode,
  showZoomHints,
  showCommonEvents,
  showIntroGuide,
  dismissIntroGuide
} = usePersistedSettings();

const { allEvents, timesDay } = useTimelineData(
  activeLanes,
  commonTimeline,
  showCommonEvents
);
const { selectedEvent, selectEvent, closePanel } = useSelection(allEvents);

const {
  viewRange,
  horizontalSpan,
  verticalScale,
  horizontalZoomLabel,
  verticalZoomLabel,
  showMonthScale: spanShowMonthScale,
  showDayScale: spanShowDayScale,
  canZoomInHorizontal,
  canZoomOutHorizontal,
  canZoomInVertical,
  canZoomOutVertical,
  panHorizontally,
  panByViewportRatio,
  zoomHorizontallyBy,
  zoomVerticallyBy,
  zoomInHorizontal,
  zoomOutHorizontal,
  resetHorizontalZoom,
  zoomInVertical,
  zoomOutVertical,
  resetVerticalZoom
} = useZoomMachine(timesDay, selectedEvent);

const {
  laneLayouts,
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

const { years, monthTicks, dayTicks, showMonthScale, showDayScale } =
  useTimelineScales({
    viewRange,
    showMonthScale: spanShowMonthScale,
    showDayScale: spanShowDayScale,
    timelineViewport,
  });

const timelineRenderContext = computed(() => ({
  width: WIDTH,
  svgHeight: svgHeight.value,
  timelineViewport: timelineViewport.value,
  years: years.value,
  monthTicks: monthTicks.value,
  dayTicks: dayTicks.value,
  showMonthScale: showMonthScale.value,
  showDayScale: showDayScale.value,
  xPos,
  laneLayouts: laneLayouts.value,
  laneCenterY,
  yPos,
  eventBarHeight: eventBarHeight.value,
  characters: activeLanes.value,
  visibleEvents: visibleEvents.value,
  selectedEvent: selectedEvent.value,
  isSingleWithinRange,
  invertHexColor,
  leftLabelWidth: LEFT_LABEL_WIDTH
}));

function getRenderedViewportWidth(svgElement) {
  const rect = svgElement?.getBoundingClientRect?.();
  if (!rect?.width) return 0;

  return rect.width * (timelineViewport.value.width / WIDTH);
}

function clampRatio(value) {
  return Math.min(1, Math.max(0, value));
}

function shouldKeepPanelOpenFromClick(target) {
  if (!target?.closest) return false;

  return Boolean(
    target.closest(".app-header") ||
      target.closest(".side-menu") ||
      target.closest(".settings-menu") ||
      target.closest(".manual-modal") ||
      target.closest(".side-panel") ||
      target.closest(".zoom-panel") ||
      target.closest(".zoom-controls") ||
      target.closest(".intro-guide") ||
      target.closest(".event-group"),
  );
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

function zoomByTouchPinch(factor, clientX, svgElement) {
  const rect = svgElement?.getBoundingClientRect?.();
  if (!rect?.width) return;

  const scaleX = WIDTH / rect.width;
  const svgX = (clientX - rect.left) * scaleX;
  const anchorRatio = clampRatio(
    (svgX - timelineViewport.value.x) / timelineViewport.value.width
  );

  zoomHorizontallyBy(factor, anchorRatio);
  zoomVerticallyBy(factor);
}

function handleTimelineWheel(event) {
  const svgElement = event.currentTarget;
  const isHorizontalWheel = Math.abs(event.deltaX) > Math.abs(event.deltaY);

  event.preventDefault();

  if (event.ctrlKey) {
    zoomVerticallyBy(Math.exp(event.deltaY * -0.0015));
    return;
  }

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

function toggleMainMenu() {
  closeSettings();
  toggleMenu();
}

function toggleSettingsMenu() {
  closeMenu();
  toggleSettings();
}

function openManualDialog() {
  closeMenu();
  closeSettings();
  openManual();
}

function openLaneGuide() {
  closeSettings();
  closeManual();
  openMenu();
}

const {
  isDragging,
  onMouseDown,
  onTouchStart,
  onTouchMove,
  onTouchEnd
} = usePointer({
  panByPixels,
  panVerticallyByPixels,
  zoomByPinch: zoomByTouchPinch
});

const timelineInteractionHandlers = {
  onMouseDown,
  onWheel: handleTimelineWheel,
  onTouchStart,
  onTouchMove,
  onTouchEnd
};

useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  closePanel
});

const isCurrentCategoryEmpty = computed(() => laneOptions.value.length === 0);
const hasAnyLaneInCurrentCategory = computed(() => totalLaneCount.value > 0);

function handleGlobalEscape(event) {
  if (event.key !== "Escape") return;
  if (isFormElementTarget(event.target)) return;

  closeMenu();
  closeManual();
  closeSettings();
}

function handleGlobalClick(event) {
  if (!selectedEvent.value) return;
  if (shouldKeepPanelOpenFromClick(event.target)) return;

  closePanel();
}

onMounted(() => {
  window.addEventListener("keydown", handleGlobalEscape);
  window.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalEscape);
  window.removeEventListener("click", handleGlobalClick);
});

</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button
        class="menu-button"
        type="button"
        aria-label="メニューを開く"
        aria-haspopup="dialog"
        aria-controls="side-menu"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        title="メニューを開く"
        @click="toggleMainMenu"
      >☰</button>
      <button
        class="manual-button"
        type="button"
        aria-label="マニュアルを開く"
        aria-haspopup="dialog"
        aria-controls="manual-modal"
        :aria-expanded="manualOpen ? 'true' : 'false'"
        title="マニュアルを開く"
        @click="openManualDialog"
      >？</button>
      <button
        class="settings-button"
        type="button"
        aria-label="設定を開く"
        aria-haspopup="dialog"
        aria-controls="settings-menu"
        :aria-expanded="settingsOpen ? 'true' : 'false'"
        title="設定を開く"
        @click="toggleSettingsMenu"
      >⚙</button>
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
    aria-hidden="true"
    @click="closeMenu"
  ></div>

  <div
    v-if="settingsOpen"
    class="menu-overlay"
    aria-hidden="true"
    @click="closeSettings"
  ></div>

  <aside
    id="side-menu"
    class="side-menu"
    :class="{ open: menuOpen }"
    role="dialog"
    aria-modal="true"
    aria-labelledby="side-menu-title"
    :aria-describedby="hasAnyLaneInCurrentCategory ? 'lane-summary' : 'menu-empty-state'"
  >
    <div class="side-menu__header">
      <span id="side-menu-title">表示設定</span>
      <button
        class="menu-close"
        type="button"
        aria-label="メニューを閉じる"
        title="メニューを閉じる"
        @click="closeMenu"
      >
        ×
      </button>
    </div>

    <section class="side-menu__section" aria-labelledby="menu-category-title">
      <p id="menu-category-title" class="menu-section-title">カテゴリ</p>
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

    <section class="side-menu__section" aria-labelledby="menu-lanes-title">
      <div class="menu-section-header">
        <p id="menu-lanes-title" class="menu-section-title">表示レーン</p>
        <label class="menu-bulk-toggle">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="isIndeterminate"
            @change="toggleAll(selectedCategory, $event.target.checked)"
            :disabled="isCurrentCategoryEmpty"
          />
          <span>表示中を一括</span>
        </label>
      </div>
      <div v-if="hasAnyLaneInCurrentCategory" class="lane-tools">
        <label class="lane-search">
          <span class="lane-search__label">検索</span>
          <input
            v-model="laneSearchQuery"
            class="lane-search__input"
            type="search"
            aria-label="表示レーンを検索"
            :aria-describedby="hasAnyLaneInCurrentCategory ? 'lane-summary' : undefined"
            title="表示レーンを検索"
            placeholder="レーン名で絞り込み"
          />
        </label>
        <label class="lane-sort">
          <span class="lane-search__label">並び替え</span>
          <select
            v-model="laneSortMode"
            class="lane-sort__select"
            aria-label="表示レーンの並び順を選ぶ"
            :aria-describedby="hasAnyLaneInCurrentCategory ? 'lane-summary' : undefined"
            title="表示レーンの並び順を選ぶ"
          >
            <option
              v-for="option in laneSortOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
        <p id="lane-summary" class="lane-summary">
          {{ visibleLaneCount }} / {{ totalLaneCount }} 件表示
        </p>
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
          <span class="menu-option__meta">{{ lane.eventCount }}件</span>
        </label>
      </template>
      <div id="menu-empty-state" v-else class="menu-empty">
        {{ hasAnyLaneInCurrentCategory ? "該当するレーンがありません" : "今後追加予定" }}
      </div>
    </section>
  </aside>

  <aside
    id="settings-menu"
    class="settings-menu"
    :class="{ open: settingsOpen }"
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-menu-title"
    aria-describedby="settings-display-note"
  >
    <div class="side-menu__header">
      <span id="settings-menu-title">設定</span>
      <button
        class="menu-close"
        type="button"
        aria-label="設定を閉じる"
        title="設定を閉じる"
        @click="closeSettings"
      >
        ×
      </button>
    </div>

    <section
      class="side-menu__section"
      aria-labelledby="settings-theme-title"
      aria-describedby="settings-theme-note"
    >
      <p id="settings-theme-title" class="menu-section-title">配色モード</p>
      <label class="menu-option">
        <input
          type="radio"
          name="theme-mode"
          value="system"
          v-model="themeMode"
        />
        <span>システム設定に合わせる</span>
      </label>
      <label class="menu-option">
        <input
          type="radio"
          name="theme-mode"
          value="light"
          v-model="themeMode"
        />
        <span>ホワイトモード</span>
      </label>
      <label class="menu-option">
        <input
          type="radio"
          name="theme-mode"
          value="dark"
          v-model="themeMode"
        />
        <span>ダークモード</span>
      </label>
      <p id="settings-theme-note" class="settings-note">
        既定では、お使いの OS / ブラウザ設定に合わせて配色を切り替えます。
      </p>
    </section>

    <section
      class="side-menu__section"
      aria-labelledby="settings-display-title"
      aria-describedby="settings-display-note"
    >
      <p id="settings-display-title" class="menu-section-title">表示オプション</p>
      <label class="menu-option">
        <input
          type="checkbox"
          :checked="showCommonEvents"
          @change="showCommonEvents = $event.target.checked"
        />
        <span>共通イベントを表示する</span>
      </label>
      <label class="menu-option">
        <input
          type="checkbox"
          :checked="showZoomHints"
          @change="showZoomHints = $event.target.checked"
        />
        <span>操作ヒントを表示する</span>
      </label>
      <p id="settings-display-note" class="settings-note">
        タイムラインの見え方や補助情報の表示を切り替えられます。
      </p>
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
    :show-hints="showZoomHints"
  />

  <div class="timeline-shell">
    <div
      class="timeline-frame"
      role="region"
      aria-label="キャラクタータイムライン表示エリア"
    >
      <IntroGuide
        v-if="showIntroGuide"
        :menu-open="menuOpen"
        :manual-open="manualOpen"
        :on-dismiss="dismissIntroGuide"
        :on-open-lane-guide="openLaneGuide"
        :on-open-manual="openManualDialog"
      />

      <TimelineScaleOverlay
        :width="WIDTH"
        :overlay-height="timelineViewport.y"
        :timeline-viewport="timelineViewport"
        :years="years"
        :month-ticks="monthTicks"
        :day-ticks="dayTicks"
        :show-month-scale="showMonthScale"
        :show-day-scale="showDayScale"
        :x-pos="xPos"
        :year-label="yearLabel"
      />
      <div
        ref="timelineStageRef"
        class="timeline-stage"
        role="region"
        aria-label="タイムライン本体"
      >
        <div class="timeline-scroll-content">
          <div class="timeline-svg-wrap">
            <TimelineSvg
              :render-context="timelineRenderContext"
              :interaction-handlers="timelineInteractionHandlers"
              :is-dragging="isDragging"
              @select="selectEvent"
            />
          </div>
          <div v-if="TIMELINE_FOOTER_AD_SLOT" class="timeline-footer-ad">
            <AdSlot label="広告" :ad-slot="TIMELINE_FOOTER_AD_SLOT" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <SidePanel
    :selected-event="selectedEvent"
    :year-label="yearLabel"
    :close-panel="closePanel"
  />
</template>
