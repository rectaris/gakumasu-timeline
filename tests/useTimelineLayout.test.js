import { ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  buildLaneLayout,
  denseSummaryCapacityForScale,
  denseSummaryOptionsForScale,
  groupEventsByLane,
  buildTimelineRenderMetrics,
  summarizeDenseEventsForLane,
  useTimelineLayout,
  visibleEventLayouts,
} from "../src/composables/useTimelineLayout";
import {
  EVENT_BAR_HEIGHT,
  EVENT_SUB_LANE_SPACING,
  LANE_PADDING,
  LOW_DENSITY_SUMMARY_SCALE,
  MIN_DENSE_SUMMARY_EVENT_COUNT,
  MIN_LANE_HEIGHT,
  MIN_SINGLE_EVENT_LANE_HEIGHT,
  MIN_VERTICAL_SCALE,
  STANDARD_DENSE_SUMMARY_SUB_LANE_CAPACITY,
} from "../src/utils/constants";

function event({
  id,
  laneIndex = 0,
  displayStartDay,
  displayEndDay,
  occurrenceType = "continuous",
}) {
  return {
    id,
    canonicalId: id,
    instanceId: id,
    laneIndex,
    displayStartDay,
    displayEndDay,
    occurrenceType,
  };
}

function layoutFor({ events, viewRange, verticalScale = ref(1) }) {
  return useTimelineLayout({
    characters: ref([
      { id: "lane-a", name: "Lane A" },
      { id: "lane-b", name: "Lane B" },
    ]),
    allEvents: ref(events),
    viewRange,
    verticalScale,
    width: 1100,
    leftLabelWidth: 170,
    rightPadding: 20,
  });
}

describe("useTimelineLayout", () => {
  it("groups events by lane in a single pass and ignores invalid lane indexes", () => {
    const events = [
      event({ id: "lane-0", laneIndex: 0, displayStartDay: 0, displayEndDay: 1 }),
      event({ id: "lane-1", laneIndex: 1, displayStartDay: 0, displayEndDay: 1 }),
      event({ id: "missing-lane", laneIndex: 3, displayStartDay: 0, displayEndDay: 1 }),
      event({ id: "bad-lane", laneIndex: -1, displayStartDay: 0, displayEndDay: 1 }),
    ];

    expect(groupEventsByLane(events, 2).map((lane) => lane.map((item) => item.id))).toEqual([
      ["lane-0"],
      ["lane-1"],
    ]);
  });

  it("clips visible event render bounds without including offscreen events", () => {
    const laneEventLayouts = [
      {
        events: [
          event({ id: "before", displayStartDay: 0, displayEndDay: 10 }),
          event({
            id: "single-range",
            displayStartDay: 20,
            displayEndDay: 40,
            occurrenceType: "singleWithinRange",
          }),
          event({ id: "after", displayStartDay: 50, displayEndDay: 60 }),
        ],
      },
    ];

    const visible = visibleEventLayouts(laneEventLayouts, { min: 30, max: 45 });

    expect(visible.map((item) => item.id)).toEqual(["single-range"]);
    expect(visible[0]).toMatchObject({
      occurrenceType: "singleWithinRange",
      renderStartDay: 30,
      renderEndDay: 40,
    });
  });

  it("keeps sub-lane placement stable when an overlapping event scrolls offscreen", () => {
    const viewRange = ref({ min: 45, max: 55 });
    const layout = layoutFor({
      viewRange,
      events: [
        event({ id: "early-overlap", displayStartDay: 0, displayEndDay: 50 }),
        event({ id: "later-event", displayStartDay: 40, displayEndDay: 60 }),
      ],
    });

    expect(
      layout.visibleEvents.value.find((item) => item.id === "later-event")?.subLaneIndex,
    ).toBe(1);

    viewRange.value = { min: 55, max: 65 };

    expect(layout.visibleEvents.value.map((item) => item.id)).toEqual(["later-event"]);
    expect(layout.visibleEvents.value[0]).toMatchObject({
      id: "later-event",
      subLaneIndex: 1,
      renderStartDay: 55,
      renderEndDay: 60,
    });
  });

  it("summarizes dense visible event clusters without creating canonical events", () => {
    const denseEvents = [0, 1, 2, 3].map((offset) =>
      event({
        id: `dense-${offset}`,
        displayStartDay: 10 + offset,
        displayEndDay: 11 + offset,
      }),
    );
    const visible = visibleEventLayouts(
      [{ events: denseEvents }],
      { min: 0, max: 100 },
      { enabled: true, viewportWidth: 120, minEvents: 4 },
    );

    expect(visible).toHaveLength(1);
    expect(visible[0]).toMatchObject({
      isSummary: true,
      summaryKind: "timed",
      eventCount: 4,
      canonicalCount: 4,
    });
    expect(visible[0].canonicalId).toBeUndefined();
    expect(visible[0].memberEvents.map((item) => item.id)).toEqual([
      "dense-0",
      "dense-1",
      "dense-2",
      "dense-3",
    ]);
  });

  it("keeps uncertain single-within-range summaries separate from timed summaries", () => {
    const denseEvents = [
      event({ id: "timed-a", displayStartDay: 10, displayEndDay: 11 }),
      event({ id: "timed-b", displayStartDay: 11, displayEndDay: 12 }),
      event({
        id: "uncertain-a",
        displayStartDay: 10,
        displayEndDay: 20,
        occurrenceType: "singleWithinRange",
      }),
      event({
        id: "uncertain-b",
        displayStartDay: 11,
        displayEndDay: 21,
        occurrenceType: "singleWithinRange",
      }),
    ];

    const visible = summarizeDenseEventsForLane(
      denseEvents.map((item) => ({
        ...item,
        renderStartDay: item.displayStartDay,
        renderEndDay: item.displayEndDay,
        subLaneIndex: 0,
      })),
      { min: 0, max: 100 },
      { enabled: true, viewportWidth: 120, minEvents: 2 },
    );

    expect(visible.map((item) => item.summaryKind)).toEqual([
      "timed",
      "uncertain",
    ]);
    expect(visible.map((item) => item.eventCount)).toEqual([2, 2]);
  });

  it("does not hide the selected event inside a dense summary", () => {
    const denseEvents = [0, 1, 2, 3].map((offset) =>
      event({
        id: `dense-${offset}`,
        displayStartDay: 10 + offset,
        displayEndDay: 11 + offset,
      }),
    );
    const visible = summarizeDenseEventsForLane(
      denseEvents.map((item, index) => ({
        ...item,
        renderStartDay: item.displayStartDay,
        renderEndDay: item.displayEndDay,
        subLaneIndex: index,
      })),
      { min: 0, max: 100 },
      {
        enabled: true,
        viewportWidth: 120,
        minEvents: 3,
        selectedEvent: denseEvents[0],
      },
    );

    expect(visible.some((item) => item.id === "dense-0")).toBe(true);
    expect(visible.find((item) => item.isSummary)?.memberEvents.map((item) => item.id)).toEqual([
      "dense-1",
      "dense-2",
      "dense-3",
    ]);
  });

  it("keeps event visual height and overlapping sub-lane spacing fixed while density changes lane spacing", () => {
    const verticalScale = ref(1);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [
        event({ id: "overlap-a", displayStartDay: 10, displayEndDay: 30 }),
        event({ id: "overlap-b", displayStartDay: 20, displayEndDay: 40 }),
      ],
    });
    const initialEventHeight = layout.eventBarHeight.value;
    const initialSubLaneGap = layout.yPos(0, 1) - layout.yPos(0, 0);
    const initialEventTopDistance =
      layout.yPos(0, 0) -
      layout.eventBarHeight.value / 2 -
      layout.laneLayouts.value[0].laneTop;
    const initialViewportHeight = layout.timelineViewport.value.height;

    expect(initialEventHeight).toBe(EVENT_BAR_HEIGHT);
    expect(initialSubLaneGap).toBe(EVENT_SUB_LANE_SPACING);
    expect(initialEventTopDistance).toBe(LANE_PADDING);
    expect(initialSubLaneGap - initialEventHeight).toBeGreaterThanOrEqual(10);

    verticalScale.value = MIN_VERTICAL_SCALE;

    expect(layout.eventBarHeight.value).toBe(initialEventHeight);
    expect(layout.yPos(0, 1) - layout.yPos(0, 0)).toBe(initialSubLaneGap);
    expect(
      layout.yPos(0, 0) -
        layout.eventBarHeight.value / 2 -
        layout.laneLayouts.value[0].laneTop,
    ).toBe(initialEventTopDistance);

    verticalScale.value = 2;

    expect(layout.eventBarHeight.value).toBe(initialEventHeight);
    expect(layout.yPos(0, 1) - layout.yPos(0, 0)).toBe(initialSubLaneGap);
    expect(
      layout.yPos(0, 0) -
        layout.eventBarHeight.value / 2 -
        layout.laneLayouts.value[0].laneTop,
    ).toBe(initialEventTopDistance);
    expect(layout.timelineViewport.value.height).toBeGreaterThan(initialViewportHeight);
  });

  it("uses one fixed event slot as the minimum single-event lane height", () => {
    const verticalScale = ref(MIN_VERTICAL_SCALE);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [event({ id: "single", displayStartDay: 10, displayEndDay: 30 })],
    });

    expect(layout.laneLayouts.value[0].laneHeight).toBe(
      MIN_SINGLE_EVENT_LANE_HEIGHT,
    );
    expect(layout.laneLayouts.value[0].laneHeight).toBe(
      EVENT_BAR_HEIGHT + LANE_PADDING * 2,
    );
    expect(
      layout.yPos(0, 0) -
        layout.eventBarHeight.value / 2 -
        layout.laneLayouts.value[0].laneTop,
    ).toBe(LANE_PADDING);
  });

  it("scales lane height continuously from minimum through standard density", () => {
    const verticalScale = ref(MIN_VERTICAL_SCALE);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [event({ id: "single", displayStartDay: 10, displayEndDay: 30 })],
    });

    const minimumHeight = layout.laneLayouts.value[0].laneHeight;
    verticalScale.value = 0.9;
    const lowHeight = layout.laneLayouts.value[0].laneHeight;
    verticalScale.value = 1;
    const standardHeight = layout.laneLayouts.value[0].laneHeight;
    verticalScale.value = 1.5;
    const expandedHeight = layout.laneLayouts.value[0].laneHeight;

    expect(minimumHeight).toBe(MIN_SINGLE_EVENT_LANE_HEIGHT);
    expect(lowHeight).toBeGreaterThan(minimumHeight);
    expect(standardHeight).toBeGreaterThan(lowHeight);
    expect(standardHeight).toBeCloseTo(MIN_LANE_HEIGHT);
    expect(expandedHeight).toBeGreaterThan(standardHeight);
  });

  it("shrinks lane height to rendered summaries at minimum density", () => {
    const verticalScale = ref(MIN_VERTICAL_SCALE);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [
        event({ id: "dense-a", displayStartDay: 10, displayEndDay: 40 }),
        event({ id: "dense-b", displayStartDay: 15, displayEndDay: 45 }),
        event({ id: "dense-c", displayStartDay: 20, displayEndDay: 50 }),
        event({ id: "dense-d", displayStartDay: 25, displayEndDay: 55 }),
      ],
    });

    expect(layout.laneEventLayouts.value[0].subLaneCount).toBe(4);
    expect(layout.visibleEvents.value).toHaveLength(1);
    expect(layout.visibleEvents.value[0]).toMatchObject({
      isSummary: true,
      subLaneIndex: 0,
    });
    expect(layout.laneLayouts.value[0]).toMatchObject({
      laneHeight: MIN_SINGLE_EVENT_LANE_HEIGHT,
      subLaneCount: 4,
      renderedSubLaneCount: 1,
    });
  });

  it("summarizes two-sub-lane clusters at low density so minimum lanes can use one event slot", () => {
    const verticalScale = ref(MIN_VERTICAL_SCALE);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [
        event({ id: "overlap-a", displayStartDay: 10, displayEndDay: 30 }),
        event({ id: "overlap-b", displayStartDay: 20, displayEndDay: 40 }),
      ],
    });

    expect(layout.visibleEvents.value).toHaveLength(1);
    expect(layout.visibleEvents.value[0]).toMatchObject({
      isSummary: true,
      eventCount: 2,
      subLaneIndex: 0,
    });
    expect(layout.laneLayouts.value[0]).toMatchObject({
      laneHeight: MIN_SINGLE_EVENT_LANE_HEIGHT,
      renderedSubLaneCount: 1,
    });
  });

  it("keeps two-sub-lane clusters separated above the low-density summary threshold", () => {
    const verticalScale = ref(LOW_DENSITY_SUMMARY_SCALE + 0.01);
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: [
        event({ id: "overlap-a", displayStartDay: 10, displayEndDay: 30 }),
        event({ id: "overlap-b", displayStartDay: 20, displayEndDay: 40 }),
      ],
    });

    expect(layout.visibleEvents.value.map((item) => item.id)).toEqual([
      "overlap-a",
      "overlap-b",
    ]);
    expect(layout.laneLayouts.value[0].renderedSubLaneCount).toBe(2);
    expect(layout.laneLayouts.value[0].laneHeight).toBeGreaterThan(
      EVENT_BAR_HEIGHT + LANE_PADDING * 2,
    );
    expect(layout.yPos(0, 1) - layout.yPos(0, 0)).toBe(
      EVENT_SUB_LANE_SPACING,
    );
  });

  it("increases dense summary capacity as lane density expands", () => {
    const highScale = 5.45;

    expect(denseSummaryCapacityForScale(MIN_VERTICAL_SCALE)).toBe(1);
    expect(denseSummaryCapacityForScale(LOW_DENSITY_SUMMARY_SCALE + 0.01)).toBe(
      2,
    );
    expect(denseSummaryCapacityForScale(1)).toBe(
      STANDARD_DENSE_SUMMARY_SUB_LANE_CAPACITY,
    );
    expect(denseSummaryCapacityForScale(highScale)).toBeGreaterThanOrEqual(6);
    expect(denseSummaryOptionsForScale(highScale).minEvents).toBeGreaterThan(6);
    expect(denseSummaryOptionsForScale(1).minEvents).toBe(
      MIN_DENSE_SUMMARY_EVENT_COUNT,
    );
  });

  it("renders six dense events individually when expanded lane density has room", () => {
    const verticalScale = ref(5.45);
    const denseEvents = [0, 1, 2, 3, 4, 5].map((index) =>
      event({
        id: `dense-${index}`,
        displayStartDay: 10,
        displayEndDay: 30,
      }),
    );
    const layout = layoutFor({
      viewRange: ref({ min: 0, max: 100 }),
      verticalScale,
      events: denseEvents,
    });

    expect(layout.visibleEvents.value.map((item) => item.id)).toEqual([
      "dense-0",
      "dense-1",
      "dense-2",
      "dense-3",
      "dense-4",
      "dense-5",
    ]);
    expect(layout.visibleEvents.value.some((item) => item.isSummary)).toBe(
      false,
    );
    expect(layout.laneLayouts.value[0].renderedSubLaneCount).toBe(6);
    expect(layout.laneLayouts.value[0].laneHeight).toBeGreaterThan(
      EVENT_BAR_HEIGHT + EVENT_SUB_LANE_SPACING * 5 + LANE_PADDING * 2,
    );
  });

  it("separates source-visible events from rendered summary items in metrics", () => {
    const denseEvents = [0, 1, 2, 3].map((offset) =>
      event({
        id: `dense-${offset}`,
        displayStartDay: 10 + offset,
        displayEndDay: 11 + offset,
      }),
    );
    const laneLayout = {
      laneIndex: 0,
      ...buildLaneLayout(denseEvents),
    };
    const visible = visibleEventLayouts(
      [laneLayout],
      { min: 0, max: 100 },
      { enabled: true, viewportWidth: 120, minEvents: 4 },
    );

    expect(
      buildTimelineRenderMetrics({
        lanes: [{ id: "lane-a" }],
        allEvents: denseEvents,
        filteredEvents: denseEvents,
        laneEventLayouts: [laneLayout],
        visibleEvents: visible,
        range: { min: 0, max: 100 },
        timelineViewport: { width: 120, height: 80 },
      }),
    ).toMatchObject({
      laneCount: 1,
      totalEventInstances: 4,
      totalCanonicalEvents: 4,
      sourceVisibleEventInstances: 4,
      renderedItemCount: 1,
      renderedEventInstances: 0,
      summaryItemCount: 1,
      summaryMemberEventInstances: 4,
      summaryCompressionRatio: 4,
      summaryReducedItemCount: 3,
      subLaneTotal: 2,
      maxSubLaneCount: 2,
    });
  });
});
