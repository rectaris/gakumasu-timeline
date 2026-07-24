<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
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
import { useTimelineMetrics } from "./composables/useTimelineMetrics";
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
import TimelineModeSwitcher from "./components/TimelineModeSwitcher.vue";
import { invertHexColor } from "./utils/colors";
import {
  EVENT_AUDIT_CATEGORY_LABELS,
  isSingleWithinRange,
} from "./utils/events";
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
const MAX_COMPARE_LANES = 4;
const TIMELINE_DEBUG_METRICS_STORAGE_KEY = "gakumasu:debug-metrics";
const initialViewState = parseTimelineViewState(window.location.search);
const WorldlineEditor = import.meta.env.DEV
  ? defineAsyncComponent(() => import("./components/WorldlineEditor.vue"))
  : null;
const isWorldlineEditorMode =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("editor") === "worldline";

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
const auditCategoryLabels = EVENT_AUDIT_CATEGORY_LABELS;

function isDebugFlagEnabled(value) {
  const normalized = String(value ?? "1").trim().toLowerCase();
  return ["", "1", "true", "yes", "on"].includes(normalized);
}

function readTimelineDebugMetricsSetting() {
  if (!import.meta.env.DEV) return false;

  const params = new URLSearchParams(window.location.search);
  if (params.has("debugMetrics")) {
    const enabled = isDebugFlagEnabled(params.get("debugMetrics"));
    try {
      window.localStorage.setItem(
        TIMELINE_DEBUG_METRICS_STORAGE_KEY,
        enabled ? "1" : "0",
      );
    } catch {
      // Ignore local developer storage failures.
    }
    return enabled;
  }

  try {
    return window.localStorage.getItem(TIMELINE_DEBUG_METRICS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const idolCommuRef = ref(idolCommu);
const hatsuboshiRef = ref(hatsuboshiCommus);
const eventRef = ref(eventCommus);
const supportRef = ref(supportCardCommus);
const timelineStageRef = ref(null);
const eventSearchInputRef = ref(null);
const menuButtonRef = ref(null);

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
const compareLaneIds = ref([]);
const compareStatus = ref("");
const selectedDenseSummary = ref(null);
let compareStatusTimer = null;

const validCompareLaneIds = computed(() => {
  const activeIds = new Set(activeLanes.value.map((lane) => lane.id));
  return compareLaneIds.value.filter((id) => activeIds.has(id));
});
const isComparisonMode = computed(() => validCompareLaneIds.value.length >= 2);
const timelineDisplayMode = computed(() => {
  if (focusedLaneId.value) return "focus";
  if (isComparisonMode.value) return "compare";
  return "all";
});
const timelineLanes = computed(() => {
  if (timelineDisplayMode.value === "focus") {
    return activeLanes.value.filter((lane) => lane.id === focusedLaneId.value);
  }

  if (timelineDisplayMode.value === "compare") {
    const pinned = new Set(validCompareLaneIds.value);
    return activeLanes.value.filter((lane) => pinned.has(lane.id));
  }

  return activeLanes.value;
});
const focusedLaneLabel = computed(() => {
  if (!focusedLaneId.value) return "";
  return activeLanes.value.find((lane) => lane.id === focusedLaneId.value)?.name ?? "";
});
const comparisonLaneLabels = computed(() => {
  const lanesById = new Map(activeLanes.value.map((lane) => [lane.id, lane]));
  return validCompareLaneIds.value
    .map((id) => lanesById.get(id)?.name ?? id)
    .filter(Boolean);
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
const { selectedEvent, selectEvent, closePanel } = useSelection(allEvents, {
  shouldPreserveMissingSelection(event) {
    const laneId = event?.laneId;
    if (!laneId) return false;

    const activeIds = new Set(activeLanes.value.map((lane) => lane.id));
    const displayIds = new Set(timelineLanes.value.map((lane) => lane.id));
    return activeIds.has(laneId) && !displayIds.has(laneId);
  },
});
const {
  eventSearchQuery,
  occurrenceTypeFilter,
  uncertaintyFilter,
  auditCategoryFilter,
  sourceFilter,
  participantFilter,
  commuFilter,
  worldlineFilter,
  filteredEvents,
  navigationEvents,
  hasActiveEventFilters,
  participantOptions,
  commuOptions,
  worldlineOptions,
  auditCategoryOptions,
  sourceOptions,
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
  viewportRatio,
  selectedEventRangeRatio,
  horizontalSpan,
  verticalScale,
  horizontalZoomLabel,
  verticalZoomLabel,
  horizontalPresetOptions,
  showMonthScale: spanShowMonthScale,
  showDayScale: spanShowDayScale,
  canZoomInHorizontal,
  canZoomOutHorizontal,
  canZoomInVertical,
  canZoomOutVertical,
  panHorizontally,
  panByViewportRatio,
  setHorizontalRange,
  setViewportCenterByRatio,
  revealSelectedEvent,
  zoomToPreset,
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
  laneEventLayouts,
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
  selectedEvent,
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
      target.closest(".dense-summary-popover") ||
      target.closest(".lane-label") ||
      target.closest(".event-group") ||
      target.closest(".event-summary-group"),
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

function setCompareStatus(message) {
  compareStatus.value = message;
  if (compareStatusTimer) {
    window.clearTimeout(compareStatusTimer);
  }
  compareStatusTimer = window.setTimeout(() => {
    compareStatus.value = "";
  }, 2400);
}

function isLanePinnedForComparison(laneId) {
  return compareLaneIds.value.includes(laneId);
}

function pinLaneForComparison(laneId) {
  if (!laneId || isLanePinnedForComparison(laneId)) return true;
  if (!activeLanes.value.some((lane) => lane.id === laneId)) return false;

  if (validCompareLaneIds.value.length >= MAX_COMPARE_LANES) {
    setCompareStatus(`比較できるレーンは${MAX_COMPARE_LANES}件までです`);
    return false;
  }

  focusedLaneId.value = null;
  compareLaneIds.value = [...compareLaneIds.value, laneId];
  return true;
}

function unpinLaneForComparison(laneId) {
  compareLaneIds.value = compareLaneIds.value.filter((id) => id !== laneId);
}

function toggleComparisonLane(laneId) {
  if (isLanePinnedForComparison(laneId)) {
    unpinLaneForComparison(laneId);
    return;
  }

  pinLaneForComparison(laneId);
}

function clearComparison() {
  compareLaneIds.value = [];
}

function compareEventLane(event) {
  const laneId = event?.laneId;
  if (!laneId) return;
  pinLaneForComparison(laneId);
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

function eventDomKey(event) {
  return String(event?.instanceId ?? event?.id ?? event?.canonicalId ?? "");
}

function displayLaneIndexForEvent(event) {
  if (!event) return null;
  if (event.laneId) {
    const laneIndex = timelineLanes.value.findIndex((lane) => lane.id === event.laneId);
    if (laneIndex !== -1) return laneIndex;
  }

  return Number.isInteger(event.laneIndex) ? event.laneIndex : null;
}

function focusTimelineEventElement(event) {
  const stageElement = timelineStageRef.value;
  const key = eventDomKey(event);
  if (!stageElement || !key) return;

  const eventElement = Array.from(
    stageElement.querySelectorAll("[data-event-key]"),
  ).find((element) => element.dataset.eventKey === key);

  eventElement?.focus({ preventScroll: true });
}

function selectEventAndReveal(event, { focusTimelineEvent = false } = {}) {
  selectedDenseSummary.value = null;
  selectEvent(event);
  nextTick(() => {
    const laneIndex = displayLaneIndexForEvent(event);
    if (laneIndex !== null) {
      scrollLaneIntoView(laneIndex);
    }
    if (focusTimelineEvent) {
      focusTimelineEventElement(event);
    }
  });
}

function denseSummaryLabel(summary) {
  if (!summary) return "";
  const count =
    summary.canonicalCount && summary.canonicalCount !== summary.eventCount
      ? `${summary.canonicalCount}/${summary.eventCount}件`
      : `${summary.eventCount}件`;
  return summary.summaryKind === "uncertain"
    ? `期間内の1日 ${count}`
    : `密集イベント ${count}`;
}

function denseSummaryMemberMeta(event) {
  const lane = activeLanes.value.find((item) => item.id === event.laneId) ??
    timelineLanes.value[event.laneIndex];
  return [lane?.name ?? event.character, event.isCommon ? "共通" : ""]
    .filter(Boolean)
    .join(" / ");
}

function selectDenseSummary(summary) {
  selectedDenseSummary.value = summary;
}

function closeDenseSummary() {
  selectedDenseSummary.value = null;
}

function zoomToDenseSummary(summary) {
  if (!summary) return;
  const padding = Math.max(2, (summary.displayEndDay - summary.displayStartDay) * 0.15);
  setHorizontalRange(summary.displayStartDay - padding, summary.displayEndDay + padding);
}

const canReturnToSelectedEvent = computed(() => Boolean(selectedEvent.value));

function returnToSelectedEvent({ focusTimelineEvent = false } = {}) {
  if (!selectedEvent.value) return;

  revealSelectedEvent();
  nextTick(() => {
    if (!selectedEvent.value) return;
    const laneIndex = displayLaneIndexForEvent(selectedEvent.value);
    if (laneIndex !== null) {
      scrollLaneIntoView(laneIndex);
    }
    if (focusTimelineEvent) {
      focusTimelineEventElement(selectedEvent.value);
    }
  });
}

function returnToSelectedEventFromKeyboard() {
  returnToSelectedEvent({ focusTimelineEvent: true });
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
  if (!events.length) return false;

  const currentIndex = navigationIndexForSelection();
  const nextIndex =
    currentIndex === -1
      ? direction > 0 ? 0 : events.length - 1
      : (currentIndex + direction + events.length) % events.length;

  selectEventAndReveal(events[nextIndex], { focusTimelineEvent: true });
  closeMenu();
  return true;
}

function goToPreviousEvent() {
  goToNavigationEvent(-1);
}

function goToNextEvent() {
  goToNavigationEvent(1);
}

function focusLane(laneId) {
  focusedLaneId.value = laneId;
  clearComparison();
  closeMenu();
  nextTick(() => {
    scrollLaneIntoView(0);
  });
}

function focusLaneFromEvent(event) {
  const lane = activeLanes.value.find((item) => item.id === event?.laneId) ??
    timelineLanes.value[event?.laneIndex];
  if (!lane) return;
  focusLane(lane.id);
}

function clearLaneFocus() {
  focusedLaneId.value = null;
}

function focusEventSearch() {
  closeManual();
  closeSettings();
  openMenu();
  nextTick(() => {
    eventSearchInputRef.value?.focus();
  });
}

function closeTopLayer() {
  if (selectedDenseSummary.value) {
    closeDenseSummary();
    return;
  }

  if (manualOpen.value) {
    closeManual();
    return;
  }

  if (settingsOpen.value) {
    closeSettings();
    return;
  }

  if (menuOpen.value) {
    closeMenu();
    nextTick(() => {
      menuButtonRef.value?.focus();
    });
    return;
  }

  closePanel();
}

useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  returnToSelectedEvent: returnToSelectedEventFromKeyboard,
  closeTopLayer,
  focusEventSearch,
  goToNextEvent,
  goToPreviousEvent
});

const isCurrentCategoryEmpty = computed(() => laneOptions.value.length === 0);
const hasAnyLaneInCurrentCategory = computed(() => totalLaneCount.value > 0);
const selectedEventVisibleInDisplay = computed(() => {
  if (!selectedEvent.value) return false;
  const selectedInstanceId = selectedEvent.value.instanceId ?? selectedEvent.value.id;
  return allEvents.value.some(
    (event) => (event.instanceId ?? event.id) === selectedInstanceId,
  );
});
const selectedEventHiddenByDisplayConditions = computed(
  () =>
    Boolean(selectedEvent.value) &&
    (!selectedEventVisibleInDisplay.value ||
      (hasActiveEventFilters.value && !isEventInFilteredSet(selectedEvent.value))),
);
const timelineMetricsDebugEnabled = ref(readTimelineDebugMetricsSetting());
const timelineMetricsEnabled = computed(
  () => import.meta.env.DEV && timelineMetricsDebugEnabled.value,
);
const { timelineMetrics } = useTimelineMetrics({
  enabled: timelineMetricsEnabled,
  lanes: timelineLanes,
  allEvents,
  filteredEvents,
  laneEventLayouts,
  visibleEvents,
  viewRange,
  timelineViewport,
  selectedEventHidden: selectedEventHiddenByDisplayConditions,
});
const timelineMetricsRows = computed(() => {
  const metrics = timelineMetrics.value;
  if (!metrics) return [];

  return [
    {
      label: "lanes",
      value: `${metrics.laneCount} / sub ${metrics.subLaneTotal} / max ${metrics.maxSubLaneCount}`,
    },
    {
      label: "events",
      value: `${metrics.totalEventInstances} inst / ${metrics.totalCanonicalEvents} canon`,
    },
    {
      label: "filtered",
      value: `${metrics.filteredEventInstances} inst / ${metrics.filteredCanonicalEvents} canon`,
    },
    {
      label: "visible",
      value: `${metrics.sourceVisibleEventInstances} src / ${metrics.sourceVisibleCanonicalEvents} canon`,
    },
    {
      label: "render",
      value: `${metrics.renderedItemCount} items / ${metrics.renderedEventInstances} events`,
    },
    {
      label: "summary",
      value: `${metrics.summaryItemCount} items / ${metrics.summaryMemberEventInstances} members / -${metrics.summaryReducedItemCount}`,
    },
    {
      label: "density",
      value: `${metrics.sourceVisibleEventsPerLane} src/lane / ${metrics.renderedItemsPerLane} item/lane`,
    },
    {
      label: "screen",
      value: `${metrics.sourceVisibleEventsPer100kPixels} src / ${metrics.renderedItemsPer100kPixels} item per 100kpx`,
    },
    {
      label: "selected",
      value: metrics.selectedEventHidden ? "hidden" : "visible/none",
    },
  ];
});

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
    auditCategory: auditCategoryFilter.value,
    sourceKey: sourceFilter.value,
    participant: participantFilter.value,
    commu: commuFilter.value,
    worldline: worldlineFilter.value,
  },
  range: viewRange.value,
  fullRange: timeBounds.value,
  verticalScale: verticalScale.value,
  focusedLaneId: focusedLaneId.value,
  compareLaneIds: validCompareLaneIds.value,
  showCommonEvents: showCommonEvents.value,
}));

function optionLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function laneQualityText(summary) {
  if (!summary?.issueCount) return "";

  return [
    summary.conflictCount ? `矛盾${summary.conflictCount}` : "",
    summary.missingSourceCount ? `出典なし${summary.missingSourceCount}` : "",
    summary.inferredCount ? `推定${summary.inferredCount}` : "",
    summary.rangeOnlyCount ? `期間内${summary.rangeOnlyCount}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
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

  if (auditCategoryFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "audit",
        `監査: ${auditCategoryLabels[auditCategoryFilter.value] ?? auditCategoryFilter.value}`,
        () => {
          auditCategoryFilter.value = DEFAULT_FILTER_VALUE;
        },
      ),
    );
  }

  if (sourceFilter.value !== DEFAULT_FILTER_VALUE) {
    chips.push(
      activeChip(
        "source",
        `出典: ${optionLabel(sourceOptions.value, sourceFilter.value)}`,
        () => {
          sourceFilter.value = DEFAULT_FILTER_VALUE;
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

  if (validCompareLaneIds.value.length === 1) {
    chips.push(
      activeChip(
        "compare-setup",
        `比較準備: ${comparisonLaneLabels.value[0]}`,
        clearComparison,
      ),
    );
  }

  if (isComparisonMode.value) {
    chips.push(
      activeChip(
        "compare",
        `比較: ${comparisonLaneLabels.value.join(" / ")}`,
        clearComparison,
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
  clearComparison();
  resetHorizontalZoom();
  resetVerticalZoom();
  showCommonEvents.value = true;
  closeDenseSummary();
}

function applySourceFilter(sourceKey) {
  if (!sourceKey) return;
  sourceFilter.value = sourceKey;
  openMenu();
}

watch(activeLanes, (lanes) => {
  if (!focusedLaneId.value) return;
  if (!lanes.some((lane) => lane.id === focusedLaneId.value)) {
    clearLaneFocus();
  }
});

watch(activeLanes, (lanes) => {
  const activeIds = new Set(lanes.map((lane) => lane.id));
  const nextIds = compareLaneIds.value.filter((id) => activeIds.has(id));
  if (nextIds.length !== compareLaneIds.value.length) {
    compareLaneIds.value = nextIds;
  }
});

watch(selectedCategory, () => {
  clearLaneFocus();
  clearComparison();
  closeDenseSummary();
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

watch(visibleEvents, (events) => {
  const summary = selectedDenseSummary.value;
  if (!summary) return;
  if (!events.some((event) => event.summaryId === summary.summaryId)) {
    closeDenseSummary();
  }
});

function handleGlobalClick(event) {
  if (shouldKeepPanelOpenFromClick(event.target)) return;

  if (selectedDenseSummary.value) {
    closeDenseSummary();
  }

  if (selectedEvent.value) {
    closePanel();
  }
}

function selectedEventLaneId() {
  if (!selectedEvent.value) return null;
  return selectedEvent.value.laneId ??
    activeLanes.value[selectedEvent.value.laneIndex]?.id ??
    null;
}

function restoreInitialLaneFocus() {
  const focusedLane = initialViewState.focusedLaneId;
  if (!focusedLane) return;
  if (!activeLanes.value.some((lane) => lane.id === focusedLane)) return;
  if (selectedEvent.value && selectedEventLaneId() !== focusedLane) return;

  focusedLaneId.value = focusedLane;
}

function restoreInitialComparison() {
  if (focusedLaneId.value) return;
  const requestedIds = initialViewState.compareLaneIds ?? [];
  if (!requestedIds.length) return;

  const activeIds = new Set(activeLanes.value.map((lane) => lane.id));
  compareLaneIds.value = requestedIds
    .filter((id) => activeIds.has(id))
    .slice(0, MAX_COMPARE_LANES);
}

onMounted(async () => {
  window.addEventListener("click", handleGlobalClick);

  if (initialViewState.hasViewState) {
    restoreInitialLaneFocus();
    restoreInitialComparison();
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
  window.removeEventListener("click", handleGlobalClick);
  if (viewShareStatusTimer) {
    window.clearTimeout(viewShareStatusTimer);
  }
  if (viewStateUrlSyncTimer) {
    window.clearTimeout(viewStateUrlSyncTimer);
  }
  if (compareStatusTimer) {
    window.clearTimeout(compareStatusTimer);
  }
});

</script>

<template>
  <WorldlineEditor v-if="isWorldlineEditorMode" />

  <template v-else>
  <header class="app-header">
    <div class="header-left">
      <button
        ref="menuButtonRef"
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
    <div class="header-right">
      <TimelineModeSwitcher />
      <a
        class="portal-link"
        href="https://rectaris.github.io/"
        aria-label="rectaris.github.ioへ移動"
        title="rectaris.github.ioへ移動"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
    </div>
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
        <div
          v-for="lane in laneOptions"
          :key="lane.key"
          class="menu-option menu-option--lane"
        >
          <label class="menu-option__main">
            <input
              type="checkbox"
              :checked="isLaneSelected(selectedCategory, lane.key)"
              @change="toggleLane(selectedCategory, lane.key)"
            />
            <span>{{ lane.label }}</span>
          </label>
          <span class="menu-option__meta">
            {{ lane.eventCount }}件
            <span
              v-if="laneQualityText(lane.qualitySummary)"
              class="menu-option__quality"
            >
              {{ laneQualityText(lane.qualitySummary) }}
            </span>
          </span>
          <button
            class="menu-inline-button menu-inline-button--compact"
            type="button"
            :disabled="!isLaneSelected(selectedCategory, lane.key)"
            :aria-pressed="isLanePinnedForComparison(lane.key) ? 'true' : 'false'"
            @click="toggleComparisonLane(lane.key)"
          >
            {{ isLanePinnedForComparison(lane.key) ? "比較中" : "比較" }}
          </button>
        </div>
      </template>
      <p v-if="compareStatus" class="lane-summary" role="status">
        {{ compareStatus }}
      </p>
      <div id="menu-empty-state" v-if="isCurrentCategoryEmpty" class="menu-empty">
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
          ref="eventSearchInputRef"
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

        <label v-if="auditCategoryOptions.length" class="event-filter">
          <span class="lane-search__label">監査</span>
          <select
            v-model="auditCategoryFilter"
            class="lane-sort__select"
            aria-label="証拠品質で絞り込む"
          >
            <option value="all">すべて</option>
            <option
              v-for="option in auditCategoryOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}（{{ option.count }}）
            </option>
          </select>
        </label>

        <label v-if="sourceOptions.length" class="event-filter">
          <span class="lane-search__label">出典</span>
          <select
            v-model="sourceFilter"
            class="lane-sort__select"
            aria-label="出典で絞り込む"
          >
            <option value="all">すべて</option>
            <option
              v-for="option in sourceOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}（{{ option.count }}）
            </option>
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
      <div v-if="validCompareLaneIds.length" class="focus-status">
        <span>
          {{ isComparisonMode ? "比較表示中" : "比較準備中" }}:
          {{ comparisonLaneLabels.join(" / ") }}
        </span>
        <button class="menu-inline-button" type="button" @click="clearComparison">
          解除
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
    :class="{ 'zoom-panel--detail-open': selectedEvent }"
    :horizontal-zoom-label="horizontalZoomLabel"
    :vertical-zoom-label="verticalZoomLabel"
    :viewport-ratio="viewportRatio"
    :selected-event-ratio="selectedEventRangeRatio"
    :horizontal-preset-options="horizontalPresetOptions"
    :can-zoom-in-horizontal="canZoomInHorizontal"
    :can-zoom-out-horizontal="canZoomOutHorizontal"
    :can-zoom-in-vertical="canZoomInVertical"
    :can-zoom-out-vertical="canZoomOutVertical"
    :can-return-to-selected-event="canReturnToSelectedEvent"
    :zoom-in-horizontal="zoomInHorizontal"
    :zoom-out-horizontal="zoomOutHorizontal"
    :reset-horizontal-zoom="resetHorizontalZoom"
    :set-viewport-center-by-ratio="setViewportCenterByRatio"
    :zoom-to-preset="zoomToPreset"
    :return-to-selected-event="returnToSelectedEvent"
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

      <div
        v-if="timelineMetrics"
        class="timeline-debug-metrics"
        aria-hidden="true"
      >
        <p class="timeline-debug-metrics__title">render metrics</p>
        <dl class="timeline-debug-metrics__list">
          <template
            v-for="row in timelineMetricsRows"
            :key="row.label"
          >
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </template>
        </dl>
      </div>

      <div
        v-if="selectedDenseSummary"
        class="dense-summary-popover"
        role="dialog"
        aria-label="密集イベント一覧"
      >
        <div class="dense-summary-popover__header">
          <span>{{ denseSummaryLabel(selectedDenseSummary) }}</span>
          <button
            class="menu-inline-button menu-inline-button--compact"
            type="button"
            @click="closeDenseSummary"
          >
            閉じる
          </button>
        </div>
        <div class="dense-summary-popover__actions">
          <button
            class="menu-inline-button"
            type="button"
            @click="zoomToDenseSummary(selectedDenseSummary)"
          >
            この範囲へ拡大
          </button>
        </div>
        <ul class="dense-summary-list">
          <li
            v-for="event in selectedDenseSummary.memberEvents"
            :key="event.instanceId ?? event.id"
          >
            <button
              class="dense-summary-event"
              type="button"
              @click="selectEventAndReveal(event, { focusTimelineEvent: true })"
            >
              <span class="dense-summary-event__title">{{ event.title }}</span>
              <span class="dense-summary-event__meta">{{ denseSummaryMemberMeta(event) }}</span>
            </button>
          </li>
        </ul>
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
              @select-summary="selectDenseSummary"
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
    :selected-event-hidden="selectedEventHiddenByDisplayConditions"
    :year-label="yearLabel"
    :close-panel="closePanel"
    :focus-event-lane="focusLaneFromEvent"
    :compare-event-lane="compareEventLane"
    :select-source-filter="applySourceFilter"
    :select-related-event="selectEventAndReveal"
  />
  </template>
</template>
