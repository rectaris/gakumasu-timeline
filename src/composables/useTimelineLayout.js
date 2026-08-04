import { computed } from "vue";
import {
  EVENT_BAR_HEIGHT,
  EVENT_SUB_LANE_SPACING,
  LANE_PADDING,
  LOW_DENSITY_SUMMARY_SCALE,
  MAX_DENSE_SUMMARY_SUB_LANE_CAPACITY,
  MAX_FULL_HD_SINGLE_LANE_HEIGHT,
  MAX_VERTICAL_SCALE,
  MIN_DENSE_SUMMARY_EVENT_COUNT,
  MIN_LANE_HEIGHT,
  MIN_VERTICAL_SCALE,
  STANDARD_DENSE_SUMMARY_SUB_LANE_CAPACITY,
  TOP_OFFSET,
} from "../utils/constants";
import { clamp } from "../utils/clamp";
import {
  buildLaneLayout,
  buildTimelineRenderMetrics,
  groupEventsByLane,
  summarizeDenseEventsForLane,
  visibleEventLayouts,
} from "../utils/timelineLayout.js";

export {
  buildLaneLayout,
  buildTimelineRenderMetrics,
  groupEventsByLane,
  summarizeDenseEventsForLane,
  visibleEventLayouts,
};

export function denseSummaryCapacityForScale(scale) {
  if (scale <= LOW_DENSITY_SUMMARY_SCALE) {
    return 1;
  }

  if (scale < 1) {
    return 2;
  }

  const expandedProgress = clamp(
    (scale - 1) / (MAX_VERTICAL_SCALE - 1),
    0,
    1,
  );

  return Math.floor(
    STANDARD_DENSE_SUMMARY_SUB_LANE_CAPACITY +
      (MAX_DENSE_SUMMARY_SUB_LANE_CAPACITY -
        STANDARD_DENSE_SUMMARY_SUB_LANE_CAPACITY) *
        expandedProgress,
  );
}

export function denseSummaryOptionsForScale(scale) {
  const visibleSubLaneCapacity = denseSummaryCapacityForScale(scale);

  return {
    crowdedSubLaneCount: visibleSubLaneCapacity + 1,
    minEvents: Math.max(
      MIN_DENSE_SUMMARY_EVENT_COUNT,
      visibleSubLaneCapacity + 1,
    ),
  };
}

export function useTimelineLayout({
  characters,
  allEvents,
  viewRange,
  verticalScale,
  selectedEvent = null,
  width,
  leftLabelWidth,
  rightPadding,
}) {
  const layoutMetrics = computed(() => {
    const scale = verticalScale.value;
    const eventBarHeight = EVENT_BAR_HEIGHT;
    const rowHeight = EVENT_SUB_LANE_SPACING;
    const lanePadding = LANE_PADDING;
    const compactDensityProgress = Math.min(
      1,
      Math.max(0, (scale - MIN_VERTICAL_SCALE) / (1 - MIN_VERTICAL_SCALE)),
    );
    const expandedDensityProgress = Math.min(
      1,
      Math.max(0, (scale - 1) / (MAX_VERTICAL_SCALE - 1)),
    );

    return {
      eventBarHeight,
      rowHeight,
      lanePadding,
      compactDensityProgress,
      expandedDensityProgress,
      maxLaneHeight: MAX_FULL_HD_SINGLE_LANE_HEIGHT,
    };
  });

  const eventsByLane = computed(() =>
    groupEventsByLane(allEvents.value, characters.value.length),
  );

  const laneEventLayouts = computed(() =>
    characters.value.map((char, laneIndex) => ({
      laneIndex,
      characterId: char.id,
      ...buildLaneLayout(eventsByLane.value[laneIndex] ?? []),
    })),
  );

  const viewportWidth = computed(() => width - leftLabelWidth - rightPadding);

  const visibleEvents = computed(() =>
    visibleEventLayouts(laneEventLayouts.value, viewRange.value, {
      enabled: true,
      viewportWidth: viewportWidth.value,
      selectedEvent: selectedEvent?.value ?? null,
      ...denseSummaryOptionsForScale(verticalScale.value),
    }),
  );

  const renderedSubLaneCounts = computed(() => {
    const counts = Array.from({ length: characters.value.length }, () => 1);

    visibleEvents.value.forEach((event) => {
      const laneIndex = event.laneIndex;
      if (!Number.isInteger(laneIndex)) return;
      if (laneIndex < 0 || laneIndex >= counts.length) return;

      counts[laneIndex] = Math.max(
        counts[laneIndex],
        (event.subLaneIndex ?? 0) + 1,
      );
    });

    return counts;
  });

  const laneLayouts = computed(() => {
    let currentTop = TOP_OFFSET;

    return characters.value.map((char, laneIndex) => {
      const laneData = laneEventLayouts.value[laneIndex];
      const subLaneCount = laneData?.subLaneCount ?? 1;
      const renderedSubLaneCount = renderedSubLaneCounts.value[laneIndex] ?? 1;
      const contentHeight =
        layoutMetrics.value.eventBarHeight +
        Math.max(0, renderedSubLaneCount - 1) *
          layoutMetrics.value.rowHeight +
        layoutMetrics.value.lanePadding * 2;
      const standardHeight = Math.max(MIN_LANE_HEIGHT, contentHeight);
      const compactHeight =
        contentHeight +
        (standardHeight - contentHeight) *
          layoutMetrics.value.compactDensityProgress;
      const laneHeight =
        compactHeight +
        Math.max(0, layoutMetrics.value.maxLaneHeight - standardHeight) *
          layoutMetrics.value.expandedDensityProgress;
      const laneTop = currentTop;
      const centerY = laneTop + laneHeight / 2;

      currentTop += laneHeight;

      return {
        laneIndex,
        laneTop,
        laneHeight,
        centerY,
        subLaneCount,
        renderedSubLaneCount,
      };
    });
  });

  const svgHeight = computed(() => {
    const lastLane = laneLayouts.value.at(-1);
    const contentHeight = lastLane
      ? lastLane.laneTop + lastLane.laneHeight
      : TOP_OFFSET;

    return contentHeight + 40;
  });

  const timelineViewport = computed(() => {
    const lastLane = laneLayouts.value.at(-1);
    const bottom = lastLane
      ? lastLane.laneTop + lastLane.laneHeight
      : TOP_OFFSET;
    const height = Math.max(0, bottom - TOP_OFFSET);

    return {
      x: leftLabelWidth,
      y: TOP_OFFSET,
      width: width - leftLabelWidth - rightPadding,
      height,
    };
  });

  function laneCenterY(laneIndex) {
    return laneLayouts.value[laneIndex]?.centerY ?? TOP_OFFSET;
  }

  function yPos(laneIndex, subLaneIndex = 0) {
    const lane = laneLayouts.value[laneIndex];
    if (!lane) return TOP_OFFSET;

    return (
      lane.laneTop +
      layoutMetrics.value.lanePadding +
      subLaneIndex * layoutMetrics.value.rowHeight +
      layoutMetrics.value.eventBarHeight / 2
    );
  }

  function xPos(time) {
    const { min, max } = viewRange.value;
    const viewportWidth = timelineViewport.value.width;

    if (max === min) {
      return leftLabelWidth + viewportWidth / 2;
    }

    return leftLabelWidth + ((time - min) / (max - min)) * viewportWidth;
  }

  return {
    laneEventLayouts,
    laneLayouts,
    svgHeight,
    timelineViewport,
    laneCenterY,
    yPos,
    visibleEvents,
    xPos,
    eventBarHeight: computed(() => layoutMetrics.value.eventBarHeight),
  };
}
