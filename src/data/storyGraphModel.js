export const STORY_CATEGORIES = ["idol", "event", "support", "hatsuboshi"];
export const STORY_EDGE_KINDS = ["sequence", "semantic"];
export const STORY_EDGE_DIRECTIONS = [
  "undirected",
  "forward",
  "bidirectional",
];
export const STORY_CONFIDENCE_VALUES = [
  "confirmed",
  "inferred",
  "speculative",
];
export const STORY_REFERENCE_TYPES = [
  "evidence",
  "source",
  "subject",
  "related",
];
export const STORY_DATASET_STATUSES = [
  "draft",
  "unreviewed",
  "approved",
  "published",
];

export const STORY_RELATION_DIRECTIONS = {
  before: ["forward"],
  continuation: ["forward"],
  reference: ["forward", "bidirectional"],
  same_event: ["undirected"],
  alternative: ["undirected"],
  complement: ["undirected"],
  contrast: ["undirected"],
  other: STORY_EDGE_DIRECTIONS,
};

const ID_PATTERN =
  /^(series|block|edge|ref)_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CHARACTER_ROLES = ["owner", "focus", "participant"];
const SERIES_KINDS = {
  idol: [
    "idol",
    "idol-commu-type",
    "affinity-step",
    "produce-activity",
    "produce-route",
    "p-idol",
  ],
  event: ["event"],
  support: ["support-card"],
  hatsuboshi: ["hatsuboshi-commu", "chapter"],
};
const SERIES_PARENT_KINDS = {
  idol: [null],
  "idol-commu-type": ["idol"],
  "affinity-step": ["idol-commu-type"],
  "produce-activity": ["idol-commu-type"],
  "produce-route": ["produce-activity"],
  "p-idol": ["idol-commu-type"],
  event: [null],
  "support-card": [null],
  "hatsuboshi-commu": [null],
  chapter: ["hatsuboshi-commu"],
};

const ROOT_KEYS = ["schemaVersion", "dataset", "series", "blocks", "edges"];
const DATASET_KEYS = ["id", "label", "status", "description"];
const SERIES_KEYS = [
  "id",
  "category",
  "kind",
  "label",
  "parentSeriesId",
  "externalIds",
  "aliases",
  "sequencePolicy",
];
const BLOCK_KEYS = [
  "id",
  "seriesId",
  "label",
  "episodeOrder",
  "episodeNumber",
  "characters",
  "externalIds",
  "aliases",
  "sourceNotes",
];
const EDGE_KEYS = [
  "id",
  "sourceBlockId",
  "targetBlockId",
  "kind",
  "direction",
  "relationType",
  "label",
  "origin",
  "rationale",
  "evidence",
  "confidence",
];
const REFERENCE_KEYS = [
  "id",
  "storyBlockId",
  "type",
  "label",
  "note",
  "order",
];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pushUnknownKeys(errors, value, allowedKeys, path) {
  if (!isRecord(value)) return;
  Object.keys(value)
    .filter((key) => !allowedKeys.includes(key))
    .forEach((key) => errors.push(`${path}.${key}: 未知のフィールドです。`));
}

function requireText(errors, value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}: 空でない文字列が必要です。`);
  }
}

function validateId(errors, value, prefix, path) {
  requireText(errors, value, path);
  if (typeof value === "string" && (!ID_PATTERN.test(value) || !value.startsWith(`${prefix}_`))) {
    errors.push(`${path}: ${prefix}_<小文字UUID>形式が必要です。`);
  }
}

function validateStringArray(errors, value, path) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push(`${path}: 文字列配列が必要です。`);
  }
}

function validateExternalIds(errors, value, path) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${path}: 配列が必要です。`);
    return;
  }

  const seen = new Set();
  value.forEach((externalId, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(externalId)) {
      errors.push(`${itemPath}: オブジェクトが必要です。`);
      return;
    }
    pushUnknownKeys(errors, externalId, ["system", "type", "value"], itemPath);
    ["system", "type", "value"].forEach((key) =>
      requireText(errors, externalId[key], `${itemPath}.${key}`),
    );
    const key = `${externalId.system}|${externalId.type}|${externalId.value}`;
    if (seen.has(key)) errors.push(`${itemPath}: 外部識別子が重複しています。`);
    seen.add(key);
  });
}

function validateSeries(errors, series, index) {
  const path = `series[${index}]`;
  if (!isRecord(series)) {
    errors.push(`${path}: オブジェクトが必要です。`);
    return;
  }

  pushUnknownKeys(errors, series, SERIES_KEYS, path);
  validateId(errors, series.id, "series", `${path}.id`);
  if (!STORY_CATEGORIES.includes(series.category)) {
    errors.push(`${path}.category: 未対応のカテゴリです。`);
  }
  if (!SERIES_KINDS[series.category]?.includes(series.kind)) {
    errors.push(`${path}.kind: カテゴリで許可されていない階層種別です。`);
  }
  requireText(errors, series.label, `${path}.label`);
  if (
    series.parentSeriesId !== undefined &&
    (typeof series.parentSeriesId !== "string" ||
      !series.parentSeriesId.startsWith("series_"))
  ) {
    errors.push(`${path}.parentSeriesId: StorySeries IDが必要です。`);
  }
  if (
    series.sequencePolicy !== undefined &&
    series.sequencePolicy !== "authored" &&
    series.sequencePolicy !== "episode_order"
  ) {
    errors.push(`${path}.sequencePolicy: authoredまたはepisode_orderが必要です。`);
  }
  if (series.aliases !== undefined) {
    validateStringArray(errors, series.aliases, `${path}.aliases`);
  }
  validateExternalIds(errors, series.externalIds, `${path}.externalIds`);
}

function validateCharacters(errors, value, path, requireOwner) {
  if (!Array.isArray(value)) {
    errors.push(`${path}: 配列が必要です。`);
    return;
  }

  const ids = new Set();
  let ownerCount = 0;
  value.forEach((character, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(character)) {
      errors.push(`${itemPath}: オブジェクトが必要です。`);
      return;
    }
    pushUnknownKeys(errors, character, ["id", "name", "roles"], itemPath);
    requireText(errors, character.id, `${itemPath}.id`);
    requireText(errors, character.name, `${itemPath}.name`);
    if (ids.has(character.id)) {
      errors.push(`${itemPath}.id: 同じ人物を複数回登録できません。`);
    }
    ids.add(character.id);
    if (
      !Array.isArray(character.roles) ||
      character.roles.length === 0 ||
      character.roles.some((role) => !CHARACTER_ROLES.includes(role)) ||
      new Set(character.roles).size !== character.roles.length
    ) {
      errors.push(`${itemPath}.roles: 重複のない有効な役割が必要です。`);
    }
    if (character.roles?.includes("owner")) ownerCount += 1;
  });

  if (requireOwner && ownerCount !== 1) {
    errors.push(`${path}: アイドルコミュにはownerが1人必要です。`);
  }
}

function validateBlock(errors, block, index, seriesById) {
  const path = `blocks[${index}]`;
  if (!isRecord(block)) {
    errors.push(`${path}: オブジェクトが必要です。`);
    return;
  }

  pushUnknownKeys(errors, block, BLOCK_KEYS, path);
  validateId(errors, block.id, "block", `${path}.id`);
  requireText(errors, block.seriesId, `${path}.seriesId`);
  requireText(errors, block.label, `${path}.label`);
  if (
    block.episodeOrder !== undefined &&
    (!Number.isInteger(block.episodeOrder) || block.episodeOrder < 0)
  ) {
    errors.push(`${path}.episodeOrder: 0以上の整数が必要です。`);
  }
  if (
    block.episodeNumber !== undefined &&
    (!Number.isInteger(block.episodeNumber) || block.episodeNumber < 0)
  ) {
    errors.push(`${path}.episodeNumber: 0以上の整数が必要です。`);
  }
  if (block.aliases !== undefined) {
    validateStringArray(errors, block.aliases, `${path}.aliases`);
  }
  validateExternalIds(errors, block.externalIds, `${path}.externalIds`);

  const series = seriesById.get(block.seriesId);
  if (!series) {
    errors.push(`${path}.seriesId: 参照先StorySeriesが存在しません。`);
  }
  validateCharacters(
    errors,
    block.characters,
    `${path}.characters`,
    series?.category === "idol",
  );
}

function normalizedEdgeKey(edge) {
  let source = edge.sourceBlockId;
  let target = edge.targetBlockId;
  if (edge.direction !== "forward" && source > target) {
    [source, target] = [target, source];
  }
  return [edge.kind, edge.direction, edge.relationType, source, target].join("|");
}

function validateEdge(errors, edge, index, blockIds, seriesById, blockById) {
  const path = `edges[${index}]`;
  if (!isRecord(edge)) {
    errors.push(`${path}: オブジェクトが必要です。`);
    return;
  }

  pushUnknownKeys(errors, edge, EDGE_KEYS, path);
  validateId(errors, edge.id, "edge", `${path}.id`);
  validateId(errors, edge.sourceBlockId, "block", `${path}.sourceBlockId`);
  validateId(errors, edge.targetBlockId, "block", `${path}.targetBlockId`);
  if (!blockIds.has(edge.sourceBlockId)) {
    errors.push(`${path}.sourceBlockId: 参照先StoryBlockが存在しません。`);
  }
  if (!blockIds.has(edge.targetBlockId)) {
    errors.push(`${path}.targetBlockId: 参照先StoryBlockが存在しません。`);
  }
  if (edge.sourceBlockId === edge.targetBlockId) {
    errors.push(`${path}: 自己エッジは登録できません。`);
  }
  if (!STORY_EDGE_KINDS.includes(edge.kind)) {
    errors.push(`${path}.kind: sequenceまたはsemanticが必要です。`);
  }
  if (!STORY_EDGE_DIRECTIONS.includes(edge.direction)) {
    errors.push(`${path}.direction: 未対応の方向です。`);
  }
  const directions = STORY_RELATION_DIRECTIONS[edge.relationType];
  if (!directions || !directions.includes(edge.direction)) {
    errors.push(`${path}: relationTypeとdirectionの組み合わせが不正です。`);
  }
  if (edge.kind === "sequence" && edge.relationType !== "before") {
    errors.push(`${path}.relationType: sequenceではbeforeだけを使用できます。`);
  }
  if (edge.kind === "semantic" && edge.relationType === "before") {
    errors.push(`${path}.relationType: semanticではbeforeを使用できません。`);
  }
  if (edge.relationType === "other") {
    requireText(errors, edge.label, `${path}.label`);
  }
  if (edge.origin !== "authored" && edge.origin !== "generated") {
    errors.push(`${path}.origin: authoredまたはgeneratedが必要です。`);
  }
  if (edge.origin === "generated") {
    const sourceBlock = blockById.get(edge.sourceBlockId);
    const targetBlock = blockById.get(edge.targetBlockId);
    const sourceSeries = seriesById.get(sourceBlock?.seriesId);
    if (
      edge.kind !== "sequence" ||
      sourceBlock?.seriesId !== targetBlock?.seriesId ||
      sourceSeries?.sequencePolicy !== "episode_order"
    ) {
      errors.push(`${path}: generatedはepisode_order系列内のsequenceだけに使用できます。`);
    }
  } else if (
    (typeof edge.rationale !== "string" || !edge.rationale.trim()) &&
    (!Array.isArray(edge.evidence) || edge.evidence.length === 0)
  ) {
    errors.push(`${path}: authoredエッジにはrationaleまたはevidenceが必要です。`);
  }
  if (edge.kind === "semantic" || edge.origin === "authored") {
    if (!STORY_CONFIDENCE_VALUES.includes(edge.confidence)) {
      errors.push(`${path}.confidence: 有効な確度が必要です。`);
    }
  }
  if (edge.evidence !== undefined) {
    validateStringArray(errors, edge.evidence, `${path}.evidence`);
  }
}

function detectSeriesCycles(errors, seriesById) {
  seriesById.forEach((series) => {
    const seen = new Set();
    let current = series;
    while (current?.parentSeriesId) {
      if (seen.has(current.id)) {
        errors.push(`${series.id}: StorySeries階層が循環しています。`);
        return;
      }
      seen.add(current.id);
      current = seriesById.get(current.parentSeriesId);
    }
  });
}

function detectSequenceCycle(errors, blocks, edges) {
  const indegree = new Map(blocks.map((block) => [block.id, 0]));
  const outgoing = new Map(blocks.map((block) => [block.id, []]));
  edges
    .filter((edge) => edge.kind === "sequence")
    .forEach((edge) => {
      if (!outgoing.has(edge.sourceBlockId) || !indegree.has(edge.targetBlockId)) {
        return;
      }
      outgoing.get(edge.sourceBlockId).push(edge.targetBlockId);
      indegree.set(edge.targetBlockId, indegree.get(edge.targetBlockId) + 1);
    });

  const queue = [...indegree.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift();
    visited += 1;
    outgoing.get(id).forEach((targetId) => {
      indegree.set(targetId, indegree.get(targetId) - 1);
      if (indegree.get(targetId) === 0) queue.push(targetId);
    });
  }
  if (visited !== blocks.length) {
    errors.push("edges: sequence部分グラフが循環しています。");
  }
}

export function collectStoryGraphErrors(data) {
  const errors = [];
  if (!isRecord(data)) return ["root: オブジェクトが必要です。"];
  pushUnknownKeys(errors, data, ROOT_KEYS, "root");
  if (data.schemaVersion !== 1) {
    errors.push("schemaVersion: MVPでは1が必要です。");
  }
  if (!isRecord(data.dataset)) {
    errors.push("dataset: オブジェクトが必要です。");
  } else {
    pushUnknownKeys(errors, data.dataset, DATASET_KEYS, "dataset");
    ["id", "label", "status"].forEach((key) =>
      requireText(errors, data.dataset[key], `dataset.${key}`),
    );
    if (!STORY_DATASET_STATUSES.includes(data.dataset.status)) {
      errors.push(
        `dataset.status: ${STORY_DATASET_STATUSES.join("、")}のいずれかが必要です。`,
      );
    }
  }
  if (!Array.isArray(data.series)) errors.push("series: 配列が必要です。");
  if (!Array.isArray(data.blocks)) errors.push("blocks: 配列が必要です。");
  if (!Array.isArray(data.edges)) errors.push("edges: 配列が必要です。");
  if (errors.length) return errors;

  data.series.forEach((series, index) => validateSeries(errors, series, index));
  const seriesRecords = data.series.filter(isRecord);
  const blockRecords = data.blocks.filter(isRecord);
  const seriesById = new Map(seriesRecords.map((series) => [series.id, series]));
  const blockById = new Map(blockRecords.map((block) => [block.id, block]));
  const blockIds = new Set(blockById.keys());

  const ids = new Set();
  [...data.series, ...data.blocks, ...data.edges].forEach((item) => {
    if (!item?.id) return;
    if (ids.has(item.id)) errors.push(`${item.id}: IDが重複しています。`);
    ids.add(item.id);
  });

  data.series.forEach((series, index) => {
    if (!isRecord(series)) return;
    const parent = seriesById.get(series.parentSeriesId);
    if (series.parentSeriesId && !parent) {
      errors.push(`series[${index}].parentSeriesId: 参照先が存在しません。`);
    }
    if (parent && parent.category !== series.category) {
      errors.push(`series[${index}]: 親子のカテゴリが一致しません。`);
    }
    const allowedParents = SERIES_PARENT_KINDS[series.kind] ?? [];
    const parentKind = parent?.kind ?? null;
    if (!allowedParents.includes(parentKind)) {
      errors.push(`series[${index}]: 許可されていない親子階層です。`);
    }
  });
  detectSeriesCycles(errors, seriesById);

  data.blocks.forEach((block, index) =>
    validateBlock(errors, block, index, seriesById),
  );
  const seriesWithChildren = new Set(
    seriesRecords
      .map((series) => series.parentSeriesId)
      .filter(Boolean),
  );
  data.blocks.forEach((block, index) => {
    if (isRecord(block) && seriesWithChildren.has(block.seriesId)) {
      errors.push(`blocks[${index}].seriesId: 末端StorySeriesを参照する必要があります。`);
    }
  });
  data.edges.forEach((edge, index) =>
    validateEdge(errors, edge, index, blockIds, seriesById, blockById),
  );

  const edgeKeys = new Set();
  data.edges.forEach((edge, index) => {
    const key = normalizedEdgeKey(edge);
    if (edgeKeys.has(key)) {
      errors.push(`edges[${index}]: 同一の論理エッジが重複しています。`);
    }
    edgeKeys.add(key);
  });
  detectSequenceCycle(
    errors,
    blockRecords,
    data.edges.filter(isRecord),
  );
  return errors;
}

export function collectStoryReferenceErrors(references, storyBlockIds) {
  const errors = [];
  if (!Array.isArray(references)) {
    return ["storyReferences: 配列が必要です。"];
  }
  const validBlockIds =
    storyBlockIds instanceof Set ? storyBlockIds : new Set(storyBlockIds ?? []);
  const ids = new Set();

  references.forEach((reference, index) => {
    const path = `storyReferences[${index}]`;
    if (!isRecord(reference)) {
      errors.push(`${path}: オブジェクトが必要です。`);
      return;
    }
    pushUnknownKeys(errors, reference, REFERENCE_KEYS, path);
    validateId(errors, reference.id, "ref", `${path}.id`);
    validateId(
      errors,
      reference.storyBlockId,
      "block",
      `${path}.storyBlockId`,
    );
    if (!validBlockIds.has(reference.storyBlockId)) {
      errors.push(`${path}.storyBlockId: 参照先StoryBlockが存在しません。`);
    }
    if (!STORY_REFERENCE_TYPES.includes(reference.type)) {
      errors.push(`${path}.type: 未対応の参照種別です。`);
    }
    if (
      reference.order !== undefined &&
      (!Number.isInteger(reference.order) || reference.order < 0)
    ) {
      errors.push(`${path}.order: 0以上の整数が必要です。`);
    }
    ["label", "note"].forEach((key) => {
      if (reference[key] !== undefined) {
        requireText(errors, reference[key], `${path}.${key}`);
      }
    });
    if (ids.has(reference.id)) {
      errors.push(`${path}.id: StoryReference IDが重複しています。`);
    }
    ids.add(reference.id);
  });
  return errors;
}

export function assertValidStoryGraphData(data, source = "story graph data") {
  const errors = collectStoryGraphErrors(data);
  if (errors.length) {
    throw new Error(`${source} is invalid:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
  return data;
}

export function createStorySeriesPath(seriesId, seriesById) {
  const path = [];
  const visited = new Set();
  let current = seriesById.get(seriesId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = current.parentSeriesId
      ? seriesById.get(current.parentSeriesId)
      : null;
  }
  return path;
}

export function createStoryBlockTitle(block, seriesById) {
  return [
    ...createStorySeriesPath(block.seriesId, seriesById).map(
      (series) => series.label,
    ),
    block.label,
  ].join(" ");
}

export function normalizeStoryGraphData(data) {
  assertValidStoryGraphData(data);
  const seriesById = new Map(data.series.map((series) => [series.id, series]));
  const blocks = data.blocks.map((block) => {
    const seriesPath = createStorySeriesPath(block.seriesId, seriesById);
    return {
      ...block,
      title: createStoryBlockTitle(block, seriesById),
      category: seriesPath[0]?.category ?? seriesById.get(block.seriesId)?.category,
      seriesPath,
    };
  });
  return {
    ...data,
    blocks,
    seriesById,
    blockById: new Map(blocks.map((block) => [block.id, block])),
    edgeById: new Map(data.edges.map((edge) => [edge.id, edge])),
  };
}
