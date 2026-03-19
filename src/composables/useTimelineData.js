import { computed } from "vue";
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
    laneIndex,
    ...normalizeEventTiming(normalizedEvent),
    isCommon,
  };
}

export function useTimelineData(characters, commonTimeline = null) {
  const allEvents = computed(() => {
    const characterEvents = characters.value.flatMap((char, index) =>
      char.events.map((event) =>
        buildEventInstance({
          event,
          fallbackId: `${char.id ?? index}_event_${event.title || "unknown"}`,
          character: char.name,
          color: char.color,
          laneIndex: index,
          isCommon: false,
        }),
      ),
    );

    const commonEvents =
      commonTimeline && commonTimeline.events
        ? characters.value.flatMap((char, laneIndex) =>
            commonTimeline.events.map((event) =>
              buildEventInstance({
                event,
                fallbackId: `${commonTimeline.id ?? "common"}_event_${event.title || "unknown"}`,
                character: commonTimeline.name,
                color: commonTimeline.color,
                laneIndex,
                isCommon: true,
                instanceIdSuffix: `__${char.id ?? laneIndex}`,
              }),
            ),
          )
        : [];

    return [...characterEvents, ...commonEvents];
  });

  const timesDay = computed(() => {
    const values = allEvents.value.flatMap((event) => [
      event.displayStartDay,
      event.displayEndDay,
    ]);
    return values.length ? values : [0];
  });

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
