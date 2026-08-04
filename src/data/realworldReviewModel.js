import {
  assertValidIntakeDataset,
  assertValidSourceRegistry,
} from "./realworldIntakeModel.js";
import { assertValidRealworldHistoryData } from "./realworldHistoryModel.js";
import { assertValidRealworldReviewDataset } from "./realworldReviewDecisionModel.js";

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

function candidateKey(sourceRegistryId, intakeId) {
  return `${sourceRegistryId}\0${intakeId}`;
}

function candidateReference(item) {
  return {
    sourceRegistryId: item.sourceRegistryId,
    intakeId: item.id,
  };
}

function sortedPeerReferences(group, ownItem) {
  return group
    .filter(
      (item) =>
        candidateKey(item.sourceRegistryId, item.id) !==
        candidateKey(ownItem.sourceRegistryId, ownItem.id),
    )
    .map(candidateReference)
    .sort(
      (left, right) =>
        compareText(left.sourceRegistryId, right.sourceRegistryId) ||
        compareText(left.intakeId, right.intakeId),
    );
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
  reviewDatasets = [],
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
  const knownInfoEventIds = new Set();
  for (const dataset of infoEventDatasets) {
    assertValidRealworldHistoryData(
      dataset,
      `review InfoEvent ${dataset.dataset?.id ?? "unknown"}`,
    );
    for (const event of dataset.events) {
      knownInfoEventIds.add(event.id);
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

  const reviewByCandidate = new Map();
  const reviewSourceIds = new Set();
  for (const dataset of reviewDatasets) {
    assertValidRealworldReviewDataset(
      dataset,
      registry,
      knownInfoEventIds,
      `review decisions ${dataset.sourceRegistryId ?? "unknown"}`,
    );
    if (reviewSourceIds.has(dataset.sourceRegistryId)) {
      throw new Error(
        `review decisions: ${dataset.sourceRegistryId} の台帳が重複しています。`,
      );
    }
    reviewSourceIds.add(dataset.sourceRegistryId);
    for (const decision of dataset.decisions) {
      const key = candidateKey(dataset.sourceRegistryId, decision.intakeId);
      if (reviewByCandidate.has(key)) {
        throw new Error(
          `review decisions: ${dataset.sourceRegistryId} と ${decision.intakeId} の判断が重複しています。`,
        );
      }
      reviewByCandidate.set(key, {
        sourceRegistryId: dataset.sourceRegistryId,
        ...decision,
      });
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
        contentHash: item.contentHash,
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
    .map((item) => {
      const reviewKey = candidateKey(item.sourceRegistryId, item.id);
      const storedReview = reviewByCandidate.get(reviewKey);
      reviewByCandidate.delete(reviewKey);
      return {
        ...item,
        review: storedReview
          ? {
              decision: storedReview.decision,
              reason: storedReview.reason ?? null,
              note: storedReview.note ?? null,
              reviewedAt: storedReview.reviewedAt,
              reviewedBy: storedReview.reviewedBy,
              reviewedContentHash: storedReview.reviewedContentHash,
              infoEventIds: [...storedReview.infoEventIds],
              needsRecheck:
                storedReview.reviewedContentHash !== item.contentHash,
            }
          : {
              decision: "pending",
              reason: null,
              note: null,
              reviewedAt: null,
              reviewedBy: null,
              reviewedContentHash: null,
              infoEventIds: [],
              needsRecheck: false,
            },
        pilotReasons: [],
        clues: {
          exactResourcePeers: sortedPeerReferences(
            resourceGroups.get(item.resourceKey),
            item,
          ),
          exactTitlePeers: sortedPeerReferences(
            titleGroups.get(item.normalizedTitle),
            item,
          ),
          linkedInfoEvents: [
            ...(infoLinksByUrl.get(item.canonicalUrl) ?? []),
          ].sort(
            (left, right) =>
              compareText(left.infoEventId, right.infoEventId) ||
              compareText(left.sourceId, right.sourceId),
          ),
        },
      };
    })
    .sort(
      (left, right) =>
        sourceOrder.get(left.sourceRegistryId) -
          sourceOrder.get(right.sourceRegistryId) ||
        compareText(right.publishedAt ?? "", left.publishedAt ?? "") ||
        compareText(left.id, right.id),
    );

  const candidateByKey = new Map(
    candidates.map((item) => [
      candidateKey(item.sourceRegistryId, item.id),
      item,
    ]),
  );
  const pilotReferences = [];
  const pilotKeys = new Set();
  const addPilotCandidate = (candidate, reason) => {
    if (!candidate) return;
    const key = candidateKey(candidate.sourceRegistryId, candidate.id);
    if (!pilotKeys.has(key)) {
      pilotKeys.add(key);
      pilotReferences.push({
        sourceRegistryId: candidate.sourceRegistryId,
        intakeId: candidate.id,
      });
    }
    candidate.pilotReasons.push(reason);
  };

  candidates
    .filter((item) => item.sourcePlatform === "website")
    .forEach((item) => addPilotCandidate(item, "website"));
  candidates
    .filter((item) => item.sourcePlatform === "youtube-playlist")
    .sort(
      (left, right) =>
        compareText(right.publishedAt ?? "", left.publishedAt ?? "") ||
        compareText(left.id, right.id),
    )
    .slice(0, 10)
    .forEach((item) => addPilotCandidate(item, "latest-playlist"));

  const newestExactTitleGroup = [...titleGroups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([normalizedTitle, items]) => ({
      normalizedTitle,
      items,
      latestPublishedAt: items
        .map((item) => item.publishedAt ?? "")
        .sort(compareText)
        .at(-1),
    }))
    .sort(
      (left, right) =>
        compareText(right.latestPublishedAt, left.latestPublishedAt) ||
        compareText(left.normalizedTitle, right.normalizedTitle),
    )[0];
  newestExactTitleGroup?.items
    .map((item) =>
      candidateByKey.get(candidateKey(item.sourceRegistryId, item.id)),
    )
    .sort(
      (left, right) =>
        compareText(right.publishedAt ?? "", left.publishedAt ?? "") ||
        compareText(left.id, right.id),
    )
    .forEach((item) => addPilotCandidate(item, "newest-exact-title-group"));

  const exactResourceGroups = [...resourceGroups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([resourceKey, items]) => ({
      resourceKey,
      candidates: items
        .map(candidateReference)
        .sort(
          (left, right) =>
            compareText(left.sourceRegistryId, right.sourceRegistryId) ||
            compareText(left.intakeId, right.intakeId),
        ),
    }))
    .sort((left, right) => compareText(left.resourceKey, right.resourceKey));

  const exactTitleGroups = [...titleGroups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([normalizedTitle, items]) => ({
      normalizedTitle,
      candidates: items
        .map(candidateReference)
        .sort(
          (left, right) =>
            compareText(left.sourceRegistryId, right.sourceRegistryId) ||
            compareText(left.intakeId, right.intakeId),
        ),
    }))
    .sort((left, right) =>
      compareText(left.normalizedTitle, right.normalizedTitle),
    );

  const sources = registry.sources.map((source) => {
    const dataset = intakeBySource.get(source.id);
    const items = dataset?.items ?? [];
    const sourceCandidates = candidates.filter(
      (candidate) => candidate.sourceRegistryId === source.id,
    );
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
      reviewDecisionCounts: Object.fromEntries(
        ["pending", "include", "exclude", "defer"].map((decision) => [
          decision,
          sourceCandidates.filter(
            (candidate) => candidate.review.decision === decision,
          ).length,
        ]),
      ),
      needsRecheckCount: sourceCandidates.filter(
        (candidate) => candidate.review.needsRecheck,
      ).length,
    };
  });

  const intakeStatusCounts = Object.fromEntries(
    ["collected", "partial", "skipped", "missing"].map((status) => [
      status,
      sources.filter((source) => source.intakeStatus === status).length,
    ]),
  );
  const reviewDecisionCounts = Object.fromEntries(
    ["pending", "include", "exclude", "defer"].map((decision) => [
      decision,
      candidates.filter((item) => item.review.decision === decision).length,
    ]),
  );
  const orphanReviews = [...reviewByCandidate.values()].sort(
    (left, right) =>
      compareText(left.sourceRegistryId, right.sourceRegistryId) ||
      compareText(left.intakeId, right.intakeId),
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
      reviewDecisionCounts,
      needsRecheckCount: candidates.filter(
        (item) => item.review.needsRecheck,
      ).length,
      orphanReviewCount: orphanReviews.length,
      pilotCandidateCount: pilotReferences.length,
    },
    sources,
    candidates,
    exactResourceGroups,
    exactTitleGroups,
    orphanReviews,
    pilotBatch: {
      ruleVersion: 1,
      newestExactTitle: newestExactTitleGroup?.normalizedTitle ?? null,
      candidates: pilotReferences,
    },
  };
}
