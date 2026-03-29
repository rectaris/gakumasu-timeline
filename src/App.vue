<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
import TimelineScaleOverlay from "./components/TimelineScaleOverlay.vue";
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

const THEME_MODE_STORAGE_KEY = "gakumasu:theme-mode";
const SHOW_ZOOM_HINTS_STORAGE_KEY = "gakumasu:show-zoom-hints";
const SHOW_COMMON_EVENTS_STORAGE_KEY = "gakumasu:show-common-events";
const INTRO_GUIDE_DISMISSED_KEY = "gakumasu:intro-guide-dismissed";

const themeMode = ref("system");
const showZoomHints = ref(true);
const showCommonEvents = ref(true);
const showIntroGuide = ref(true);
const settingsReady = ref(false);

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
  showMonthScale,
  showDayScale,
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

const { years, monthTicks, dayTicks } = useTimelineScales({
  viewRange,
  showMonthScale,
  showDayScale
});

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

function getRenderedViewportWidth(svgElement) {
  const rect = svgElement?.getBoundingClientRect?.();
  if (!rect?.width) return 0;

  return rect.width * (timelineViewport.value.width / WIDTH);
}

function clampRatio(value) {
  return Math.min(1, Math.max(0, value));
}

function isFormElementTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target?.isContentEditable
  );
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

function readBooleanSetting(storageKey, fallbackValue) {
  const rawValue = window.localStorage.getItem(storageKey);
  if (rawValue === null) return fallbackValue;
  return rawValue === "true";
}

function applyThemeMode(mode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", mode);
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

function dismissIntroGuide() {
  showIntroGuide.value = false;
  window.localStorage.setItem(INTRO_GUIDE_DISMISSED_KEY, "true");
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
  const storedThemeMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (storedThemeMode === "light" || storedThemeMode === "dark") {
    themeMode.value = storedThemeMode;
  }
  showZoomHints.value = readBooleanSetting(SHOW_ZOOM_HINTS_STORAGE_KEY, true);
  showCommonEvents.value = readBooleanSetting(
    SHOW_COMMON_EVENTS_STORAGE_KEY,
    true
  );
  showIntroGuide.value = !readBooleanSetting(
    INTRO_GUIDE_DISMISSED_KEY,
    false
  );
  applyThemeMode(themeMode.value);
  settingsReady.value = true;
  window.addEventListener("keydown", handleGlobalEscape);
  window.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalEscape);
  window.removeEventListener("click", handleGlobalClick);
});

watch(themeMode, (mode) => {
  applyThemeMode(mode);
  if (!settingsReady.value) return;
  window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
});

watch(showZoomHints, (value) => {
  if (!settingsReady.value) return;
  window.localStorage.setItem(SHOW_ZOOM_HINTS_STORAGE_KEY, String(value));
});

watch(showCommonEvents, (value) => {
  if (!settingsReady.value) return;
  window.localStorage.setItem(SHOW_COMMON_EVENTS_STORAGE_KEY, String(value));
});
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button
        class="menu-button"
        type="button"
        aria-label="メニューを開く"
        @click="toggleMainMenu"
      >☰</button>
      <button
        class="manual-button"
        type="button"
        aria-label="マニュアルを開く"
        @click="openManualDialog"
      >？</button>
      <button
        class="settings-button"
        type="button"
        aria-label="設定を開く"
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
    @click="closeMenu"
  ></div>

  <div
    v-if="settingsOpen"
    class="menu-overlay"
    @click="closeSettings"
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
            placeholder="レーン名で絞り込み"
          />
        </label>
        <label class="lane-sort">
          <span class="lane-search__label">並び替え</span>
          <select v-model="laneSortMode" class="lane-sort__select">
            <option
              v-for="option in laneSortOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
        <p class="lane-summary">
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
      <div v-else class="menu-empty">
        {{ hasAnyLaneInCurrentCategory ? "該当するレーンがありません" : "今後追加予定" }}
      </div>
    </section>
  </aside>

  <aside class="settings-menu" :class="{ open: settingsOpen }">
    <div class="side-menu__header">
      <span>設定</span>
      <button
        class="menu-close"
        type="button"
        aria-label="設定を閉じる"
        @click="closeSettings"
      >
        ×
      </button>
    </div>

    <section class="side-menu__section">
      <p class="menu-section-title">配色モード</p>
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
      <p class="settings-note">
        既定では、お使いの OS / ブラウザ設定に合わせて配色を切り替えます。
      </p>
    </section>

    <section class="side-menu__section">
      <p class="menu-section-title">表示オプション</p>
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
      <p class="settings-note">
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
    <div class="timeline-frame">
      <section
        v-if="showIntroGuide"
        class="intro-guide"
        aria-label="初めて見る方向けの案内"
      >
        <div class="intro-guide__header">
          <p class="intro-guide__eyebrow">はじめて見る方向け</p>
          <button
            class="intro-guide__close"
            type="button"
            aria-label="案内を閉じる"
            @click="dismissIntroGuide"
          >
            ×
          </button>
        </div>
        <h2 class="intro-guide__title">まずは 3 ステップで見始められます</h2>
        <ol class="intro-guide__steps">
          <li>左上のメニューから見たいカテゴリやレーンを選ぶ</li>
          <li>ドラッグとホイールで範囲を動かし、気になる時期へ寄る</li>
          <li>イベントをクリックして右側の詳細を見る</li>
        </ol>
        <div class="intro-guide__actions">
          <button
            class="intro-guide__button intro-guide__button--primary"
            type="button"
            @click="openLaneGuide"
          >
            表示レーンを見る
          </button>
          <button
            class="intro-guide__button"
            type="button"
            @click="openManualDialog"
          >
            操作マニュアルを見る
          </button>
        </div>
        <p class="intro-guide__note">
          日付は各月 31 日換算の抽象時系列です。実カレンダーとは一致しません。
        </p>
      </section>

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
          :lane-layouts="laneLayouts"
          :lane-center-y="laneCenterY"
          :y-pos="yPos"
          :event-bar-height="eventBarHeight"
          :characters="activeLanes"
          :visible-events="visibleEvents"
          :is-single-within-range="isSingleWithinRange"
          :invert-hex-color="invertHexColor"
          :left-label-width="LEFT_LABEL_WIDTH"
          :on-wheel="handleTimelineWheel"
          :on-mouse-down="onMouseDown"
          :on-touch-start="onTouchStart"
          :on-touch-move="onTouchMove"
          :on-touch-end="onTouchEnd"
          :is-dragging="isDragging"
          @select="selectEvent"
        />
      </div>
    </div>
  </div>

  <SidePanel
    :selected-event="selectedEvent"
    :year-label="yearLabel"
    :close-panel="closePanel"
  />
</template>
