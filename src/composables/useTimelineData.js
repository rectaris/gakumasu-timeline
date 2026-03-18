import { computed } from "vue";
import { dayTimeValue, timeValue } from "../utils/time";

export function useTimelineData(characters, commonTimeline = null) {
  const allEvents = computed(() => {
    // キャラクターごとのイベント
    const characterEvents = characters.value.flatMap((char, index) =>
      char.events.map((ev) => {
        const startTime = timeValue(ev.start.year, ev.start.month);
        const endTime = timeValue(ev.end.year, ev.end.month);
        const canonicalId = ev.id;

        return {
          ...ev,
          canonicalId,
          instanceId: canonicalId,
          character: char.name,
          color: char.color,
          laneIndex: index,
          startTime,
          endTime,
          startTimeDay: dayTimeValue(
            ev.start.year,
            ev.start.month,
            ev.start.day ?? 1,
          ),
          endTimeDay: dayTimeValue(ev.end.year, ev.end.month, ev.end.day ?? 1),
          isCommon: false,
        };
      }),
    );

    // 共通イベント（全レーンに展開）
    const commonEvents =
      commonTimeline && commonTimeline.events
        ? characters.value.flatMap((char, laneIndex) =>
            commonTimeline.events.map((ev) => {
              const startTime = timeValue(ev.start.year, ev.start.month);
              const endTime = timeValue(ev.end.year, ev.end.month);
              const canonicalId = ev.id;
              const instanceId = `${canonicalId}__${char.id ?? laneIndex}`;

              return {
                ...ev,
                canonicalId,
                instanceId,
                character: commonTimeline.name,
                color: commonTimeline.color,
                laneIndex,
                startTime,
                endTime,
                startTimeDay: dayTimeValue(
                  ev.start.year,
                  ev.start.month,
                  ev.start.day ?? 1,
                ),
                endTimeDay: dayTimeValue(
                  ev.end.year,
                  ev.end.month,
                  ev.end.day ?? 1,
                ),
                isCommon: true,
              };
            }),
          )
        : [];

    return [...characterEvents, ...commonEvents];
  });

  const times = computed(() => {
    const values = allEvents.value.flatMap((e) => [e.startTime, e.endTime]);
    return values.length ? values : [0];
  });

  const timesDay = computed(() => {
    const values = allEvents.value.flatMap((e) => [
      e.startTimeDay,
      e.endTimeDay,
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
