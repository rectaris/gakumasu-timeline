import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValidIntakeDataset,
  assertValidSourceRegistry,
} from "../src/data/realworldIntakeModel.js";
import { assertValidRealworldHistoryData } from "../src/data/realworldHistoryModel.js";
import { assertValidRealworldReviewDataset } from "../src/data/realworldReviewDecisionModel.js";

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function readJsonDirectory(directory, optional = false) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (optional && error.code === "ENOENT") return [];
    throw error;
  }
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .map((entry) => readJson(path.join(directory, entry.name))),
  );
}

async function writeJsonAtomic(target, value) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}`;
  try {
    await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
      flag: "wx",
    });
    await fs.rename(temporary, target);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

function parseArgs(args) {
  const options = { infoEventIds: [], dryRun: false };
  const valueOptions = new Map([
    ["--source", "sourceRegistryId"],
    ["--intake", "intakeId"],
    ["--decision", "decision"],
    ["--reason", "reason"],
    ["--note", "note"],
    ["--reviewed-by", "reviewedBy"],
  ]);

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (argument === "--info-event") {
      const value = args[index + 1];
      if (!value) throw new Error("--info-eventには値が必要です。");
      options.infoEventIds.push(value);
      index += 1;
      continue;
    }
    const key = valueOptions.get(argument);
    if (!key) throw new Error(`未対応の引数です: ${argument}`);
    const value = args[index + 1];
    if (!value) throw new Error(`${argument}には値が必要です。`);
    options[key] = value;
    index += 1;
  }

  for (const required of [
    "sourceRegistryId",
    "intakeId",
    "decision",
    "reviewedBy",
  ]) {
    if (!options[required]) {
      throw new Error(`必須引数がありません: ${required}`);
    }
  }
  return options;
}

export async function recordRealworldReviewDecision({
  projectRoot = process.cwd(),
  sourceRegistryId,
  intakeId,
  decision,
  reason,
  note,
  reviewedBy,
  infoEventIds = [],
  now = new Date(),
  dryRun = false,
}) {
  const root = path.join(projectRoot, "data/raw/realworld_events");
  const registry = assertValidSourceRegistry(
    await readJson(path.join(root, "source-registry.json")),
    "review decision source registry",
  );
  if (!registry.sources.some((source) => source.id === sourceRegistryId)) {
    throw new Error(`未登録の取得元です: ${sourceRegistryId}`);
  }

  const intakePath = path.join(
    root,
    "intake",
    `${sourceRegistryId}.json`,
  );
  const intake = assertValidIntakeDataset(
    await readJson(intakePath),
    registry,
    intakePath,
  );
  const candidate = intake.items.find((item) => item.id === intakeId);
  if (!candidate) {
    throw new Error(
      `${sourceRegistryId}に候補が存在しません: ${intakeId}`,
    );
  }

  const infoEventDatasets = [
    await readJson(path.join(root, "published.json")),
    ...(await readJsonDirectory(path.join(root, "unreviewed"), true)),
  ];
  const knownInfoEventIds = new Set();
  for (const dataset of infoEventDatasets) {
    assertValidRealworldHistoryData(
      dataset,
      `review decision InfoEvent ${dataset.dataset?.id ?? "unknown"}`,
    );
    dataset.events.forEach((event) => knownInfoEventIds.add(event.id));
  }

  const target = path.join(
    root,
    "reviews",
    `${sourceRegistryId}.json`,
  );
  let reviewDataset;
  try {
    reviewDataset = await readJson(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    reviewDataset = {
      schemaVersion: 1,
      sourceRegistryId,
      decisions: [],
    };
  }
  if (reviewDataset.sourceRegistryId !== sourceRegistryId) {
    throw new Error(
      `${target}: ファイル名とsourceRegistryIdが一致しません。`,
    );
  }

  const entry = {
    intakeId,
    decision,
    ...(reason ? { reason } : {}),
    ...(note ? { note } : {}),
    reviewedAt: now.toISOString(),
    reviewedBy,
    reviewedContentHash: candidate.contentHash,
    infoEventIds: [...new Set(infoEventIds)].sort((left, right) =>
      left.localeCompare(right, "en"),
    ),
  };
  const decisions = reviewDataset.decisions.filter(
    (item) => item.intakeId !== intakeId,
  );
  decisions.push(entry);
  decisions.sort((left, right) =>
    left.intakeId.localeCompare(right.intakeId, "en"),
  );
  const nextDataset = {
    schemaVersion: 1,
    sourceRegistryId,
    decisions,
  };
  assertValidRealworldReviewDataset(
    nextDataset,
    registry,
    knownInfoEventIds,
    target,
  );
  if (!dryRun) await writeJsonAtomic(target, nextDataset);

  return { target, entry, dryRun };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await recordRealworldReviewDecision(options);
  console.log(
    `${result.dryRun ? "Validated" : "Recorded"} ${result.entry.decision}: ${options.sourceRegistryId} / ${options.intakeId}`,
  );
  if (result.dryRun) console.log("No review file was changed.");
  else console.log(`Review dataset: ${result.target}`);
}

const entrypoint = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (entrypoint) {
  await main();
}
