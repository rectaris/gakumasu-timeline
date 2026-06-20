export const DATE_CONFIDENCE_LABELS = {
  confirmed: "確定",
  inferred: "推定",
  rangeOnly: "期間内の1日",
};

export const SOURCE_BASIS_LABELS = {
  explicit: "出典明記",
  inferred: "推論",
  mixed: "混在",
  unknown: "未分類",
};

export const SOURCE_STATUS_LABELS = {
  confirmed: "出典確認",
  inferred: "推定根拠",
  conflicting: "出典矛盾",
  unreviewed: "未確認",
  unsourced: "出典なし",
  unknown: "分類不能",
};

export const SOURCE_CLAIM_TARGET_LABELS = {
  event: "イベント",
  date: "時期",
  detail: "内容",
  worldline: "世界線",
  participants: "参加者",
};

export const RANGE_REASON_LABELS = {
  monthOnly: "月のみ確定",
  sourceRange: "出典上の候補期間",
  chapterOrder: "章/話数順",
  relativeOrder: "前後関係",
  unknown: "理由未分類",
};

export const EVENT_AUDIT_CATEGORY_LABELS = {
  conflict: "出典矛盾",
  missingSource: "出典なし",
  unreviewedSource: "未確認",
  unknownSource: "分類不能",
  inferred: "推定",
  rangeOnly: "期間内の1日",
};

export const EVENT_AUDIT_CATEGORY_OPTIONS = [
  "all",
  "conflict",
  "missingSource",
  "unreviewedSource",
  "unknownSource",
  "inferred",
  "rangeOnly",
];

export const VALID_DATE_CONFIDENCE = new Set(Object.keys(DATE_CONFIDENCE_LABELS));
export const VALID_SOURCE_BASIS = new Set(Object.keys(SOURCE_BASIS_LABELS));
export const VALID_SOURCE_STATUS = new Set(Object.keys(SOURCE_STATUS_LABELS));
export const VALID_SOURCE_CLAIM_TARGET = new Set(
  Object.keys(SOURCE_CLAIM_TARGET_LABELS),
);
export const VALID_RANGE_REASON = new Set(Object.keys(RANGE_REASON_LABELS));

export function isSingleWithinRange(event) {
  return event?.occurrenceType === "singleWithinRange";
}

function hasEntries(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasConflicts(event) {
  return hasEntries(event?.conflicts);
}

function normalizeSourceKeyText(value) {
  return String(value ?? "").trim().toLocaleLowerCase("ja-JP");
}

export function eventOccurrenceType(event) {
  return event?.occurrenceType || "continuous";
}

export function eventDateConfidence(event) {
  if (VALID_DATE_CONFIDENCE.has(event?.dateConfidence)) {
    return event.dateConfidence;
  }

  return isSingleWithinRange(event) ? "rangeOnly" : "confirmed";
}

export function eventSourceBasis(event) {
  if (VALID_SOURCE_BASIS.has(event?.sourceBasis)) {
    return event.sourceBasis;
  }

  if (eventDateConfidence(event) === "inferred") {
    return "inferred";
  }

  return "explicit";
}

export function eventSourceStatus(event) {
  if (hasConflicts(event)) {
    return "conflicting";
  }

  if (VALID_SOURCE_STATUS.has(event?.sourceStatus)) {
    return event.sourceStatus;
  }

  if (eventSourceBasis(event) === "inferred") {
    return "inferred";
  }

  return hasEntries(event?.source) || hasEntries(event?.sourceDetails)
    ? "confirmed"
    : "unsourced";
}

export function eventRangeReason(event) {
  if (VALID_RANGE_REASON.has(event?.rangeReason)) {
    return event.rangeReason;
  }

  return isSingleWithinRange(event) ? "sourceRange" : null;
}

export function eventUncertaintyState(event) {
  if (eventSourceStatus(event) === "conflicting") {
    return "conflicting";
  }

  return eventDateConfidence(event);
}

export function isUncertainEvent(event) {
  return eventUncertaintyState(event) !== "confirmed";
}

export function uncertaintyLabelForState(state) {
  if (state === "conflicting") {
    return SOURCE_STATUS_LABELS.conflicting;
  }

  return DATE_CONFIDENCE_LABELS[state] ?? String(state ?? "");
}

export function eventUncertaintySummary(event) {
  const dateConfidence = eventDateConfidence(event);
  const sourceBasis = eventSourceBasis(event);
  const sourceStatus = eventSourceStatus(event);
  const rangeReason = eventRangeReason(event);
  const state = eventUncertaintyState(event);

  return {
    state,
    stateLabel: uncertaintyLabelForState(state),
    dateConfidence,
    dateConfidenceLabel: DATE_CONFIDENCE_LABELS[dateConfidence],
    sourceBasis,
    sourceBasisLabel: SOURCE_BASIS_LABELS[sourceBasis],
    sourceStatus,
    sourceStatusLabel: SOURCE_STATUS_LABELS[sourceStatus],
    rangeReason,
    rangeReasonLabel: rangeReason ? RANGE_REASON_LABELS[rangeReason] : "",
    isUncertain: isUncertainEvent(event),
  };
}

export function sourceKeysForEvent(event) {
  const keys = [];

  if (Array.isArray(event?.sourceDetails)) {
    event.sourceDetails.forEach((sourceDetail) => {
      const id = normalizeSourceKeyText(sourceDetail?.id);
      const url = normalizeSourceKeyText(sourceDetail?.url);
      const label = normalizeSourceKeyText(sourceDetail?.label);

      if (id) {
        keys.push(`id:${id}`);
      } else if (url) {
        keys.push(`url:${url}`);
      } else if (label) {
        keys.push(`text:${label}`);
      }
    });
  }

  if (Array.isArray(event?.source)) {
    event.source.forEach((source) => {
      const text = normalizeSourceKeyText(source);
      if (text) keys.push(`text:${text}`);
    });
  }

  return Array.from(new Set(keys));
}

export function sourceKeyForSourceDetail(sourceDetail) {
  const id = normalizeSourceKeyText(sourceDetail?.id);
  if (id) return `id:${id}`;

  const url = normalizeSourceKeyText(sourceDetail?.url);
  if (url) return `url:${url}`;

  const label = normalizeSourceKeyText(sourceDetail?.label);
  return label ? `text:${label}` : "";
}

export function sourceKeyForSourceLabel(sourceLabel) {
  const text = normalizeSourceKeyText(sourceLabel);
  return text ? `text:${text}` : "";
}

export function eventAuditCategories(event) {
  const categories = [];
  const dateConfidence = eventDateConfidence(event);
  const sourceBasis = eventSourceBasis(event);
  const sourceStatus = eventSourceStatus(event);

  if (sourceStatus === "conflicting") {
    categories.push("conflict");
  }

  if (sourceStatus === "unsourced") {
    categories.push("missingSource");
  }

  if (sourceStatus === "unreviewed") {
    categories.push("unreviewedSource");
  }

  if (sourceStatus === "unknown") {
    categories.push("unknownSource");
  }

  if (
    dateConfidence === "inferred" ||
    sourceBasis === "inferred" ||
    sourceStatus === "inferred"
  ) {
    categories.push("inferred");
  }

  if (dateConfidence === "rangeOnly") {
    categories.push("rangeOnly");
  }

  return categories;
}

export function eventAuditSummary(event) {
  const categories = eventAuditCategories(event);

  return {
    categories,
    labels: categories.map(
      (category) => EVENT_AUDIT_CATEGORY_LABELS[category] ?? category,
    ),
    hasIssues: categories.length > 0,
    hasConflict: categories.includes("conflict"),
    missingSource: categories.includes("missingSource"),
  };
}

export function summarizeEventAuditQuality(events = []) {
  return events.reduce(
    (summary, event) => {
      const audit = eventAuditSummary(event);
      if (audit.hasIssues) summary.issueCount += 1;
      if (audit.hasConflict) summary.conflictCount += 1;
      if (audit.missingSource) summary.missingSourceCount += 1;
      if (audit.categories.includes("inferred")) summary.inferredCount += 1;
      if (audit.categories.includes("rangeOnly")) summary.rangeOnlyCount += 1;
      return summary;
    },
    {
      issueCount: 0,
      conflictCount: 0,
      missingSourceCount: 0,
      inferredCount: 0,
      rangeOnlyCount: 0,
    },
  );
}
