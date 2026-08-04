import fs from "node:fs/promises";
import path from "node:path";
import {
  validateIntakeDataset,
  validateSourceRegistry,
} from "../src/data/realworldIntakeModel.js";
import { validateRealworldHistoryData } from "../src/data/realworldHistoryModel.js";
import { validateRealworldReviewDataset } from "../src/data/realworldReviewDecisionModel.js";

const registryPath = "data/raw/realworld_events/source-registry.json";
const intakeRoot = "data/raw/realworld_events/intake";
const reviewRoot = "data/raw/realworld_events/reviews";
const publishedPath = "data/raw/realworld_events/published.json";
const unreviewedRoot = "data/raw/realworld_events/unreviewed";
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
const errors = validateSourceRegistry(registry, registryPath);
const resources = new Map();
const intakeBySource = new Map();

async function jsonFiles(directory, optional = false) {
  try {
    return (await fs.readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(directory, entry.name))
      .sort((a, b) => a.localeCompare(b, "en"));
  } catch (error) {
    if (optional && error.code === "ENOENT") return [];
    throw error;
  }
}

const intakeFiles = await jsonFiles(intakeRoot, true);
for (const file of intakeFiles) {
  const dataset = JSON.parse(await fs.readFile(file, "utf8"));
  errors.push(...validateIntakeDataset(dataset, registry, file));
  intakeBySource.set(dataset.sourceRegistryId, dataset);
  dataset.items?.forEach((item) => {
    const references = resources.get(item.resourceKey) ?? [];
    references.push({
      sourceRegistryId: dataset.sourceRegistryId,
      intakeId: item.id,
    });
    resources.set(item.resourceKey, references);
  });
}

const infoEventIds = new Set();
for (const file of [
  publishedPath,
  ...(await jsonFiles(unreviewedRoot, true)),
]) {
  const dataset = JSON.parse(await fs.readFile(file, "utf8"));
  errors.push(...validateRealworldHistoryData(dataset, file));
  dataset.events?.forEach((event) => infoEventIds.add(event.id));
}

const reviewFiles = await jsonFiles(reviewRoot, true);
const reviewSourceIds = new Set();
let orphanReviewCount = 0;
let needsRecheckCount = 0;
for (const file of reviewFiles) {
  const dataset = JSON.parse(await fs.readFile(file, "utf8"));
  errors.push(
    ...validateRealworldReviewDataset(dataset, registry, infoEventIds, file),
  );
  if (reviewSourceIds.has(dataset.sourceRegistryId)) {
    errors.push(`${file}: sourceRegistryIdのレビュー台帳が重複しています。`);
  }
  reviewSourceIds.add(dataset.sourceRegistryId);
  if (path.basename(file, ".json") !== dataset.sourceRegistryId) {
    errors.push(`${file}: ファイル名とsourceRegistryIdが一致しません。`);
  }
  const intakeItems = new Map(
    (intakeBySource.get(dataset.sourceRegistryId)?.items ?? []).map((item) => [
      item.id,
      item,
    ]),
  );
  dataset.decisions?.forEach((decision) => {
    const candidate = intakeItems.get(decision.intakeId);
    if (!candidate) orphanReviewCount += 1;
    else if (candidate.contentHash !== decision.reviewedContentHash) {
      needsRecheckCount += 1;
    }
  });
}

if (errors.length) {
  throw new Error(
    `Real-world intake validation failed:\n${errors
      .map((error) => `- ${error}`)
      .join("\n")}`,
  );
}

console.log(
  `Real-world source registry, ${intakeFiles.length} intake file(s), and ${reviewFiles.length} review file(s) passed validation.`,
);
const duplicateResources = [...resources.values()].filter(
  (references) => references.length > 1,
);
console.log(
  `Cross-source duplicate detection found ${duplicateResources.length} shared resource(s).`,
);
console.log(
  `Review ledger found ${needsRecheckCount} recheck item(s) and ${orphanReviewCount} orphan decision(s).`,
);
