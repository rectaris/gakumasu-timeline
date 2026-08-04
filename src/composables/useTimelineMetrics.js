import { computed } from "vue";
import { buildTimelineRenderMetrics } from "../utils/timelineLayout.js";

export function useTimelineMetrics({
  enabled,
  lanes,
  allEvents,
  filteredEvents,
  laneEventLayouts,
  visibleEvents,
  viewRange,
  timelineViewport,
  selectedEventHidden,
}) {
  const timelineMetrics = computed(() => {
    if (!enabled.value) return null;

    return {
      ...buildTimelineRenderMetrics({
        lanes: lanes.value,
        allEvents: allEvents.value,
        filteredEvents: filteredEvents.value,
        laneEventLayouts: laneEventLayouts.value,
        visibleEvents: visibleEvents.value,
        range: viewRange.value,
        timelineViewport: timelineViewport.value,
      }),
      selectedEventHidden: Boolean(selectedEventHidden.value),
    };
  });

  return {
    timelineMetrics,
  };
}
