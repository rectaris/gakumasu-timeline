import { describe, expect, it } from "vitest";
import {
  collectStoryGraphErrors,
  normalizeStoryGraphData,
} from "../src/data/storyGraphModel";
import { layoutStoryGraph } from "../src/utils/storyGraph";
import {
  createMixedStoryGraphFixture,
  createScaleStoryGraphFixture,
} from "./fixtures/storyGraphFixtures";

describe("story graph scale fixtures", () => {
  it.each([50, 100, 300])(
    "lays out %i deterministic nodes without losing sequence order",
    (nodeCount) => {
      const fixture = createScaleStoryGraphFixture(nodeCount);
      expect(collectStoryGraphErrors(fixture)).toEqual([]);
      const graph = normalizeStoryGraphData(fixture);
      const layout = layoutStoryGraph(graph.blocks, graph.edges);

      expect(layout.positions.size).toBe(nodeCount);
      expect(layout.edges).toHaveLength(graph.edges.length);
      expect(layout.width).toBeGreaterThan(0);
      expect(layout.height).toBeGreaterThan(0);
      graph.edges.forEach((edge) => {
        expect(layout.positions.get(edge.targetBlockId).y).toBeGreaterThan(
          layout.positions.get(edge.sourceBlockId).y,
        );
      });
    },
  );

  it("keeps mixed directions, parallel edges, and semantic cycles test-only", () => {
    const fixture = createMixedStoryGraphFixture();
    expect(fixture.dataset.status).toBe("test-only");
    expect(collectStoryGraphErrors(fixture)).toEqual([]);

    const graph = normalizeStoryGraphData(fixture);
    const layout = layoutStoryGraph(graph.blocks, graph.edges);
    expect(layout.edges).toHaveLength(graph.edges.length);
    expect(
      graph.edges.filter(
        (edge) =>
          edge.sourceBlockId === graph.blocks[0].id &&
          edge.targetBlockId === graph.blocks[1].id,
      ),
    ).toHaveLength(2);
  });
});
