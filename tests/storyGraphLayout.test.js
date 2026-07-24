import { describe, expect, it } from "vitest";
import { storyGraph } from "../src/data/storyGraph";
import {
  filterStoryGraph,
  layoutStoryGraph,
} from "../src/utils/storyGraph";

describe("story graph layout", () => {
  it("places sequence targets below their sources", () => {
    const layout = layoutStoryGraph(storyGraph.blocks, storyGraph.edges);
    storyGraph.edges
      .filter((edge) => edge.kind === "sequence")
      .forEach((edge) => {
        expect(layout.positions.get(edge.targetBlockId).y).toBeGreaterThan(
          layout.positions.get(edge.sourceBlockId).y,
        );
      });
  });

  it("keeps blocks without sequence relations in the isolated area", () => {
    const layout = layoutStoryGraph(storyGraph.blocks, storyGraph.edges);

    expect(
      layout.positions.get(
        "block_20000000-0000-4000-8000-000000000008",
      ).isolated,
    ).toBe(true);
    expect(layout.isolatedCount).toBeGreaterThanOrEqual(3);
  });

  it("filters blocks and removes dangling visible edges", () => {
    const filtered = filterStoryGraph(storyGraph, { category: "support" });

    expect(filtered.blocks).toHaveLength(1);
    expect(filtered.edges).toHaveLength(0);
  });
});
