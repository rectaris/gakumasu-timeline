import { describe, expect, it } from "vitest";
import rawStoryGraph from "../data/raw/story_events/unreviewed/pilot.json";
import {
  collectStoryGraphErrors,
  collectStoryReferenceErrors,
  normalizeStoryGraphData,
} from "../src/data/storyGraphModel";
import { createMixedStoryGraphFixture } from "./fixtures/storyGraphFixtures";

describe("story graph data model", () => {
  it("validates and derives titles from the series hierarchy", () => {
    expect(collectStoryGraphErrors(rawStoryGraph)).toEqual([]);

    const graph = normalizeStoryGraphData(rawStoryGraph);
    expect(
      graph.blockById.get(
        "block_20000000-0000-4000-8000-000000000002",
      ).title,
    ).toBe("花海咲季 親愛度 STEP1 第5話");
    expect(
      graph.blockById.get(
        "block_20000000-0000-4000-8000-000000000008",
      ).title,
    ).toBe("おでん、とおりま〜すッ！ 向き合うべきはおでん？");
  });

  it("rejects story data outside the publication lifecycle", () => {
    const data = structuredClone(rawStoryGraph);
    data.dataset.status = "pilot";

    expect(collectStoryGraphErrors(data)).toContain(
      "dataset.status: draft、unreviewed、approved、publishedのいずれかが必要です。",
    );
  });

  it("rejects unsupported direction and relation combinations", () => {
    const data = createMixedStoryGraphFixture();
    const referenceEdgeIndex = data.edges.findIndex(
      (edge) =>
        edge.kind === "semantic" &&
        edge.relationType === "reference" &&
        edge.direction === "bidirectional",
    );
    data.edges[referenceEdgeIndex].direction = "undirected";

    expect(collectStoryGraphErrors(data)).toContain(
      `edges[${referenceEdgeIndex}]: relationTypeとdirectionの組み合わせが不正です。`,
    );
  });

  it("rejects self edges", () => {
    const data = createMixedStoryGraphFixture();
    data.edges[0].targetBlockId = data.edges[0].sourceBlockId;

    expect(collectStoryGraphErrors(data)).toContain(
      "edges[0]: 自己エッジは登録できません。",
    );
  });

  it("rejects cycles in the sequence subgraph but allows semantic cycles", () => {
    const data = createMixedStoryGraphFixture();
    expect(collectStoryGraphErrors(data)).toEqual([]);
    data.edges.push({
      id: "edge_30000000-0000-4000-8000-000000000099",
      sourceBlockId: data.blocks[2].id,
      targetBlockId: data.blocks[0].id,
      kind: "sequence",
      direction: "forward",
      relationType: "before",
      origin: "authored",
      rationale: "循環検証用。",
      confidence: "confirmed",
    });

    expect(collectStoryGraphErrors(data)).toContain(
      "edges: sequence部分グラフが循環しています。",
    );
  });

  it("validates source-owned StoryReferences against canonical blocks", () => {
    const blockIds = new Set(rawStoryGraph.blocks.map((block) => block.id));
    const reference = {
      id: "ref_40000000-0000-4000-8000-000000000001",
      storyBlockId: rawStoryGraph.blocks[0].id,
      type: "source",
      order: 0,
    };

    expect(collectStoryReferenceErrors([reference], blockIds)).toEqual([]);
    expect(
      collectStoryReferenceErrors(
        [{ ...reference, storyBlockId: "block_20000000-0000-4000-8000-999999999999" }],
        blockIds,
      ),
    ).toContain(
      "storyReferences[0].storyBlockId: 参照先StoryBlockが存在しません。",
    );
  });
});
