import { describe, expect, it } from "vitest";
import {
  createTimelineViewStateParams,
  parseTimelineViewState,
  replaceTimelineViewStateInUrl,
} from "../src/utils/viewStateUrl";

function snapshot(overrides = {}) {
  return {
    category: "idol",
    laneSortMode: "default",
    selectedLaneIds: ["lane-a", "lane-b", "lane-c"],
    allLaneIds: ["lane-a", "lane-b", "lane-c"],
    filters: {
      query: "",
      occurrenceType: "all",
      uncertainty: "all",
      participant: "all",
      commu: "all",
      worldline: "all",
    },
    range: { min: 0, max: 100 },
    fullRange: { min: 0, max: 100 },
    verticalScale: 1,
    focusedLaneId: null,
    showCommonEvents: true,
    ...overrides,
  };
}

describe("timeline view state URL", () => {
  it("omits default state", () => {
    expect(createTimelineViewStateParams(snapshot()).toString()).toBe("");
  });

  it("serializes non-default view state as versioned query params", () => {
    const params = createTimelineViewStateParams(
      snapshot({
        category: "event",
        laneSortMode: "eventsDesc",
        selectedLaneIds: ["lane-a"],
        filters: {
          query: "咲季 屋上",
          occurrenceType: "singleWithinRange",
          uncertainty: "inferred",
          participant: "saki_hanami",
          commu: "lane-a",
          worldline: "idol_story",
        },
        range: { min: 1.234, max: 22.987 },
        verticalScale: 1.234,
        focusedLaneId: "lane-a",
      }),
    );

    expect(params.get("view")).toBe("1");
    expect(params.get("cat")).toBe("event");
    expect(params.get("sort")).toBe("eventsDesc");
    expect(params.get("lm")).toBe("include");
    expect(params.get("lanes")).toBe("lane-a");
    expect(params.get("q")).toBe("咲季 屋上");
    expect(params.get("occ")).toBe("singleWithinRange");
    expect(params.get("unc")).toBe("inferred");
    expect(params.get("part")).toBe("saki_hanami");
    expect(params.get("commu")).toBe("lane-a");
    expect(params.get("wl")).toBe("idol_story");
    expect(params.get("range")).toBe("1.23,22.99");
    expect(params.get("scale")).toBe("1.23");
    expect(params.get("focus")).toBe("lane-a");
  });

  it("uses exclude lane mode when it is shorter", () => {
    const params = createTimelineViewStateParams(
      snapshot({
        selectedLaneIds: ["lane-a", "lane-b"],
      }),
    );

    expect(params.get("lm")).toBe("exclude");
    expect(params.get("lanes")).toBe("lane-c");
  });

  it("parses malformed optional state without failing the whole view state", () => {
    const state = parseTimelineViewState(
      "?view=1&cat=event&lm=include&lanes=lane-a,lane-b&range=10,bad&scale=-1&common=0",
    );

    expect(state.hasViewState).toBe(true);
    expect(state.category).toBe("event");
    expect(state.laneSelection).toEqual({
      mode: "include",
      ids: ["lane-a", "lane-b"],
      hasExplicitEmptyList: false,
    });
    expect(state.range).toBeNull();
    expect(state.verticalScale).toBeNull();
    expect(state.showCommonEvents).toBe(false);
  });

  it("preserves canonical event params while replacing view-state params", () => {
    const url = replaceTimelineViewStateInUrl(
      {
        pathname: "/timeline/",
        search: "?event=canonical-a&view=1&q=old",
        hash: "",
      },
      snapshot({
        filters: {
          query: "new",
          occurrenceType: "all",
          uncertainty: "all",
          participant: "all",
          commu: "all",
          worldline: "all",
        },
      }),
    );

    expect(url).toBe("/timeline/?event=canonical-a&q=new&view=1");
  });

  it("adds common-event visibility only for explicit copied URLs", () => {
    expect(
      createTimelineViewStateParams(
        snapshot({ showCommonEvents: false }),
      ).has("common"),
    ).toBe(false);
    expect(
      createTimelineViewStateParams(snapshot({ showCommonEvents: false }), {
        includeCommonEvents: true,
      }).get("common"),
    ).toBe("0");
  });
});
