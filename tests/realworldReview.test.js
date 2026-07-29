import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildRealworldReviewInventory,
  normalizeReviewTitle,
} from "../src/data/realworldReviewModel.js";
import { generateReviewArtifacts } from "../scripts/generate-realworld-review-inventory.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const temporaryDirectories = [];

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function readJsonDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .map((entry) => readJson(path.join(directory, entry.name))),
  );
}

async function buildCurrentInventory() {
  const root = path.join(projectRoot, "data/raw/realworld_events");
  return buildRealworldReviewInventory({
    registry: await readJson(path.join(root, "source-registry.json")),
    intakeDatasets: await readJsonDirectory(path.join(root, "intake")),
    infoEventDatasets: [
      await readJson(path.join(root, "published.json")),
      ...(await readJsonDirectory(path.join(root, "unreviewed"))),
    ],
  });
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("real-world review inventory", () => {
  it("aggregates every current intake candidate without including paused X sources", async () => {
    const inventory = await buildCurrentInventory();
    const expectedCandidateCount = inventory.sources.reduce(
      (sum, source) => sum + source.candidateCount,
      0,
    );

    expect(inventory.summary.candidateCount).toBe(expectedCandidateCount);
    expect(inventory.summary.candidateCount).toBeGreaterThan(0);
    expect(
      inventory.sources
        .filter((source) => source.platform === "x-account")
        .every(
          (source) =>
            source.collectionState === "paused" &&
            source.intakeStatus === "skipped" &&
            source.candidateCount === 0,
        ),
    ).toBe(true);
  });

  it("uses conservative title normalization and does not infer similar titles", () => {
    expect(normalizeReviewTitle(" ＡＢＣ  Live\n配信 ")).toBe("abc live 配信");
    expect(normalizeReviewTitle("第1話")).not.toBe(
      normalizeReviewTitle("第１話 完全版"),
    );
  });

  it("reports an exact source URL link to the published InfoEvent", async () => {
    const inventory = await buildCurrentInventory();
    const officialSite = inventory.candidates.find(
      (candidate) =>
        candidate.canonicalUrl ===
        "https://gakuen.idolmaster-official.jp/",
    );

    expect(officialSite?.clues.linkedInfoEvents).toEqual([
      expect.objectContaining({
        infoEventId: "info_11111111-1111-4111-8111-111111111111",
        publicationStatus: "published",
      }),
    ]);
  });

  it("writes a local manifest, report, inventory, and redaction report", async () => {
    const outputRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "gakumas-review-"),
    );
    temporaryDirectories.push(outputRoot);
    const result = await generateReviewArtifacts({
      projectRoot,
      outputRoot,
      now: new Date("2026-07-29T12:00:00.000Z"),
      runId: "test-review-inventory",
    });

    const files = await fs.readdir(result.artifactDirectory);
    expect(files.sort()).toEqual([
      "inventory.json",
      "manifest.json",
      "redaction-report.md",
      "summary.md",
    ]);
    const manifest = await readJson(
      path.join(result.artifactDirectory, "manifest.json"),
    );
    expect(manifest).toMatchObject({
      run_id: "test-review-inventory",
      artifacts: ["inventory.json", "summary.md"],
      raw_logs: [],
      pinned: false,
    });
    const redactionReport = await fs.readFile(
      path.join(result.artifactDirectory, "redaction-report.md"),
      "utf8",
    );
    expect(redactionReport).toContain("`.env.local`は読み込みも出力もしていません");
  });
});
