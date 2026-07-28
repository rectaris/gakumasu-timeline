function suffix(value) {
  return String(value).padStart(12, "0");
}

function blockId(index) {
  return `block_f1000000-0000-4000-8000-${suffix(index + 1)}`;
}

function edgeId(index) {
  return `edge_f2000000-0000-4000-8000-${suffix(index + 1)}`;
}

export function createScaleStoryGraphFixture(nodeCount, { layerWidth = 10 } = {}) {
  const seriesId = "series_f0000000-0000-4000-8000-000000000001";
  const blocks = Array.from({ length: nodeCount }, (_, index) => ({
    id: blockId(index),
    seriesId,
    label: `検証話${index + 1}`,
    episodeOrder: index + 1,
    episodeNumber: index + 1,
    characters: [],
  }));
  const edges = [];

  for (let index = layerWidth; index < nodeCount; index += 1) {
    edges.push({
      id: edgeId(edges.length),
      sourceBlockId: blockId(index - layerWidth),
      targetBlockId: blockId(index),
      kind: "sequence",
      direction: "forward",
      relationType: "before",
      origin: "generated",
    });
  }

  return {
    schemaVersion: 1,
    dataset: {
      id: `test-scale-${nodeCount}`,
      label: `${nodeCount}ノードのテスト専用fixture`,
      status: "test-only",
      description: "レイアウト規模評価専用であり、物語データではありません。",
    },
    series: [
      {
        id: seriesId,
        category: "event",
        kind: "event",
        label: "表示検証シリーズ",
        sequencePolicy: "episode_order",
      },
    ],
    blocks,
    edges,
  };
}

export function createMixedStoryGraphFixture() {
  const data = createScaleStoryGraphFixture(4, { layerWidth: 2 });
  data.dataset = {
    id: "test-mixed-graph",
    label: "混合グラフのテスト専用fixture",
    status: "test-only",
    description: "方向、並列エッジ、semantic循環の検証専用です。",
  };
  const nextEdge = (edge) => {
    data.edges.push({
      id: edgeId(data.edges.length),
      origin: "authored",
      rationale: "混合グラフ描画のテスト専用関係。",
      confidence: "speculative",
      ...edge,
    });
  };

  nextEdge({
    sourceBlockId: blockId(0),
    targetBlockId: blockId(1),
    kind: "semantic",
    direction: "undirected",
    relationType: "alternative",
    label: "無方向検証",
  });
  nextEdge({
    sourceBlockId: blockId(0),
    targetBlockId: blockId(1),
    kind: "semantic",
    direction: "bidirectional",
    relationType: "reference",
    label: "双方向検証",
  });
  nextEdge({
    sourceBlockId: blockId(0),
    targetBlockId: blockId(2),
    kind: "semantic",
    direction: "forward",
    relationType: "reference",
    label: "循環検証1",
  });
  nextEdge({
    sourceBlockId: blockId(2),
    targetBlockId: blockId(3),
    kind: "semantic",
    direction: "forward",
    relationType: "reference",
    label: "循環検証2",
  });
  nextEdge({
    sourceBlockId: blockId(3),
    targetBlockId: blockId(0),
    kind: "semantic",
    direction: "forward",
    relationType: "reference",
    label: "循環検証3",
  });

  return data;
}
