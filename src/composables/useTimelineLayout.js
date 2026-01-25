import { computed } from "vue";
import { filterVisibleEvents } from "./useTimelineData";
import {
  EVENT_BAR_HEIGHT,
  EVENT_ROW_HEIGHT,
  LANE_PADDING,
  MIN_LANE_HEIGHT,
  TOP_OFFSET
} from "../utils/constants";

export function useTimelineLayout({
  characters,
  allEvents,
  viewRange,
  isDayScale,
  eventDisplayStart,
  eventDisplayEnd,
  width,
  leftLabelWidth,
  rightPadding
}) {
  function buildLaneLayout(events) {
    const useDayScale = isDayScale.value;
    const subLaneEndTimes = [];
    const eventsWithLane = events
      .slice()
      .sort((a, b) =>
        (useDayScale ? a.startTimeDay : a.startTime) -
          (useDayScale ? b.startTimeDay : b.startTime)
      )
      .map(event => {
        const startTime = useDayScale
          ? event.startTimeDay
          : event.startTime;
        const endTime = useDayScale ? event.endTimeDay : event.endTime;
        let subLaneIndex = subLaneEndTimes.findIndex(
          laneEndTime => laneEndTime < startTime
        );

        if (subLaneIndex === -1) {
          subLaneIndex = subLaneEndTimes.length;
          subLaneEndTimes.push(endTime);
        } else {
          subLaneEndTimes[subLaneIndex] = endTime;
        }

        return { ...event, subLaneIndex };
      });

    return {
      events: eventsWithLane,
      subLaneCount: Math.max(1, subLaneEndTimes.length)
    };
  }

  const laneEventLayouts = computed(() => {
    return characters.value.map((char, laneIndex) => {
      const laneEvents = allEvents.value.filter(
        event => event.laneIndex === laneIndex
      );
      const layout = buildLaneLayout(laneEvents);

      return {
        laneIndex,
        characterId: char.id,
        ...layout
      };
    });
  });

  const laneLayouts = computed(() => {
    let currentTop = TOP_OFFSET;

    return characters.value.map((char, laneIndex) => {
      const laneData = laneEventLayouts.value[laneIndex];
      const subLaneCount = laneData?.subLaneCount ?? 1;
      const laneHeight = Math.max(
        MIN_LANE_HEIGHT,
        subLaneCount * EVENT_ROW_HEIGHT + LANE_PADDING * 2
      );
      const laneTop = currentTop;
      const centerY = laneTop + laneHeight / 2;

      currentTop += laneHeight;

      return {
        laneIndex,
        laneTop,
        laneHeight,
        centerY,
        subLaneCount
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
      height
    };
  });

  function laneCenterY(laneIndex) {
    return laneLayouts.value[laneIndex]?.centerY ?? TOP_OFFSET;
  }

  function eventY(event) {
    const lane = laneLayouts.value[event.laneIndex];
    if (!lane) return TOP_OFFSET;

    return (
      lane.laneTop +
      LANE_PADDING +
      event.subLaneIndex * EVENT_ROW_HEIGHT +
      EVENT_BAR_HEIGHT / 2
    );
  }

  const visibleEvents = computed(() =>
    filterVisibleEvents({
      events: laneEventLayouts.value.flatMap(lane => lane.events),
      viewRange,
      eventDisplayStart,
      eventDisplayEnd
    })
  );

  function xPos(time) {
    const { min, max } = viewRange.value;
    const viewportWidth = timelineViewport.value.width;

    return (
      leftLabelWidth + ((time - min) / (max - min)) * viewportWidth
    );
  }

  return {
    laneEventLayouts,
    laneLayouts,
    svgHeight,
    timelineViewport,
    laneCenterY,
    eventY,
    visibleEvents,
    xPos
  };
}
