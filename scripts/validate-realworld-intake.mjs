import fs from "node:fs/promises";
import path from "node:path";
import {
  validateIntakeDataset,
  validateSourceRegistry,
} from "../src/data/realworldIntakeModel.js";

const registryPath = "data/raw/realworld_events/source-registry.json";
const intakeRoot = "data/raw/realworld_events/intake";
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
const errors = validateSourceRegistry(registry, registryPath);
const resources = new Map();
let files = [];

try {
  files = (await fs.readdir(intakeRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(intakeRoot, entry.name))
    .sort((a, b) => a.localeCompare(b, "en"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const file of files) {
  const dataset = JSON.parse(await fs.readFile(file, "utf8"));
  errors.push(...validateIntakeDataset(dataset, registry, file));
  dataset.items?.forEach((item) => {
    const references = resources.get(item.resourceKey) ?? [];
    references.push({
      sourceRegistryId: dataset.sourceRegistryId,
      intakeId: item.id,
    });
    resources.set(item.resourceKey, references);
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
  `Real-world source registry and ${files.length} intake file(s) passed validation.`,
);
const duplicateResources = [...resources.values()].filter(
  (references) => references.length > 1,
);
console.log(
  `Cross-source duplicate detection found ${duplicateResources.length} shared resource(s).`,
);
