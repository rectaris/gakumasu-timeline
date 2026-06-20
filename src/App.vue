<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  idolCommu,
  hatsuboshiCommus,
  eventCommus,
  supportCardCommus,
  commonTimeline
} from "./data";
import { characterCatalog } from "./data/characterCatalog";
import { worldlines } from "./data/worldlines";
import { useKeyboard } from "./composables/useKeyboard";
import { useMenuState } from "./composables/useMenuState";
import { usePointer } from "./composables/usePointer";
import { useCategoryFilter } from "./composables/useCategoryFilter";
import { useEventSearchFilter } from "./composables/useEventSearchFilter";
import { useSelection } from "./composables/useSelection";
import { useEventDetailContext } from "./composables/useEventDetailContext";
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
import {
  parseTimelineViewState,
  replaceTimelineViewStateInUrl,
} from "./utils/viewStateUrl";
import { LEFT_LABEL_WIDTH, RIGHT_PADDING, WIDTH } from "./utils/constants";
import manualContent from "../docs/manual.md?raw";

const DEFAULT_CATEGORY_ID = "idol";
const DEFAULT_FILTER_VALUE = "all";
const DEFAULT_LANE_SORT_MODE = "default";
const DEFAULT_VERTICAL_SCALE = 1;
const URL_SYNC_DELAY_MS = 150;
const initialViewState = parseTimelineViewState(window.location.search);

const occurrenceTypeLabels = {
  continuous: "期間",
  singleWithinRange: "期間内の1日",
};
const uncertaintyLabels = {
  confirmed: "確定",
  inferred: "推定",
  rangeOnly: "期間内の1日",
  conflicting: "出典矛盾",
  certain: "確定",
  uncertain: "不確定",
};

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
  isValidCategory,
  isValidLaneSortMode,
  allLaneIdsForCategory,
  selectedLaneIdsForCategory,
  setLaneSortMode,
  selectAllLanes,
  applyLaneVisibilityState,
  toggleLane,
  toggleAll
} = useCategoryFilter({
  idolCommu: idolCommuRef,
  hatsuboshiCommus: hatsuboshiRef,
  eventCommus: eventRef,
  supportCardCommus: supportRef
});

if (initialViewState.hasViewState) {
  if (isValidCategory(initialViewState.category)) {
    selectedCategory.value = initialViewState.category;
  }

  if (isValidLaneSortMode(initialViewState.laneSortMode)) {
    setLaneSortMode(selectedCategory.value, initialViewState.laneSortMode);
  }

  applyLaneVisibilityState(
    selectedCategory.value,
    initialViewState.laneSelection,
  );
}

const focusedLaneId = ref(null);
const timelineLanes = computed(() => {
  if (!focusedLaneId.value) return activeLanes.value;
  return activeLanes.value.filter((lane) => lane.id === focusedLaneId.value);
});
const focusedLaneLabel = computed(() => {
  if (!focusedLaneId.value) return "";
  return activeLanes.value.find((lane) => lane.id === focusedLaneId.value)?.name ?? "";
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
} = usePersistedSettings({
  initialShowCommonEvents: initialViewState.showCommonEvents,
});

const { allEvents, timesDay } = useTimelineData(
  timelineLanes,
  commonTimeline,
  showCommonEvents
);
const { selectedEvent, selectEvent, closePanel } = useSelection(allEvents);
const {
  eventSearchQuery,
  occurrenceTypeFilter,
  uncertaintyFilter,
  participantFilter,
  commuFilter,
  worldlineFilter,
  filteredEvents,
  navigationEvents,
  hasActiveEventFilters,
  participantOptions,
  commuOptions,
  worldlineOptions,
  resultSummary,
  isEventInFilteredSet,
  resetEventFilters,
  setEventFilters
} = useEventSearchFilter({
  allEvents,
  lanes: timelineLanes,
  characterCatalog,
  worldlines,
});

if (initialViewState.hasViewState) {
  setEventFilters(initialViewState.filters);
}

const {
  viewRange,
  timeBounds,
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
  setHorizontalRange,
  zoomHorizontallyBy,
  zoomVerticallyBy,
  zoomInHorizontal,
  zoomOutHorizontal,
  resetHorizontalZoom,
  zoomInVertical,
  zoomOutVertical,
  setVerticalScale,
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
  characters: timelineLanes,
  allEvents: filteredEvents,
  viewRange,
  verticalScale,
  width: WIDTH,
  leftLabelWidth: LEFT_LABEL_WIDTH,
  rightPadding: RIGHT_PADDING
});

const eventDetailContext = useEventDetailContext({
  selectedEvent,
  allEvents,
  visibleEvents,
  characterCatalog,
  worldlines,
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
  characters: timelineLanes.value,
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
      target.closest(".active-state-bar") ||
      target.closest(".zoom-panel") ||
      target.closest(".zoom-controls") ||
      target.closest(".intro-guide") ||
      target.closest(".lane-label") ||
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

function scrollLaneIntoView(laneIndex) {
  const stageElement = timelineStageRef.value;
  const lane = laneLayouts.value[laneIndex];
  if (!stageElement || !lane) return;

  const targetTop = Math.max(0, lane.laneTop - 72);
  stageElement.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}

function selectEventAndReveal(event) {
  selectEvent(event);
  nextTick(() => {
    scrollLaneIntoView(event.laneIndex);
  });
}

function navigationIndexForSelection() {
  if (!selectedEvent.value) return -1;
  const selectedCanonicalId = selectedEvent.value.canonicalId ?? selectedEvent.value.id;
  return navigationEvents.value.findIndex(
    (event) => (event.canonicalId ?? event.id) === selectedCanonicalId,
  );
}

function goToNavigationEvent(direction) {
  const events = navigationEvents.value;
  if (!events.length) return;

  const currentIndex = navigationIndexForSelection();
  const nextIndex =
    currentIndex === -1
      ? direction > 0 ? 0 : events.length - 1
      : (currentIndex + direction + events.length) % events.length;

  selectEventAndReveal(events[nextIndex]);
  closeMenu();
}

function goToPreviousEvent() {
  goToNavigationEvent(-1);
}

function goToNextEvent() {
  goToNavigationEvent(1);
}

function focusLane(laneId) {
  focusedLaneId.value = laneId;
  closeMenu();
  nextTick(() => {
    scrollLaneIntoView(0);
  });
}

function focusLaneFromEvent(event) {
  const lane = timelineLanes.value[event?.laneIndex];
  if (!lane) return;
  focusLane(lane.id);
}

function clearLaneFocus() {
  focusedLaneId.value = null;
}

useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  closePanel
});

const isCurrentCategoryEmpty = computed(() => laneOptions.value.length === 0);
const hasAnyLaneInCurrentCategory = computed(() => totalLaneCount.value > 0);
const selectedEventHiddenByFilters = computed(
  () =>
    Boolean(selectedEvent.value) &&
    hasActiveEventFilters.value &&
    !isEventInFilteredSet(selectedEvent.value),
);

const currentLaneIds = computed(() =>
  allLaneIdsForCategory(selectedCategory.value),
);
const currentSelectedLaneIds = computed(() =>
  selectedLaneIdsForCategory(selectedCategory.value),
);
const hasNonDefaultLaneSelection = computed(
  () => currentSelectedLaneIds.value.length !== currentLaneIds.value.length,
);
const hasNonDefaultHorizontalRange = computed(
  () =>
    Math.abs(viewRange.value.min - timeBounds.value.min) > 0.01 ||
    Math.abs(viewRange.value.max - timeBounds.value.max) > 0.01,
);

const timelineViewStateSnapshot = computed(() => ({
  category: selectedCategory.value,
  laneSortMode: laneSortMode.value,
  selectedLaneIds: currentSelectedLaneIds.value,
  allLaneIds: currentLaneIds.value,
  filters: {
    query: eventSearchQuery.value,
    occurrenceType: occurrenceTypeFilter.value,
    uncertainty: uncertaintyFilter.value,
    participant: participantFilter.value,
    commu: commuFilter.value,
    worldline: worldlineFilter.value,
  },
  range: viewRange.value,
  fullRange: timeBounds.value,
  verticalScale: verticalScale.value,
  focusedLaneId: focusedLaneId.value,
  showCommonEvents: showCommonEvents.value,
}));

function optionLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function currentCategoryLabel() {
  return optionLabel(categoryOptions, selectedCategory.value);
}

function activeChip(id, label, onClear) {
  return { id, label, onClear };
}

const activeStateChips = computed(() => {
  const chips = [];

  if (selectedCategory.value !== DEFAULT_CATEGORY_ID) {
    chips.push(
      activeChip("category", `カテゴリ: ${currentCategoryLabel()}`, () => {
        selectedCategory.value = DEFAULT_CATEGORY_ID;
      }),
    );
  }

  if (laneSortMode.value !== DEFAULT_LANE_SORT_MODE) {
    chips.push(
      activeChip(
        "lane-sort",
        `並び順: ${optionLabel(laneSortOptions, laneSortMode.value)}`,
        () => setLaneSortMode(selectedCategory.value, DEFAULT_LANE_SORT_MODE),
      ),
    );
  }

  if (hasNonDefaultLaneSelection.value) {
    chips.push(
      activeChip(
        "lanes",
        `表示レーン: ${currentSelectedLaneIds.value.length}/${currentLaneIds.value.length}`,
        () => selectAllLanes(selectedCategory.value),
      ),
    );
  }

  if (eventSearchQuery.value.trim()) {
    chips.push(
      activeChip("event-query", `検索: ${eventSearchQuery.value.trim()}`, () => {
        eventSearchQuery.value = "";
      }),
    );
  }

  if (occurrenceTypeFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "occurrence",
        `発生形式: ${occurrenceTypeLabels[occurrenceTypeFilter.value] ?? occurrenceTypeFilter.value}`,
        () => {
          occurrenceTypeFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (uncertaintyFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "uncertainty",
        `確度: ${uncertaintyLabels[uncertaintyFilter.value] ?? uncertaintyFilter.value}`,
        () => {
          uncertaintyFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (participantFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "participant",
        `参加者: ${optionLabel(participantOptions.value, participantFilter.value)}`,
        () => {
          participantFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (commuFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "commu",
        `コミュ: ${optionLabel(commuOptions.value, commuFilter.value)}`,
        () => {
          commuFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (worldlineFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "worldline",
        `世界線: ${optionLabel(worldlineOptions.value, worldlineFilter.value)}`,
        () => {
          worldlineFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (focusedLaneId.value) {
    chips.push(
      activeChip(
        "focus",
        `集中: ${focusedLaneLabel.value || focusedLaneId.value}`,
        clearLaneFocus,
      ),
    );
  }

  if (hasNonDefaultHorizontalRange.value) {
    chips.push(activeChip("range", "表示範囲", resetHorizontalZoom));
  }

  if (Math.abs(verticalScale.value - DEFAULT_VERTICAL_SCALE) > 0.01) {
    chips.push(activeChip("vertical-scale", "レーン密度", resetVerticalZoom));
  }

  if (!showCommonEvents.value) {
    chips.push(
      activeChip("common-events", "共通イベント非表示", () => {
        showCommonEvents.value = true;
      }),
    );
  }

  return chips;
});

const viewShareStatus = ref("");
let viewShareStatusTimer = null;
let viewStateUrlSyncTimer = null;
const shouldSyncViewStateUrl = ref(false);

function setViewShareStatus(message) {
  viewShareStatus.value = message;
  if (viewShareStatusTimer) {
    window.clearTimeout(viewShareStatusTimer);
  }
  viewShareStatusTimer = window.setTimeout(() => {
    viewShareStatus.value = "";
  }, 2400);
}

function viewStatePath({ includeCommonEvents = false } = {}) {
  return replaceTimelineViewStateInUrl(
    window.location,
    timelineViewStateSnapshot.value,
    { includeCommonEvents },
  );
}

function syncTimelineViewStateUrl() {
  if (!shouldSyncViewStateUrl.value) return;
  history.replaceState(null, "", viewStatePath());
}

async function copyViewStateUrl() {
  const url = new URL(
    viewStatePath({ includeCommonEvents: true }),
    window.location.origin,
  ).toString();

  try {
    await navigator.clipboard.writeText(url);
    setViewShareStatus("表示状態URLをコピーしました");
  } catch {
    setViewShareStatus("コピーできませんでした");
  }
}

function clearDisplayState() {
  categoryOptions.forEach((option) => {
    setLaneSortMode(option.id, DEFAULT_LANE_SORT_MODE);
    selectAllLanes(option.id);
  });
  selectedCategory.value = DEFAULT_CATEGORY_ID;
  resetEventFilters();
  clearLaneFocus();
  resetHorizontalZoom();
  resetVerticalZoom();
  showCommonEvents.value = true;
}

watch(activeLanes, (lanes) => {
  if (!focusedLaneId.value) return;
  if (!lanes.some((lane) => lane.id === focusedLaneId.value)) {
    clearLaneFocus();
  }
});

watch(
  timelineViewStateSnapshot,
  () => {
    if (!shouldSyncViewStateUrl.value) return;
    if (viewStateUrlSyncTimer) {
      window.clearTimeout(viewStateUrlSyncTimer);
    }
    viewStateUrlSyncTimer = window.setTimeout(
      syncTimelineViewStateUrl,
      URL_SYNC_DELAY_MS,
    );
  },
  { deep: true },
);

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

function selectedEventLaneId() {
  if (!selectedEvent.value) return null;
  return activeLanes.value[selectedEvent.value.laneIndex]?.id ?? null;
}

function restoreInitialLaneFocus() {
  const focusedLane = initialViewState.focusedLaneId;
  if (!focusedLane) return;
  if (!activeLanes.value.some((lane) => lane.id === focusedLane)) return;
  if (selectedEvent.value && selectedEventLaneId() !== focusedLane) return;

  focusedLaneId.value = focusedLane;
}

onMounted(async () => {
  window.addEventListener("keydown", handleGlobalEscape);
  window.addEventListener("click", handleGlobalClick);

  if (initialViewState.hasViewState) {
    restoreInitialLaneFocus();
    await nextTick();

    if (initialViewState.verticalScale) {
      setVerticalScale(initialViewState.verticalScale);
    }

    if (initialViewState.range) {
      setHorizontalRange(initialViewState.range.min, initialViewState.range.max);
    }
  }

  shouldSyncViewStateUrl.value = true;
  syncTimelineViewStateUrl();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalEscape);
  window.removeEventListener("click", handleGlobalClick);
  if (viewShareStatusTimer) {
    window.clearTimeout(viewShareStatusTimer);
  }
  if (viewStateUrlSyncTimer) {
    window.clearTimeout(viewStateUrlSyncTimer);
  }
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

    <section class="side-menu__section" aria-labelledby="menu-event-search-title">
      <div class="menu-section-header">
        <p id="menu-event-search-title" class="menu-section-title">イベント検索</p>
        <button
          class="menu-inline-button"
          type="button"
          :disabled="!hasActiveEventFilters"
          @click="resetEventFilters"
        >
          解除
        </button>
      </div>

      <label class="lane-search">
        <span class="lane-search__label">検索</span>
        <input
          v-model="eventSearchQuery"
          class="lane-search__input"
          type="search"
          aria-label="イベントを検索"
          aria-describedby="event-result-summary"
          title="イベントを検索"
          placeholder="タイトル・本文・参加者など"
        />
      </label>

      <div class="event-filter-grid">
        <label class="event-filter">
          <span class="lane-search__label">発生形式</span>
          <select
            v-model="occurrenceTypeFilter"
            class="lane-sort__select"
            aria-label="発生形式で絞り込む"
          >
            <option value="all">すべて</option>
            <option value="continuous">期間</option>
            <option value="singleWithinRange">期間内の1日</option>
          </select>
        </label>

        <label class="event-filter">
          <span class="lane-search__label">確度</span>
          <select
            v-model="uncertaintyFilter"
            class="lane-sort__select"
            aria-label="日付の確度で絞り込む"
          >
            <option value="all">すべて</option>
            <option value="confirmed">確定</option>
            <option value="inferred">推定</option>
            <option value="rangeOnly">期間内の1日</option>
            <option value="conflicting">出典矛盾</option>
          </select>
        </label>

        <label v-if="participantOptions.length" class="event-filter">
          <span class="lane-search__label">参加者</span>
          <select
            v-model="participantFilter"
            class="lane-sort__select"
            aria-label="参加者で絞り込む"
          >
            <option value="all">すべて</option>
            <option
              v-for="option in participantOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}（{{ option.count }}）
            </option>
          </select>
        </label>

        <label v-if="commuOptions.length" class="event-filter">
          <span class="lane-search__label">コミュ</span>
          <select
            v-model="commuFilter"
            class="lane-sort__select"
            aria-label="コミュで絞り込む"
          >
            <option value="all">すべて</option>
            <option
              v-for="option in commuOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}（{{ option.count }}）
            </option>
          </select>
        </label>

        <label v-if="worldlineOptions.length" class="event-filter">
          <span class="lane-search__label">世界線</span>
          <select
            v-model="worldlineFilter"
            class="lane-sort__select"
            aria-label="世界線で絞り込む"
          >
            <option value="all">すべて</option>
            <option
              v-for="option in worldlineOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}（{{ option.count }}）
            </option>
          </select>
        </label>
      </div>

      <div class="event-navigation">
        <p id="event-result-summary" class="lane-summary">
          {{ resultSummary.canonical }} / {{ resultSummary.total }} 件
        </p>
        <div class="event-navigation__buttons" role="group" aria-label="検索結果の移動">
          <button
            class="menu-inline-button"
            type="button"
            :disabled="navigationEvents.length === 0"
            @click="goToPreviousEvent"
          >
            前へ
          </button>
          <button
            class="menu-inline-button"
            type="button"
            :disabled="navigationEvents.length === 0"
            @click="goToNextEvent"
          >
            次へ
          </button>
        </div>
      </div>

      <div v-if="focusedLaneId" class="focus-status">
        <span>{{ focusedLaneLabel }} に集中表示中</span>
        <button class="menu-inline-button" type="button" @click="clearLaneFocus">
          全レーン
        </button>
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
        v-if="showIntroGuide && !activeStateChips.length"
        :menu-open="menuOpen"
        :manual-open="manualOpen"
        :on-dismiss="dismissIntroGuide"
        :on-open-lane-guide="openLaneGuide"
        :on-open-manual="openManualDialog"
      />

      <div
        v-if="activeStateChips.length"
        class="active-state-bar"
        :class="{ 'active-state-bar--panel-open': selectedEvent }"
        aria-label="有効な表示条件"
      >
        <div class="active-state-list">
          <button
            v-for="chip in activeStateChips"
            :key="chip.id"
            class="active-state-chip"
            type="button"
            :title="`${chip.label}を解除`"
            @click="chip.onClear"
          >
            <span>{{ chip.label }}</span>
            <span class="active-state-chip__close" aria-hidden="true">×</span>
          </button>
        </div>
        <div class="active-state-actions">
          <button
            class="active-state-action"
            type="button"
            title="現在の表示状態を共有URLとしてコピー"
            @click="copyViewStateUrl"
          >
            表示URL
          </button>
          <button
            class="active-state-action"
            type="button"
            title="選択中イベントを残して表示条件を解除"
            @click="clearDisplayState"
          >
            解除
          </button>
        </div>
        <p v-if="viewShareStatus" class="active-state-status" role="status">
          {{ viewShareStatus }}
        </p>
      </div>

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
              @select="selectEventAndReveal"
              @focus-lane="focusLane"
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
    :detail-context="eventDetailContext"
    :selected-event-hidden="selectedEventHiddenByFilters"
    :year-label="yearLabel"
    :close-panel="closePanel"
    :focus-event-lane="focusLaneFromEvent"
    :select-related-event="selectEventAndReveal"
  />
</template>
