export const INFO_EVENT_CATEGORIES = ["game", "story", "music", "live", "stream"];
export const INFO_EVENT_STATUSES = [
  "scheduled",
  "active",
  "completed",
  "postponed",
  "cancelled",
];
export const INFO_PUBLICATION_STATUSES = [
  "draft",
  "unreviewed",
  "approved",
  "published",
];
export const INFO_TIME_PRECISIONS = ["month", "date", "minute"];
export const INFO_SOURCE_TYPES = [
  "official-site",
  "in-game",
  "official-stream",
  "official-social",
  "official-store",
];
export const INFO_SOURCE_AVAILABILITY = ["available", "moved", "deleted"];
export const INFO_SOURCE_SUPPORTS = [
  "identity",
  "announcement",
  "schedule",
  "status",
  "detail",
];

const INFO_ID_PATTERN =
  /^info_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const DATE_PATTERNS = {
  month: /^\d{4}-(0[1-9]|1[0-2])$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  minute:
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d$/,
};
const SOURCE_ID_PATTERN = /^source_[a-z0-9_]+$/;

function isValidCalendarValue(value, precision) {
  const [datePart] = value.split("T");
  const [year, month, day = 1] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimeZone(timezone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireText(errors, value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}: 空でない文字列が必要です。`);
  }
}

function validateTemporal(errors, value, path, required = false) {
  if (value === undefined) {
    if (required) errors.push(`${path}: 日時値が必要です。`);
    return;
  }
  if (!isRecord(value)) {
    errors.push(`${path}: オブジェクトが必要です。`);
    return;
  }
  if (!INFO_TIME_PRECISIONS.includes(value.precision)) {
    errors.push(`${path}.precision: 未対応の精度です。`);
    return;
  }
  if (!DATE_PATTERNS[value.precision].test(value.value ?? "")) {
    errors.push(`${path}.value: ${value.precision}精度と一致しません。`);
  } else if (!isValidCalendarValue(value.value, value.precision)) {
    errors.push(`${path}.value: 実在する暦日が必要です。`);
  }
  if (
    value.precision === "minute" &&
    (typeof value.timezone !== "string" || !isValidTimeZone(value.timezone))
  ) {
    errors.push(`${path}.timezone: IANAタイムゾーンが必要です。`);
  }
}

function validateSources(errors, sources, path) {
  if (!Array.isArray(sources)) {
    errors.push(`${path}: 配列が必要です。`);
    return;
  }
  const ids = new Set();
  sources.forEach((source, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(source)) {
      errors.push(`${itemPath}: オブジェクトが必要です。`);
      return;
    }
    if (!SOURCE_ID_PATTERN.test(source.id ?? "")) {
      errors.push(`${itemPath}.id: source_<英小文字・数字・_>形式が必要です。`);
    }
    if (ids.has(source.id)) errors.push(`${itemPath}.id: IDが重複しています。`);
    ids.add(source.id);
    requireText(errors, source.label, `${itemPath}.label`);
    try {
      const url = new URL(source.url);
      if (url.protocol !== "https:") {
        errors.push(`${itemPath}.url: HTTPS URLが必要です。`);
      }
    } catch {
      errors.push(`${itemPath}.url: 有効なURLが必要です。`);
    }
    if (!INFO_SOURCE_TYPES.includes(source.type)) {
      errors.push(`${itemPath}.type: 未対応の出典種別です。`);
    }
    if (!INFO_SOURCE_AVAILABILITY.includes(source.availability)) {
      errors.push(`${itemPath}.availability: 未対応の到達状態です。`);
    }
    if (!DATE_PATTERNS.date.test(source.checkedAt ?? "")) {
      errors.push(`${itemPath}.checkedAt: YYYY-MM-DD形式が必要です。`);
    }
    if (
      !Array.isArray(source.supports) ||
      source.supports.length === 0 ||
      source.supports.some((value) => !INFO_SOURCE_SUPPORTS.includes(value)) ||
      new Set(source.supports).size !== source.supports.length
    ) {
      errors.push(`${itemPath}.supports: 重複のない有効な主張が必要です。`);
    }
  });
}

export function temporalStart(value) {
  if (value.precision === "month") return Date.parse(`${value.value}-01T00:00:00Z`);
  if (value.precision === "date") return Date.parse(`${value.value}T00:00:00Z`);
  const [year, month, day, hour, minute] = value.value
    .split(/[-T:]/)
    .map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: value.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(wallClockAsUtc));
  const fields = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );
  const representedAsUtc = Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
  );
  return wallClockAsUtc - (representedAsUtc - wallClockAsUtc);
}

export function temporalEnd(value) {
  if (value.precision === "month") {
    const [year, month] = value.value.split("-").map(Number);
    return Date.UTC(year, month, 1);
  }
  if (value.precision === "date") return temporalStart(value) + 86_400_000;
  return temporalStart(value) + 60_000;
}

export function validateRealworldHistoryData(data, source = "InfoEvent dataset") {
  const errors = [];
  if (!isRecord(data)) return [`${source}: オブジェクトが必要です。`];
  if (!isRecord(data.dataset)) errors.push("dataset: オブジェクトが必要です。");
  requireText(errors, data.dataset?.id, "dataset.id");
  if (!INFO_PUBLICATION_STATUSES.includes(data.dataset?.status)) {
    errors.push("dataset.status: 未対応の公開状態です。");
  }
  if (!Array.isArray(data.events)) {
    errors.push("events: 配列が必要です。");
    return errors;
  }

  const ids = new Set();
  data.events.forEach((event, index) => {
    const path = `events[${index}]`;
    if (!isRecord(event)) {
      errors.push(`${path}: オブジェクトが必要です。`);
      return;
    }
    if (!INFO_ID_PATTERN.test(event.id ?? "")) {
      errors.push(`${path}.id: info_<小文字UUID>形式が必要です。`);
    }
    if (ids.has(event.id)) errors.push(`${path}.id: IDが重複しています。`);
    ids.add(event.id);
    requireText(errors, event.title, `${path}.title`);
    if (!INFO_EVENT_CATEGORIES.includes(event.category)) {
      errors.push(`${path}.category: 未対応のカテゴリです。`);
    }
    if (!INFO_EVENT_STATUSES.includes(event.status)) {
      errors.push(`${path}.status: 未対応の状態です。`);
    }
    if (!INFO_PUBLICATION_STATUSES.includes(event.publicationStatus)) {
      errors.push(`${path}.publicationStatus: 未対応の公開状態です。`);
    }
    validateTemporal(errors, event.announcedAt, `${path}.announcedAt`);
    validateTemporal(errors, event.startsAt, `${path}.startsAt`, true);
    validateTemporal(errors, event.endsAt, `${path}.endsAt`);
    if (
      event.startsAt &&
      event.endsAt &&
      temporalStart(event.endsAt) < temporalStart(event.startsAt)
    ) {
      errors.push(`${path}.endsAt: startsAtより前にはできません。`);
    }
    validateSources(errors, event.sources, `${path}.sources`);
    if (
      event.publicationStatus === "published" &&
      !event.sources?.some(
        (item) =>
          item?.url &&
          Array.isArray(item.supports) &&
          item.supports.includes("identity") &&
          (item.supports.includes("schedule") ||
            item.supports.includes("announcement")),
      )
    ) {
      errors.push(`${path}.sources: 公開項目を支える公式出典が必要です。`);
    }
  });
  return errors.map((error) => `${source}: ${error}`);
}

export function assertValidRealworldHistoryData(data, source) {
  const errors = validateRealworldHistoryData(data, source);
  if (errors.length) throw new Error(errors.join("\n"));
  return data;
}

export function normalizeRealworldHistoryData(data) {
  const events = [...data.events].sort(
    (a, b) => temporalStart(a.startsAt) - temporalStart(b.startsAt),
  );
  return {
    dataset: data.dataset,
    events,
    eventById: new Map(events.map((event) => [event.id, event])),
  };
}
