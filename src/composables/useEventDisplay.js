export function useEventDisplay(isDayScale) {
  const eventDisplayStart = event =>
    isDayScale.value ? event.startTimeDay : event.startTime;

  const eventDisplayEnd = event =>
    isDayScale.value ? event.endTimeDay : event.endTime;

  return {
    eventDisplayStart,
    eventDisplayEnd
  };
}
