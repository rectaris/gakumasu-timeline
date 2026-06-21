import { computed } from "vue";
import {
  EVENT_BAR_HEIGHT,
  EVENT_SUB_LANE_SPACING,
  LANE_PADDING,
  MIN_LANE_HEIGHT,
  TOP_OFFSET,
} from "../utils/constants";
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
    const lanePadding = Math.max(6, LANE_PADDING * scale);
    const minLaneHeight = Math.max(40, MIN_LANE_HEIGHT * scale);

    return {
      eventBarHeight,
      rowHeight,
      lanePadding,
      minLaneHeight,
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
      crowdedSubLaneCount: verticalScale.value < 0.95 ? 3 : 4,
    }),
  );

  const laneLayouts = computed(() => {
    let currentTop = TOP_OFFSET;

    return characters.value.map((char, laneIndex) => {
      const laneData = laneEventLayouts.value[laneIndex];
      const subLaneCount = laneData?.subLaneCount ?? 1;
      const laneHeight = Math.max(
        layoutMetrics.value.minLaneHeight,
        subLaneCount * layoutMetrics.value.rowHeight +
          layoutMetrics.value.lanePadding * 2,
      );
      const laneTop = currentTop;
      const centerY = laneTop + laneHeight / 2;

      currentTop += laneHeight;

      return {
        laneIndex,
        laneTop,
        laneHeight,
        centerY,
        subLaneCount,
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
