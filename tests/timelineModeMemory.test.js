import { describe, expect, it } from "vitest";
import { createTimelineModeMemory } from "../src/utils/timelineModeMemory";

describe("timeline mode memory", () => {
  it("restores the most recent URL owned by each mode", () => {
    const memory = createTimelineModeMemory();
    memory.remember("narrative", {
      pathname: "/timeline/",
      search: "?event=event-a&view=1",
      hash: "",
    });
    memory.remember("story-graph", {
      pathname: "/timeline/",
      search: "?mode=story-graph&node=block-a",
      hash: "#detail",
    });

    expect(
      memory.resolve("narrative", {
        pathname: "/timeline/",
        search: "?mode=realworld&item=item-a",
        hash: "",
      }),
    ).toBe("/timeline/?event=event-a&view=1");
    expect(
      memory.resolve("story-graph", {
        pathname: "/timeline/",
        search: "?mode=realworld",
        hash: "",
      }),
    ).toBe("/timeline/?mode=story-graph&node=block-a#detail");
  });

  it("falls back to a clean canonical URL for modes not yet visited", () => {
    const memory = createTimelineModeMemory();

    expect(
      memory.resolve("realworld", {
        pathname: "/timeline/",
        search: "?event=event-a&utm_source=test",
        hash: "",
      }),
    ).toBe("/timeline/?utm_source=test&mode=realworld");
  });
});
