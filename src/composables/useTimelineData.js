import { computed } from "vue";
import { DAYS_IN_MONTH } from "../utils/constants";
import { dayTimeValue, timeValue } from "../utils/time";

function normalizeEventTiming(event) {
  return {
    startTime: timeValue(event.start.year, event.start.month),
    endTime: timeValue(event.end.year, event.end.month),
    startTimeDay: dayTimeValue(
      event.start.year,
      event.start.month,
      event.start.day ?? 1,
    ),
    endTimeDay: dayTimeValue(event.end.year, event.end.month, event.end.day ?? 1),
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

export function useTimelineData(characters, commonTimeline = null) {
  const allEvents = computed(() => {
    const characterEvents = characters.value.flatMap((char, index) =>
      char.events.map((event) => {
        const canonicalId = event.id;

        return {
          ...event,
          canonicalId,
          instanceId: canonicalId,
          character: char.name,
          color: char.color,
          laneIndex: index,
          ...normalizeEventTiming(event),
          isCommon: false,
        };
      }),
    );

    const commonEvents =
      commonTimeline && commonTimeline.events
        ? characters.value.flatMap((char, laneIndex) =>
            commonTimeline.events.map((event) => {
              const canonicalId = event.id;
              const instanceId = `${canonicalId}__${char.id ?? laneIndex}`;

              return {
                ...event,
                canonicalId,
                instanceId,
                character: commonTimeline.name,
                color: commonTimeline.color,
                laneIndex,
                ...normalizeEventTiming(event),
                isCommon: true,
              };
            }),
          )
        : [];

    return [...characterEvents, ...commonEvents];
  });

  const times = computed(() => {
    const values = allEvents.value.flatMap((event) => [
      event.startTime,
      event.endTime,
    ]);
    return values.length ? values : [0];
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
    times,
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
