import { ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  groupEventsByLane,
  useTimelineLayout,
  visibleEventLayouts,
} from "../src/composables/useTimelineLayout";

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

function layoutFor({ events, viewRange }) {
  return useTimelineLayout({
    characters: ref([
      { id: "lane-a", name: "Lane A" },
      { id: "lane-b", name: "Lane B" },
    ]),
    allEvents: ref(events),
    viewRange,
    verticalScale: ref(1),
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
});
