export function buildLaneLayout(events) {
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

export function groupEventsByLane(events, laneCount) {
  const eventsByLane = Array.from({ length: laneCount }, () => []);

  events.forEach((event) => {
    if (!Number.isInteger(event.laneIndex)) return;
    if (event.laneIndex < 0 || event.laneIndex >= laneCount) return;
    eventsByLane[event.laneIndex].push(event);
  });

  return eventsByLane;
}

export function eventIntersectsRange(event, range) {
  return event.displayEndDay >= range.min && event.displayStartDay <= range.max;
}

export function clippedEventForRange(event, range) {
  return {
    ...event,
    renderStartDay: Math.max(event.displayStartDay, range.min),
    renderEndDay: Math.min(event.displayEndDay, range.max),
  };
}

export function visibleEventLayouts(laneEventLayouts, range) {
  const events = [];

  laneEventLayouts.forEach((lane) => {
    lane.events.forEach((event) => {
      if (eventIntersectsRange(event, range)) {
        events.push(clippedEventForRange(event, range));
      }
    });
  });

  return events;
}
