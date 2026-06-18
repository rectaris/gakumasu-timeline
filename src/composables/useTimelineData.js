import { computed } from "vue";
import {
  resolveColorDesign,
  resolveCommonEventColorDesign
} from "../utils/colorTokens";
import { DAYS_IN_MONTH } from "../utils/constants";
import { dayTimeValue } from "../utils/time";

function normalizeEventTiming(event) {
  return {
    displayStartDay: dayTimeValue(
      event.start.year,
      event.start.month,
      event.start.day ?? 1,
    ),
    displayEndDay: dayTimeValue(
      event.end.year,
      event.end.month,
      event.end.day ?? DAYS_IN_MONTH,
    ),
  };
}

function normalizeBaseEvent(event, fallbackId) {
  return {
    ...event,
    id: event.id || fallbackId,
    title: event.title || "(無題)",
    detail: event.detail || "",
  };
}

function buildEventInstance({
  event,
  fallbackId,
  character,
  color,
  colorSource,
  colorRoles,
  laneIndex,
  isCommon,
  instanceIdSuffix = "",
}) {
  const normalizedEvent = normalizeBaseEvent(event, fallbackId);
  const canonicalId = normalizedEvent.id;

  return {
    ...normalizedEvent,
    canonicalId,
    instanceId: `${canonicalId}${instanceIdSuffix}`,
    character,
    color,
    colorSource,
    colorRoles,
    laneIndex,
    ...normalizeEventTiming(normalizedEvent),
    isCommon,
  };
}

export function useTimelineData(
  characters,
  commonTimeline = null,
  showCommonEvents = null,
) {
  const allEvents = computed(() => {
    const laneColorDesigns = characters.value.map((char, index) => {
      const fallbackDesign = resolveColorDesign(char, {
        category: "lane",
        fallbackIndex: index,
      });

      return {
        colorSource: char.colorSource ?? fallbackDesign.colorSource,
        colorRoles: char.colorRoles ?? fallbackDesign.colorRoles,
      };
    });

    const characterEvents = characters.value.flatMap((char, index) => {
      const { colorSource, colorRoles } = laneColorDesigns[index];

      return char.events.map((event) =>
        buildEventInstance({
          event,
          fallbackId: `${char.id ?? index}_event_${event.title || "unknown"}`,
          character: char.name,
          color: colorSource.sourceColor ?? char.color,
          colorSource,
          colorRoles,
          laneIndex: index,
          isCommon: false,
        }),
      );
    });

    const commonColorDesigns = laneColorDesigns.map((design) =>
      resolveCommonEventColorDesign(commonTimeline, design.colorRoles),
    );

    const commonEvents =
      commonTimeline &&
      commonTimeline.events &&
      (showCommonEvents?.value ?? true)
        ? characters.value.flatMap((char, laneIndex) =>
            commonTimeline.events.map((event) => {
              const { colorSource, colorRoles } = commonColorDesigns[laneIndex];

              return buildEventInstance({
                event,
                fallbackId: `${commonTimeline.id ?? "common"}_event_${event.title || "unknown"}`,
                character: commonTimeline.name,
                color: colorSource.sourceColor ?? commonTimeline.color,
                colorSource,
                colorRoles,
                laneIndex,
                isCommon: true,
                instanceIdSuffix: `__${char.id ?? laneIndex}`,
              });
            }),
          )
        : [];

    return [...characterEvents, ...commonEvents];
  });

  const timesDay = computed(() =>
    allEvents.value.flatMap((event) => [
      event.displayStartDay,
      event.displayEndDay,
    ]),
  );

  return {
    allEvents,
    timesDay,
  };
}

export function filterVisibleEvents({
  events,
  viewRange,
  eventDisplayStart,
  eventDisplayEnd,
}) {
  const { min, max } = viewRange.value;
  return events.filter(
    (event) => eventDisplayEnd(event) >= min && eventDisplayStart(event) <= max,
  );
}
