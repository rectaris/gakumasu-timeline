import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { useTimelineData } from "../src/composables/useTimelineData";
import { isSingleWithinRange } from "../src/utils/events";
import { dayTimeValue } from "../src/utils/time";

describe("useTimelineData", () => {
  it("normalizes event timing and ids for lane events", () => {
    const characters = ref([
      {
        id: "lane-a",
        name: "Lane A",
        color: "#ff0000",
        events: [
          {
            start: { year: 1, month: 4 },
            end: { year: 1, month: 5 },
            occurrenceType: "singleWithinRange",
          },
        ],
      },
    ]);

    const { allEvents, timesDay } = useTimelineData(characters);
    const [event] = allEvents.value;

    expect(event.id).toBe("lane-a_event_unknown");
    expect(event.canonicalId).toBe("lane-a_event_unknown");
    expect(event.instanceId).toBe("lane-a_event_unknown");
    expect(event.title).toBe("(無題)");
    expect(event.detail).toBe("");
    expect(event.displayStartDay).toBe(dayTimeValue(1, 4, 1));
    expect(event.displayEndDay).toBe(dayTimeValue(1, 5, 31));
    expect(isSingleWithinRange(event)).toBe(true);
    expect(event.color).toBe("#ff0000");
    expect(event.colorRoles.eventFill).toBe("#ff0000");
    expect(timesDay.value).toEqual([event.displayStartDay, event.displayEndDay]);
  });

  it("duplicates common events per lane while keeping canonical ids shared", () => {
    const characters = ref([
      {
        id: "lane-a",
        name: "Lane A",
        color: "#ff0000",
        events: [],
      },
      {
        id: "lane-b",
        name: "Lane B",
        color: "#00ff00",
        events: [],
      },
    ]);
    const showCommonEvents = ref(true);
    const commonTimeline = {
      id: "common",
      name: "Common",
      color: "#ffffff",
      events: [
        {
          id: "shared-event",
          start: { year: 2, month: 1, day: 3 },
          end: { year: 2, month: 1, day: 8 },
          title: "Shared event",
          detail: "Shared detail",
        },
      ],
    };

    const { allEvents } = useTimelineData(
      characters,
      commonTimeline,
      showCommonEvents,
    );

    expect(allEvents.value).toHaveLength(2);
    expect(allEvents.value.map((event) => event.canonicalId)).toEqual([
      "shared-event",
      "shared-event",
    ]);
    expect(allEvents.value.map((event) => event.instanceId)).toEqual([
      "shared-event__lane-a",
      "shared-event__lane-b",
    ]);
    expect(allEvents.value.map((event) => event.laneIndex)).toEqual([0, 1]);
    expect(allEvents.value.every((event) => event.isCommon)).toBe(true);
    expect(
      allEvents.value.every((event) =>
        event.colorRoles.eventFill.includes("--timeline-common-event-fill"),
      ),
    ).toBe(true);
  });

  it("omits common events when the display option is disabled", () => {
    const characters = ref([
      {
        id: "lane-a",
        name: "Lane A",
        color: "#ff0000",
        events: [],
      },
    ]);
    const showCommonEvents = ref(false);
    const commonTimeline = {
      id: "common",
      name: "Common",
      color: "#ffffff",
      events: [
        {
          id: "shared-event",
          start: { year: 2, month: 1, day: 3 },
          end: { year: 2, month: 1, day: 8 },
          title: "Shared event",
          detail: "Shared detail",
        },
      ],
    };

    const { allEvents } = useTimelineData(
      characters,
      commonTimeline,
      showCommonEvents,
    );

    expect(allEvents.value).toEqual([]);
  });
});
