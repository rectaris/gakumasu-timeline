export const STORY_CATEGORY_META = {
  idol: { label: "アイドルコミュ", color: "#d94d62" },
  event: { label: "イベントコミュ", color: "#7a63c7" },
  support: { label: "サポートコミュ", color: "#d28b2f" },
  hatsuboshi: { label: "初星コミュ", color: "#2b8f8a" },
};

export const STORY_RELATION_LABELS = {
  before: "前後関係",
  continuation: "続き",
  reference: "参照",
  same_event: "同じ出来事",
  alternative: "代替",
  complement: "補完",
  contrast: "対比",
  other: "その他",
};

export const STORY_DIRECTION_LABELS = {
  undirected: "無方向",
  forward: "片方向",
  bidirectional: "双方向",
};

export const STORY_CONFIDENCE_LABELS = {
  confirmed: "確定",
  inferred: "推定",
  speculative: "仮説",
};

const NODE_WIDTH = 250;
const NODE_HEIGHT = 92;
const COLUMN_GAP = 74;
const ROW_GAP = 104;
const PADDING = 72;
const ISOLATED_GAP = 140;

function compareBlocks(a, b) {
  return (
    a.category.localeCompare(b.category, "en") ||
    a.title.localeCompare(b.title, "ja")
  );
}

export function filterStoryGraph(graph, filters = {}) {
  const query = String(filters.query ?? "").trim().toLocaleLowerCase("ja");
  const category = filters.category ?? "all";
  const character = filters.character ?? "all";
  const blocks = graph.blocks.filter((block) => {
    if (category !== "all" && block.category !== category) return false;
    if (
      character !== "all" &&
      !block.characters.some((item) => item.id === character)
    ) {
      return false;
    }
    if (!query) return true;
    const haystack = [
      block.title,
      block.label,
      ...block.seriesPath.map((series) => series.label),
      ...block.characters.map((item) => item.name),
      ...(block.aliases ?? []),
    ]
      .join(" ")
      .toLocaleLowerCase("ja");
    return haystack.includes(query);
  });
  const blockIds = new Set(blocks.map((block) => block.id));
  const edges = graph.edges.filter(
    (edge) =>
      blockIds.has(edge.sourceBlockId) && blockIds.has(edge.targetBlockId),
  );
  return { blocks, edges };
}

function assignSequenceRanks(blocks, sequenceEdges) {
  const blockIds = new Set(blocks.map((block) => block.id));
  const indegree = new Map(blocks.map((block) => [block.id, 0]));
  const outgoing = new Map(blocks.map((block) => [block.id, []]));
  const sequenceDegree = new Map(blocks.map((block) => [block.id, 0]));

  sequenceEdges.forEach((edge) => {
    if (!blockIds.has(edge.sourceBlockId) || !blockIds.has(edge.targetBlockId)) {
      return;
    }
    outgoing.get(edge.sourceBlockId).push(edge.targetBlockId);
    indegree.set(edge.targetBlockId, indegree.get(edge.targetBlockId) + 1);
    sequenceDegree.set(
      edge.sourceBlockId,
      sequenceDegree.get(edge.sourceBlockId) + 1,
    );
    sequenceDegree.set(
      edge.targetBlockId,
      sequenceDegree.get(edge.targetBlockId) + 1,
    );
  });

  const ranks = new Map();
  const queue = blocks
    .filter((block) => indegree.get(block.id) === 0)
    .sort(compareBlocks)
    .map((block) => block.id);
  queue.forEach((id) => ranks.set(id, 0));

  while (queue.length) {
    const sourceId = queue.shift();
    outgoing.get(sourceId).forEach((targetId) => {
      ranks.set(
        targetId,
        Math.max(ranks.get(targetId) ?? 0, (ranks.get(sourceId) ?? 0) + 1),
      );
      indegree.set(targetId, indegree.get(targetId) - 1);
      if (indegree.get(targetId) === 0) queue.push(targetId);
    });
  }

  return { ranks, sequenceDegree };
}

function edgeCurve(source, target, offset = 0) {
  const startX = source.x + NODE_WIDTH / 2;
  const startY = source.y + NODE_HEIGHT;
  const endX = target.x + NODE_WIDTH / 2;
  const endY = target.y;
  const bend = Math.max(42, Math.abs(endY - startY) * 0.42);
  return `M ${startX + offset} ${startY} C ${startX + offset} ${
    startY + bend
  }, ${endX + offset} ${endY - bend}, ${endX + offset} ${endY}`;
}

function semanticCurve(source, target, offset = 0) {
  const sourceX = source.x + NODE_WIDTH / 2;
  const sourceY = source.y + NODE_HEIGHT / 2;
  const targetX = target.x + NODE_WIDTH / 2;
  const targetY = target.y + NODE_HEIGHT / 2;
  const horizontal = Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);
  const curve = 72 + Math.abs(offset);

  if (horizontal) {
    const direction = targetX >= sourceX ? 1 : -1;
    const startX = sourceX + direction * NODE_WIDTH / 2;
    const endX = targetX - direction * NODE_WIDTH / 2;
    return `M ${startX} ${sourceY + offset} C ${
      startX + direction * curve
    } ${sourceY + offset}, ${endX - direction * curve} ${
      targetY + offset
    }, ${endX} ${targetY + offset}`;
  }

  const direction = targetY >= sourceY ? 1 : -1;
  const startY = sourceY + direction * NODE_HEIGHT / 2;
  const endY = targetY - direction * NODE_HEIGHT / 2;
  return `M ${sourceX + offset} ${startY} C ${sourceX + offset} ${
    startY + direction * curve
  }, ${targetX + offset} ${endY - direction * curve}, ${
    targetX + offset
  } ${endY}`;
}

export function layoutStoryGraph(blocks, edges) {
  const sequenceEdges = edges.filter((edge) => edge.kind === "sequence");
  const { ranks, sequenceDegree } = assignSequenceRanks(blocks, sequenceEdges);
  const ordered = blocks.filter((block) => sequenceDegree.get(block.id) > 0);
  const isolated = blocks
    .filter((block) => sequenceDegree.get(block.id) === 0)
    .sort(compareBlocks);
  const rows = new Map();
  ordered.forEach((block) => {
    const rank = ranks.get(block.id) ?? 0;
    if (!rows.has(rank)) rows.set(rank, []);
    rows.get(rank).push(block);
  });
  rows.forEach((row) => row.sort(compareBlocks));

  const maxRowSize = Math.max(1, ...[...rows.values()].map((row) => row.length));
  const orderedWidth =
    maxRowSize * NODE_WIDTH + Math.max(0, maxRowSize - 1) * COLUMN_GAP;
  const isolatedColumns = isolated.length ? Math.min(2, isolated.length) : 0;
  const isolatedWidth = isolatedColumns
    ? isolatedColumns * NODE_WIDTH + (isolatedColumns - 1) * COLUMN_GAP
    : 0;
  const positions = new Map();

  rows.forEach((row, rank) => {
    const rowWidth =
      row.length * NODE_WIDTH + Math.max(0, row.length - 1) * COLUMN_GAP;
    const startX = PADDING + (orderedWidth - rowWidth) / 2;
    row.forEach((block, index) => {
      positions.set(block.id, {
        x: startX + index * (NODE_WIDTH + COLUMN_GAP),
        y: PADDING + rank * (NODE_HEIGHT + ROW_GAP),
        rank,
        isolated: false,
      });
    });
  });

  const isolatedStartX = PADDING + orderedWidth + (isolated.length ? ISOLATED_GAP : 0);
  isolated.forEach((block, index) => {
    positions.set(block.id, {
      x: isolatedStartX + (index % isolatedColumns) * (NODE_WIDTH + COLUMN_GAP),
      y: PADDING + Math.floor(index / isolatedColumns) * (NODE_HEIGHT + 40),
      rank: null,
      isolated: true,
    });
  });

  const maxRank = Math.max(0, ...rows.keys());
  const orderedHeight =
    PADDING * 2 + NODE_HEIGHT + maxRank * (NODE_HEIGHT + ROW_GAP);
  const isolatedRows = isolatedColumns
    ? Math.ceil(isolated.length / isolatedColumns)
    : 0;
  const isolatedHeight =
    PADDING * 2 +
    Math.max(0, isolatedRows * NODE_HEIGHT + (isolatedRows - 1) * 40);
  const width = Math.max(
    720,
    PADDING * 2 + orderedWidth + (isolated.length ? ISOLATED_GAP + isolatedWidth : 0),
  );
  const height = Math.max(560, orderedHeight, isolatedHeight);

  const parallelCounts = new Map();
  const edgeLayouts = edges
    .map((edge) => {
      const source = positions.get(edge.sourceBlockId);
      const target = positions.get(edge.targetBlockId);
      if (!source || !target) return null;
      const endpointKey = [edge.sourceBlockId, edge.targetBlockId].sort().join("|");
      const parallelIndex = parallelCounts.get(endpointKey) ?? 0;
      parallelCounts.set(endpointKey, parallelIndex + 1);
      const offset = parallelIndex === 0 ? 0 : (parallelIndex % 2 ? 1 : -1) * 18;
      return {
        ...edge,
        path:
          edge.kind === "sequence"
            ? edgeCurve(source, target, offset)
            : semanticCurve(source, target, offset),
      };
    })
    .filter(Boolean);

  return {
    width,
    height,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT,
    positions,
    edges: edgeLayouts,
    isolatedCount: isolated.length,
  };
}
