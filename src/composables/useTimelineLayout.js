import { computed } from "vue";
import { filterVisibleEvents } from "./useTimelineData";
import {
  EVENT_BAR_HEIGHT,
  EVENT_ROW_GAP,
  LANE_PADDING,
  MIN_LANE_HEIGHT,
  TOP_OFFSET,
} from "../utils/constants";

export function useTimelineLayout({
  characters,
  allEvents,
  viewRange,
  verticalScale,
  width,
  leftLabelWidth,
  rightPadding,
}) {
  const layoutMetrics = computed(() => {
    const scale = verticalScale.value;
    const eventBarHeight = Math.max(8, EVENT_BAR_HEIGHT * scale);
    const rowGap = Math.max(4, EVENT_ROW_GAP * scale);
    const rowHeight = eventBarHeight + rowGap;
    const lanePadding = Math.max(6, LANE_PADDING * scale);
    const minLaneHeight = Math.max(40, MIN_LANE_HEIGHT * scale);

    return {
      eventBarHeight,
      rowHeight,
      lanePadding,
      minLaneHeight,
    };
  });

  function buildLaneLayout(events) {
    const subLaneEndTimes = [];
    const eventsWithLane = events
      .slice()
      .sort((a, b) => a.displayStartDay - b.displayStartDay)
      .map((event) => {
        let subLaneIndex = subLaneEndTimes.findIndex(
          (laneEndTime) => laneEndTime < event.displayStartDay,
        );

        if (subLaneIndex === -1) {
          subLaneIndex = subLaneEndTimes.length;
          subLaneEndTimes.push(event.displayEndDay);
        } else {
          subLaneEndTimes[subLaneIndex] = event.displayEndDay;
        }

        return { ...event, subLaneIndex };
      });

    return {
      events: eventsWithLane,
      subLaneCount: Math.max(1, subLaneEndTimes.length),
    };
  }

  const laneEventLayouts = computed(() =>
    characters.value.map((char, laneIndex) => {
      const laneEvents = allEvents.value.filter(
        (event) => event.laneIndex === laneIndex,
      );

      return {
        laneIndex,
        characterId: char.id,
        ...buildLaneLayout(laneEvents),
      };
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

  const visibleEvents = computed(() =>
    filterVisibleEvents({
      events: laneEventLayouts.value.flatMap((lane) => lane.events),
      viewRange,
      eventDisplayStart: (event) => event.displayStartDay,
      eventDisplayEnd: (event) => event.displayEndDay,
    }).map((event) => ({
      ...event,
      displayStart: event.displayStartDay,
      displayEnd: event.displayEndDay,
    })),
  );

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
