export const REALWORLD_REVIEW_DECISIONS = ["include", "exclude", "defer"];
export const REALWORLD_EXCLUSION_REASONS = [
  "out_of_scope",
  "not_an_event",
  "duplicate_candidate",
  "superseded_resource",
  "unverifiable",
  "other",
];
export const REALWORLD_DEFERRAL_REASONS = [
  "needs_source_review",
  "needs_grouping_decision",
  "incomplete_source_data",
  "other",
];

const INTAKE_ID_PATTERN = /^intake_[0-9a-f]{64}$/;
const INFO_ID_PATTERN =
  /^info_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const DATASET_FIELDS = new Set([
  "schemaVersion",
  "sourceRegistryId",
  "decisions",
]);
const DECISION_FIELDS = new Set([
  "intakeId",
  "decision",
  "reason",
  "note",
  "reviewedAt",
  "reviewedBy",
  "reviewedContentHash",
  "infoEventIds",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireText(errors, value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}: 空でない文字列が必要です。`);
  }
}

function requireTimestamp(errors, value, path) {
  requireText(errors, value, path);
  if (
    typeof value === "string" &&
    (Number.isNaN(Date.parse(value)) || !value.includes("T"))
  ) {
    errors.push(`${path}: ISO 8601日時が必要です。`);
  }
}

function rejectUnknownFields(errors, value, allowed, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`${path}.${key}: 未知のフィールドです。`);
    }
  }
}

export function validateRealworldReviewDataset(
  dataset,
  registry,
  knownInfoEventIds = null,
  source = "review dataset",
) {
  const errors = [];
  if (!isRecord(dataset)) return [`${source}: オブジェクトが必要です。`];
  rejectUnknownFields(errors, dataset, DATASET_FIELDS, "dataset");
  if (dataset.schemaVersion !== 1) errors.push("schemaVersion: 1が必要です。");

  const registryIds = new Set(registry.sources.map((item) => item.id));
  if (!registryIds.has(dataset.sourceRegistryId)) {
    errors.push("sourceRegistryId: レジストリに存在するIDが必要です。");
  }
  if (!Array.isArray(dataset.decisions)) {
    return [`${source}: decisionsは配列である必要があります。`];
  }

  const intakeIds = new Set();
  dataset.decisions.forEach((item, index) => {
    const path = `decisions[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path}: オブジェクトが必要です。`);
      return;
    }
    rejectUnknownFields(errors, item, DECISION_FIELDS, path);
    if (!INTAKE_ID_PATTERN.test(item.intakeId ?? "")) {
      errors.push(`${path}.intakeId: intake_<SHA-256>形式が必要です。`);
    }
    if (intakeIds.has(item.intakeId)) {
      errors.push(`${path}.intakeId: 判断対象が重複しています。`);
    }
    intakeIds.add(item.intakeId);
    if (!REALWORLD_REVIEW_DECISIONS.includes(item.decision)) {
      errors.push(`${path}.decision: include、exclude、deferが必要です。`);
    }

    requireTimestamp(errors, item.reviewedAt, `${path}.reviewedAt`);
    requireText(errors, item.reviewedBy, `${path}.reviewedBy`);
    if (
      typeof item.reviewedBy === "string" &&
      (item.reviewedBy.length > 100 || /[\r\n]/u.test(item.reviewedBy))
    ) {
      errors.push(
        `${path}.reviewedBy: 改行を含まない100文字以下の識別子が必要です。`,
      );
    }
    if (!SHA256_PATTERN.test(item.reviewedContentHash ?? "")) {
      errors.push(`${path}.reviewedContentHash: SHA-256が必要です。`);
    }

    const allowedReasons =
      item.decision === "exclude"
        ? REALWORLD_EXCLUSION_REASONS
        : item.decision === "defer"
          ? REALWORLD_DEFERRAL_REASONS
          : [];
    if (item.decision === "include") {
      if (item.reason !== undefined) {
        errors.push(`${path}.reason: includeでは指定できません。`);
      }
    } else if (!allowedReasons.includes(item.reason)) {
      errors.push(`${path}.reason: 判断に対応する理由コードが必要です。`);
    }
    if (
      item.note !== undefined &&
      (typeof item.note !== "string" || item.note.trim() === "")
    ) {
      errors.push(`${path}.note: 指定する場合は空でない文字列が必要です。`);
    }
    if (item.reason === "other" && item.note === undefined) {
      errors.push(`${path}.note: reasonがotherの場合は必須です。`);
    }

    if (
      !Array.isArray(item.infoEventIds) ||
      item.infoEventIds.some((id) => !INFO_ID_PATTERN.test(id)) ||
      new Set(item.infoEventIds).size !== item.infoEventIds.length
    ) {
      errors.push(
        `${path}.infoEventIds: 重複のない有効なInfoEvent ID配列が必要です。`,
      );
    } else {
      if (item.decision !== "include" && item.infoEventIds.length > 0) {
        errors.push(
          `${path}.infoEventIds: includeの場合だけ指定できます。`,
        );
      }
      if (
        knownInfoEventIds &&
        item.infoEventIds.some((id) => !knownInfoEventIds.has(id))
      ) {
        errors.push(
          `${path}.infoEventIds: 存在するInfoEventだけを参照できます。`,
        );
      }
    }
  });

  return errors.map((error) => `${source}: ${error}`);
}

export function assertValidRealworldReviewDataset(
  dataset,
  registry,
  knownInfoEventIds,
  source,
) {
  const errors = validateRealworldReviewDataset(
    dataset,
    registry,
    knownInfoEventIds,
    source,
  );
  if (errors.length) throw new Error(errors.join("\n"));
  return dataset;
}
