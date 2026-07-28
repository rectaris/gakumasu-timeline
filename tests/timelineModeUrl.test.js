import { describe, expect, it } from "vitest";
import {
  createNarrativeEventUrl,
  createStoryGraphSelectionUrl,
  createTimelineModeUrl,
  parseStoryGraphSelection,
  parseTimelineMode,
} from "../src/utils/timelineModeUrl";

const locationLike = {
  pathname: "/timeline/",
  search: "?mode=story-graph&node=block_example&utm_source=test",
  hash: "#note",
};

describe("timeline mode URL", () => {
  it("uses the narrative timeline for absent or invalid modes", () => {
    expect(parseTimelineMode("")).toBe("narrative");
    expect(parseTimelineMode("?mode=invalid")).toBe("narrative");
  });

  it("removes view-specific state when changing modes", () => {
    expect(createTimelineModeUrl(locationLike, "realworld")).toBe(
      "/timeline/?utm_source=test&mode=realworld#note",
    );
    expect(createTimelineModeUrl(locationLike, "narrative")).toBe(
      "/timeline/?utm_source=test#note",
    );
  });

  it("stores only one stable graph selection", () => {
    expect(
      createStoryGraphSelectionUrl(
        { ...locationLike, search: "?edge=edge_old&item=item_old" },
        { type: "node", id: "block_new" },
      ),
    ).toBe("/timeline/?mode=story-graph&node=block_new#note");
    expect(parseStoryGraphSelection("?edge=edge_new")).toEqual({
      type: "edge",
      id: "edge_new",
    });
  });

  it("creates a narrative event URL without carrying graph state", () => {
    expect(createNarrativeEventUrl(locationLike, "event_new")).toBe(
      "/timeline/?utm_source=test&event=event_new#note",
    );
  });
});
