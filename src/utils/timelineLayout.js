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

const DEFAULT_DENSE_SUMMARY_OPTIONS = Object.freeze({
  enabled: false,
  viewportWidth: 0,
  pixelGapThreshold: 18,
  minEvents: 4,
  crowdedSubLaneCount: 4,
  selectedEvent: null,
});

function eventKey(event) {
  return event?.instanceId ?? event?.id ?? event?.canonicalId;
}

function eventCanonicalKey(event) {
  return event?.canonicalId ?? event?.id;
}

function isSelectedEvent(event, selectedEvent) {
  if (!event || !selectedEvent) return false;
  if (event.instanceId && selectedEvent.instanceId) {
    return event.instanceId === selectedEvent.instanceId;
  }

  return eventCanonicalKey(event) === eventCanonicalKey(selectedEvent);
}

function eventSummaryKind(event) {
  return event.occurrenceType === "singleWithinRange" ? "uncertain" : "timed";
}

function eventPixelBounds(event, range, viewportWidth) {
  const span = range.max - range.min;
  if (!viewportWidth || span <= 0) {
    return {
      startPx: 0,
      endPx: 0,
    };
  }

  return {
    startPx: ((event.renderStartDay - range.min) / span) * viewportWidth,
    endPx: ((event.renderEndDay - range.min) / span) * viewportWidth,
  };
}

function canonicalCount(events) {
  return new Set(events.map(eventCanonicalKey).filter(Boolean)).size;
}

function makeSummaryEvent(events, laneIndex, kind) {
  const renderStartDay = Math.min(...events.map((event) => event.renderStartDay));
  const renderEndDay = Math.max(...events.map((event) => event.renderEndDay));
  const displayStartDay = Math.min(...events.map((event) => event.displayStartDay));
  const displayEndDay = Math.max(...events.map((event) => event.displayEndDay));
  const subLaneIndex = Math.min(...events.map((event) => event.subLaneIndex ?? 0));
  const keyParts = events.map(eventKey).filter(Boolean).join("|");

  return {
    isSummary: true,
    summaryKind: kind,
    summaryId: `summary:${laneIndex}:${kind}:${renderStartDay}:${renderEndDay}:${keyParts}`,
    laneIndex,
    subLaneIndex,
    displayStartDay,
    displayEndDay,
    renderStartDay,
    renderEndDay,
    memberEvents: events,
    eventCount: events.length,
    canonicalCount: canonicalCount(events),
    uncertainCount: events.filter((event) => event.occurrenceType === "singleWithinRange").length,
    timedCount: events.filter((event) => event.occurrenceType !== "singleWithinRange").length,
  };
}

export function summarizeDenseEventsForLane(events, range, options = {}) {
  const config = { ...DEFAULT_DENSE_SUMMARY_OPTIONS, ...options };
  if (!config.enabled || !events.length || config.viewportWidth <= 0) {
    return events;
  }

  const selectedEvent = config.selectedEvent ?? null;
  const selectedEvents = [];
  const candidates = events
    .filter((event) => {
      if (!isSelectedEvent(event, selectedEvent)) return true;
      selectedEvents.push(event);
      return false;
    })
    .map((event) => ({
      event,
      kind: eventSummaryKind(event),
      ...eventPixelBounds(event, range, config.viewportWidth),
    }))
    .sort(
      (a, b) =>
        a.event.laneIndex - b.event.laneIndex ||
        a.kind.localeCompare(b.kind) ||
        a.startPx - b.startPx ||
        a.endPx - b.endPx,
    );

  const output = [];
  let cluster = [];
  let clusterEndPx = -Infinity;
  let clusterKind = null;
  let clusterLaneIndex = null;

  function flushCluster() {
    if (!cluster.length) return;

    const clusterEvents = cluster.map((item) => item.event);
    const subLaneCount = new Set(
      clusterEvents.map((event) => event.subLaneIndex ?? 0),
    ).size;
    const shouldSummarize =
      clusterEvents.length >= config.minEvents ||
      (clusterEvents.length >= 2 && subLaneCount >= config.crowdedSubLaneCount);

    if (shouldSummarize) {
      output.push(makeSummaryEvent(clusterEvents, clusterLaneIndex, clusterKind));
    } else {
      output.push(...clusterEvents);
    }

    cluster = [];
    clusterEndPx = -Infinity;
    clusterKind = null;
    clusterLaneIndex = null;
  }

  candidates.forEach((item) => {
    const laneIndex = item.event.laneIndex;
    const startsNextCluster =
      cluster.length === 0 ||
      laneIndex !== clusterLaneIndex ||
      item.kind !== clusterKind ||
      item.startPx - clusterEndPx > config.pixelGapThreshold;

    if (startsNextCluster) {
      flushCluster();
      clusterLaneIndex = laneIndex;
      clusterKind = item.kind;
    }

    cluster.push(item);
    clusterEndPx = Math.max(clusterEndPx, item.endPx);
  });

  flushCluster();

  return [...output, ...selectedEvents].sort(
    (a, b) =>
      a.laneIndex - b.laneIndex ||
      (a.subLaneIndex ?? 0) - (b.subLaneIndex ?? 0) ||
      a.renderStartDay - b.renderStartDay ||
      a.renderEndDay - b.renderEndDay,
  );
}

export function visibleEventLayouts(laneEventLayouts, range, options = {}) {
  const events = [];

  laneEventLayouts.forEach((lane) => {
    const laneEvents = [];

    lane.events.forEach((event) => {
      if (eventIntersectsRange(event, range)) {
        laneEvents.push(clippedEventForRange(event, range));
      }
    });

    events.push(...summarizeDenseEventsForLane(laneEvents, range, options));
  });

  return events;
}

function uniqueCanonicalEventCount(events) {
  return new Set(events.map(eventCanonicalKey).filter(Boolean)).size;
}

function roundMetric(value, precision = 2) {
  if (!Number.isFinite(value)) return 0;

  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function sourceVisibleEvents(laneEventLayouts, range) {
  if (!range) return [];

  return laneEventLayouts.flatMap((lane) =>
    (lane.events ?? []).filter((event) => eventIntersectsRange(event, range)),
  );
}

export function buildTimelineRenderMetrics({
  lanes = [],
  allEvents = [],
  filteredEvents = [],
  laneEventLayouts = [],
  visibleEvents = [],
  range = null,
  timelineViewport = null,
} = {}) {
  const laneCount = lanes.length || laneEventLayouts.length;
  const sourceEvents = sourceVisibleEvents(laneEventLayouts, range);
  const summaryItems = visibleEvents.filter((event) => event.isSummary);
  const renderedEvents = visibleEvents.filter((event) => !event.isSummary);
  const summaryMemberEvents = summaryItems.flatMap(
    (summary) => summary.memberEvents ?? [],
  );
  const subLaneCounts = laneEventLayouts.map((lane) => lane.subLaneCount ?? 1);
  const subLaneTotal = subLaneCounts.reduce((total, count) => total + count, 0);
  const maxSubLaneCount = Math.max(0, ...subLaneCounts);
  const viewportPixels =
    (timelineViewport?.width ?? 0) * (timelineViewport?.height ?? 0);
  const pixelUnit = viewportPixels > 0 ? viewportPixels / 100000 : 0;

  return {
    laneCount,
    totalEventInstances: allEvents.length,
    totalCanonicalEvents: uniqueCanonicalEventCount(allEvents),
    filteredEventInstances: filteredEvents.length,
    filteredCanonicalEvents: uniqueCanonicalEventCount(filteredEvents),
    sourceVisibleEventInstances: sourceEvents.length,
    sourceVisibleCanonicalEvents: uniqueCanonicalEventCount(sourceEvents),
    renderedItemCount: visibleEvents.length,
    renderedEventInstances: renderedEvents.length,
    summaryItemCount: summaryItems.length,
    summaryMemberEventInstances: summaryMemberEvents.length,
    summaryMemberCanonicalEvents: uniqueCanonicalEventCount(summaryMemberEvents),
    summaryCompressionRatio: summaryItems.length
      ? roundMetric(summaryMemberEvents.length / summaryItems.length)
      : 0,
    summaryReducedItemCount: Math.max(
      0,
      summaryMemberEvents.length - summaryItems.length,
    ),
    subLaneTotal,
    maxSubLaneCount,
    averageSubLanesPerLane: laneCount
      ? roundMetric(subLaneTotal / laneCount)
      : 0,
    sourceVisibleEventsPerLane: laneCount
      ? roundMetric(sourceEvents.length / laneCount)
      : 0,
    renderedItemsPerLane: laneCount
      ? roundMetric(visibleEvents.length / laneCount)
      : 0,
    sourceVisibleEventsPer100kPixels: pixelUnit
      ? roundMetric(sourceEvents.length / pixelUnit)
      : 0,
    renderedItemsPer100kPixels: pixelUnit
      ? roundMetric(visibleEvents.length / pixelUnit)
      : 0,
    viewportPixels: roundMetric(viewportPixels, 0),
  };
}
