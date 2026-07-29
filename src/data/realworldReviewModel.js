import {
  assertValidIntakeDataset,
  assertValidSourceRegistry,
} from "./realworldIntakeModel.js";
import { assertValidRealworldHistoryData } from "./realworldHistoryModel.js";

function compareText(left, right) {
  return String(left).localeCompare(String(right), "en");
}

function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

function sortedPeerIds(group, ownId) {
  return group
    .map((item) => item.id)
    .filter((id) => id !== ownId)
    .sort(compareText);
}

function publishedAtRange(items) {
  const values = items
    .map((item) => item.publishedAt)
    .filter(Boolean)
    .sort(compareText);
  if (values.length === 0) return null;
  return { earliest: values[0], latest: values.at(-1) };
}

export function normalizeReviewTitle(title) {
  return String(title)
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/\s+/gu, " ")
    .trim();
}

export function buildRealworldReviewInventory({
  registry,
  intakeDatasets,
  infoEventDatasets,
}) {
  assertValidSourceRegistry(registry, "review source registry");

  const intakeBySource = new Map();
  for (const dataset of intakeDatasets) {
    assertValidIntakeDataset(
      dataset,
      registry,
      `review intake ${dataset.sourceRegistryId ?? "unknown"}`,
    );
    if (intakeBySource.has(dataset.sourceRegistryId)) {
      throw new Error(
        `review intake: ${dataset.sourceRegistryId} のデータセットが重複しています。`,
      );
    }
    intakeBySource.set(dataset.sourceRegistryId, dataset);
  }

  const infoLinksByUrl = new Map();
  for (const dataset of infoEventDatasets) {
    assertValidRealworldHistoryData(
      dataset,
      `review InfoEvent ${dataset.dataset?.id ?? "unknown"}`,
    );
    for (const event of dataset.events) {
      for (const source of event.sources) {
        const links = infoLinksByUrl.get(source.url) ?? [];
        links.push({
          infoEventId: event.id,
          infoEventTitle: event.title,
          datasetId: dataset.dataset.id,
          datasetStatus: dataset.dataset.status,
          publicationStatus: event.publicationStatus,
          sourceId: source.id,
        });
        infoLinksByUrl.set(source.url, links);
      }
    }
  }

  const baseCandidates = [];
  for (const source of registry.sources) {
    const dataset = intakeBySource.get(source.id);
    for (const item of dataset?.items ?? []) {
      baseCandidates.push({
        id: item.id,
        sourceRegistryId: source.id,
        sourceLabel: source.label,
        sourcePlatform: source.platform,
        intakeStatus: dataset.status,
        resourceType: item.resourceType,
        resourceKey: item.resourceKey,
        externalId: item.externalId,
        canonicalUrl: item.canonicalUrl,
        title: item.title,
        normalizedTitle: normalizeReviewTitle(item.title),
        publishedAt: item.publishedAt ?? null,
        retrievedAt: item.retrievedAt,
        eligible: item.match.eligible,
        matchReasons: [...item.match.reasons],
      });
    }
  }

  const resourceGroups = groupBy(baseCandidates, (item) => item.resourceKey);
  const titleGroups = groupBy(baseCandidates, (item) => item.normalizedTitle);
  const sourceOrder = new Map(
    registry.sources.map((source, index) => [source.id, index]),
  );
  const candidates = baseCandidates
    .map((item) => ({
      ...item,
      clues: {
        exactResourcePeerIds: sortedPeerIds(
          resourceGroups.get(item.resourceKey),
          item.id,
        ),
        exactTitlePeerIds: sortedPeerIds(
          titleGroups.get(item.normalizedTitle),
          item.id,
        ),
        linkedInfoEvents: [...(infoLinksByUrl.get(item.canonicalUrl) ?? [])].sort(
          (left, right) =>
            compareText(left.infoEventId, right.infoEventId) ||
            compareText(left.sourceId, right.sourceId),
        ),
      },
    }))
    .sort(
      (left, right) =>
        sourceOrder.get(left.sourceRegistryId) -
          sourceOrder.get(right.sourceRegistryId) ||
        compareText(right.publishedAt ?? "", left.publishedAt ?? "") ||
        compareText(left.id, right.id),
    );

  const exactResourceGroups = [...resourceGroups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([resourceKey, items]) => ({
      resourceKey,
      intakeIds: items.map((item) => item.id).sort(compareText),
    }))
    .sort((left, right) => compareText(left.resourceKey, right.resourceKey));

  const exactTitleGroups = [...titleGroups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([normalizedTitle, items]) => ({
      normalizedTitle,
      intakeIds: items.map((item) => item.id).sort(compareText),
    }))
    .sort((left, right) =>
      compareText(left.normalizedTitle, right.normalizedTitle),
    );

  const sources = registry.sources.map((source) => {
    const dataset = intakeBySource.get(source.id);
    const items = dataset?.items ?? [];
    return {
      id: source.id,
      label: source.label,
      platform: source.platform,
      collectionState: source.collectionState ?? "active",
      intakeStatus: dataset?.status ?? "missing",
      collectedAt: dataset?.collectedAt ?? null,
      candidateCount: items.length,
      eligibleCandidateCount: items.filter((item) => item.match.eligible).length,
      publishedAtRange: publishedAtRange(items),
      pagination: dataset?.pagination ?? null,
      skipReason: dataset?.skipReason ?? null,
    };
  });

  const intakeStatusCounts = Object.fromEntries(
    ["collected", "partial", "skipped", "missing"].map((status) => [
      status,
      sources.filter((source) => source.intakeStatus === status).length,
    ]),
  );

  return {
    schemaVersion: 1,
    summary: {
      sourceCount: registry.sources.length,
      intakeDatasetCount: intakeDatasets.length,
      candidateCount: candidates.length,
      eligibleCandidateCount: candidates.filter((item) => item.eligible).length,
      linkedCandidateCount: candidates.filter(
        (item) => item.clues.linkedInfoEvents.length > 0,
      ).length,
      exactResourceGroupCount: exactResourceGroups.length,
      exactTitleGroupCount: exactTitleGroups.length,
      intakeStatusCounts,
    },
    sources,
    candidates,
    exactResourceGroups,
    exactTitleGroups,
  };
}
