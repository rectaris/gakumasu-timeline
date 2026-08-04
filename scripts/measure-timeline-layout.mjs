import {
  buildLaneLayout,
  groupEventsByLane,
  visibleEventLayouts,
} from "../src/utils/timelineLayout.js";

const laneCount = Number(process.env.TIMELINE_MEASURE_LANES ?? 48);
const eventsPerLane = Number(process.env.TIMELINE_MEASURE_EVENTS_PER_LANE ?? 180);
const visibleMin = Number(process.env.TIMELINE_MEASURE_VIEW_MIN ?? 180);
const visibleMax = Number(process.env.TIMELINE_MEASURE_VIEW_MAX ?? 360);
const iterations = Number(process.env.TIMELINE_MEASURE_ITERATIONS ?? 20);

function syntheticEvents() {
  const events = [];

  for (let laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
    for (let index = 0; index < eventsPerLane; index += 1) {
      const start = (index * 7 + laneIndex * 3) % 720;
      const duration = 5 + ((index + laneIndex) % 45);
      const id = `lane-${laneIndex}-event-${index}`;

      events.push({
        id,
        canonicalId: id,
        instanceId: id,
        laneIndex,
        displayStartDay: start,
        displayEndDay: start + duration,
      });
    }
  }

  return events;
}

function measure(fn) {
  const start = performance.now();
  const result = fn();
  return {
    durationMs: performance.now() - start,
    result,
  };
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const allEvents = syntheticEvents();
const groupDurations = [];
const layoutDurations = [];
const visibleDurations = [];
let visibleCount = 0;
let subLaneTotal = 0;

for (let iteration = 0; iteration < iterations; iteration += 1) {
  const grouped = measure(() => groupEventsByLane(allEvents, laneCount));
  groupDurations.push(grouped.durationMs);

  const layouts = measure(() =>
    grouped.result.map((events, laneIndex) => ({
      laneIndex,
      ...buildLaneLayout(events),
    })),
  );
  layoutDurations.push(layouts.durationMs);
  subLaneTotal = layouts.result.reduce(
    (total, lane) => total + lane.subLaneCount,
    0,
  );

  const visible = measure(() =>
    visibleEventLayouts(layouts.result, {
      min: visibleMin,
      max: visibleMax,
    }),
  );
  visibleDurations.push(visible.durationMs);
  visibleCount = visible.result.length;
}

console.log(
  JSON.stringify(
    {
      lanes: laneCount,
      totalEvents: allEvents.length,
      visibleRange: { min: visibleMin, max: visibleMax },
      visibleEvents: visibleCount,
      subLaneTotal,
      iterations,
      medianMs: {
        groupEventsByLane: Number(median(groupDurations).toFixed(3)),
        buildLaneLayout: Number(median(layoutDurations).toFixed(3)),
        visibleEventLayouts: Number(median(visibleDurations).toFixed(3)),
      },
    },
    null,
    2,
  ),
);
