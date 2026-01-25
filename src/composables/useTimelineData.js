import { computed } from "vue";
import { dayTimeValue, timeValue } from "../utils/time";

export function useTimelineData(characters) {
  const allEvents = computed(() => {
    return characters.value.flatMap((char, index) =>
      char.events.map(ev => {
        const startTime = timeValue(ev.start.year, ev.start.month);
        const endTime = timeValue(ev.end.year, ev.end.month);

        return {
          ...ev,
          character: char.name,
          color: char.color,
          laneIndex: index,
          startTime,
          endTime,
          startTimeDay: dayTimeValue(
            ev.start.year,
            ev.start.month,
            ev.start.day ?? 1
          ),
          endTimeDay: dayTimeValue(
            ev.end.year,
            ev.end.month,
            ev.end.day ?? 1
          )
        };
      })
    );
  });

  const times = computed(() => {
    const values = allEvents.value.flatMap(e => [e.startTime, e.endTime]);
    return values.length ? values : [0];
  });

  const timesDay = computed(() => {
    const values = allEvents.value.flatMap(e => [e.startTimeDay, e.endTimeDay]);
    return values.length ? values : [0];
  });

  return {
    allEvents,
    times,
    timesDay
  };
}

export function filterVisibleEvents({
  events,
  viewRange,
  eventDisplayStart,
  eventDisplayEnd
}) {
  const { min, max } = viewRange.value;
  return events.filter(
    event =>
      eventDisplayEnd(event) >= min &&
      eventDisplayStart(event) <= max
  );
}
