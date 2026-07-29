export const REALWORLD_SOURCE_PLATFORMS = [
  "website",
  "youtube-channel",
  "youtube-playlist",
  "x-account",
];
export const REALWORLD_ACQUISITION_TYPES = [
  "website",
  "youtube-data-api",
  "x-api",
];
export const REALWORLD_SCOPE_MODES = ["all", "gakumas-explicit"];
export const REALWORLD_RESOURCE_TYPES = [
  "web-page",
  "youtube-video",
  "x-post",
];
export const REALWORLD_INTAKE_STATUSES = ["collected", "skipped"];
export const REALWORLD_OWNER_SCOPES = ["gakumas", "idolmaster"];

const ORIGIN_ID_PATTERN = /^origin_[a-z0-9_]+$/;
const INTAKE_ID_PATTERN = /^intake_[0-9a-f]{64}$/;
const RESOURCE_KEY_PATTERN = /^(web|youtube|x):.+$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const ACQUISITION_BY_PLATFORM = {
  website: "website",
  "youtube-channel": "youtube-data-api",
  "youtube-playlist": "youtube-data-api",
  "x-account": "x-api",
};

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireText(errors, value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}: 空でない文字列が必要です。`);
  }
}

function requireUrl(errors, value, path) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") errors.push(`${path}: HTTPS URLが必要です。`);
  } catch {
    errors.push(`${path}: 有効なURLが必要です。`);
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

export function validateSourceRegistry(registry, source = "source registry") {
  const errors = [];
  if (!isRecord(registry)) return [`${source}: オブジェクトが必要です。`];
  if (registry.schemaVersion !== 1) {
    errors.push("schemaVersion: 1が必要です。");
  }
  if (!Array.isArray(registry.sources)) {
    return [`${source}: sourcesは配列である必要があります。`];
  }
  const ids = new Set();
  registry.sources.forEach((item, index) => {
    const path = `sources[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path}: オブジェクトが必要です。`);
      return;
    }
    if (!ORIGIN_ID_PATTERN.test(item.id ?? "")) {
      errors.push(`${path}.id: origin_<英小文字・数字・_>形式が必要です。`);
    }
    if (ids.has(item.id)) errors.push(`${path}.id: IDが重複しています。`);
    ids.add(item.id);
    requireText(errors, item.label, `${path}.label`);
    requireUrl(errors, item.url, `${path}.url`);
    requireText(errors, item.externalId, `${path}.externalId`);
    if (!REALWORLD_SOURCE_PLATFORMS.includes(item.platform)) {
      errors.push(`${path}.platform: 未対応のプラットフォームです。`);
    }
    if (!REALWORLD_OWNER_SCOPES.includes(item.ownerScope)) {
      errors.push(`${path}.ownerScope: 未対応の所有範囲です。`);
    }
    if (!REALWORLD_ACQUISITION_TYPES.includes(item.acquisition)) {
      errors.push(`${path}.acquisition: 未対応の取得方式です。`);
    } else if (ACQUISITION_BY_PLATFORM[item.platform] !== item.acquisition) {
      errors.push(`${path}.acquisition: platformに対応する取得方式が必要です。`);
    }
    if (!REALWORLD_SCOPE_MODES.includes(item.scopeMode)) {
      errors.push(`${path}.scopeMode: 未対応の収録範囲です。`);
    }
    if (
      !Array.isArray(item.keywords) ||
      item.keywords.some((keyword) => typeof keyword !== "string")
    ) {
      errors.push(`${path}.keywords: 文字列配列が必要です。`);
    }
    if (item.scopeMode === "gakumas-explicit" && item.keywords?.length === 0) {
      errors.push(`${path}.keywords: 学マス判定語が必要です。`);
    }
    if (item.discoveryUrls !== undefined) {
      if (!Array.isArray(item.discoveryUrls) || item.discoveryUrls.length === 0) {
        errors.push(`${path}.discoveryUrls: 空でないURL配列が必要です。`);
      } else {
        item.discoveryUrls.forEach((url, urlIndex) =>
          requireUrl(errors, url, `${path}.discoveryUrls[${urlIndex}]`),
        );
      }
    }
  });
  return errors.map((error) => `${source}: ${error}`);
}

export function isEligibleForSource(source, text) {
  if (source.scopeMode === "all") return true;
  const normalized = String(text).toLocaleLowerCase("ja");
  return source.keywords.some((keyword) =>
    normalized.includes(keyword.toLocaleLowerCase("ja")),
  );
}

export function validateIntakeDataset(
  dataset,
  registry,
  source = "intake dataset",
) {
  const errors = [];
  if (!isRecord(dataset)) return [`${source}: オブジェクトが必要です。`];
  if (dataset.schemaVersion !== 1) errors.push("schemaVersion: 1が必要です。");
  const registryIds = new Set(registry.sources.map((item) => item.id));
  if (!registryIds.has(dataset.sourceRegistryId)) {
    errors.push("sourceRegistryId: レジストリに存在するIDが必要です。");
  }
  requireTimestamp(errors, dataset.collectedAt, "collectedAt");
  if (!REALWORLD_INTAKE_STATUSES.includes(dataset.status)) {
    errors.push("status: collectedまたはskippedが必要です。");
  }
  if (dataset.status === "skipped") {
    requireText(errors, dataset.skipReason, "skipReason");
  } else if (dataset.skipReason !== undefined) {
    errors.push("skipReason: skippedの場合だけ指定できます。");
  }
  if (!Array.isArray(dataset.items)) {
    return [`${source}: itemsは配列である必要があります。`];
  }
  if (dataset.status === "skipped" && dataset.items.length > 0) {
    errors.push("items: skippedの場合は空配列が必要です。");
  }
  const ids = new Set();
  const externalIds = new Set();
  const resourceKeys = new Set();
  dataset.items.forEach((item, index) => {
    const path = `items[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path}: オブジェクトが必要です。`);
      return;
    }
    if (!INTAKE_ID_PATTERN.test(item.id ?? "")) {
      errors.push(`${path}.id: intake_<SHA-256>形式が必要です。`);
    }
    if (ids.has(item.id)) errors.push(`${path}.id: IDが重複しています。`);
    ids.add(item.id);
    if (externalIds.has(item.externalId)) {
      errors.push(`${path}.externalId: 同じ取得元内で重複しています。`);
    }
    externalIds.add(item.externalId);
    requireText(errors, item.externalId, `${path}.externalId`);
    if (!RESOURCE_KEY_PATTERN.test(item.resourceKey ?? "")) {
      errors.push(`${path}.resourceKey: プラットフォーム共通識別子が必要です。`);
    }
    if (resourceKeys.has(item.resourceKey)) {
      errors.push(`${path}.resourceKey: 同じ取得元内で重複しています。`);
    }
    resourceKeys.add(item.resourceKey);
    requireText(errors, item.title, `${path}.title`);
    if (typeof item.summary !== "string") {
      errors.push(`${path}.summary: 文字列が必要です。`);
    }
    requireUrl(errors, item.canonicalUrl, `${path}.canonicalUrl`);
    requireTimestamp(errors, item.retrievedAt, `${path}.retrievedAt`);
    if (item.publishedAt !== undefined) {
      requireTimestamp(errors, item.publishedAt, `${path}.publishedAt`);
    }
    if (!REALWORLD_RESOURCE_TYPES.includes(item.resourceType)) {
      errors.push(`${path}.resourceType: 未対応の取得対象です。`);
    }
    if (!SHA256_PATTERN.test(item.contentHash ?? "")) {
      errors.push(`${path}.contentHash: SHA-256が必要です。`);
    }
    if (!isRecord(item.match) || typeof item.match.eligible !== "boolean") {
      errors.push(`${path}.match.eligible: 真偽値が必要です。`);
    } else if (
      !Array.isArray(item.match.reasons) ||
      item.match.reasons.length === 0 ||
      item.match.reasons.some(
        (reason) => typeof reason !== "string" || reason.trim() === "",
      )
    ) {
      errors.push(`${path}.match.reasons: 空でない文字列配列が必要です。`);
    }
  });
  return errors.map((error) => `${source}: ${error}`);
}

export function assertValidSourceRegistry(registry, source) {
  const errors = validateSourceRegistry(registry, source);
  if (errors.length) throw new Error(errors.join("\n"));
  return registry;
}

export function assertValidIntakeDataset(dataset, registry, source) {
  const errors = validateIntakeDataset(dataset, registry, source);
  if (errors.length) throw new Error(errors.join("\n"));
  return dataset;
}
