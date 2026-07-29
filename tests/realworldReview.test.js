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

async function currentInputs() {
  const root = path.join(projectRoot, "data/raw/realworld_events");
  return {
    registry: await readJson(path.join(root, "source-registry.json")),
    intakeDatasets: await readJsonDirectory(path.join(root, "intake")),
    infoEventDatasets: [
      await readJson(path.join(root, "published.json")),
      ...(await readJsonDirectory(path.join(root, "unreviewed"))),
    ],
    reviewDatasets: await readJsonDirectory(
      path.join(root, "reviews"),
      true,
    ),
  };
}

async function buildCurrentInventory() {
  return buildRealworldReviewInventory(await currentInputs());
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
    expect(inventory.summary.reviewDecisionCounts).toMatchObject({
      pending: inventory.summary.candidateCount,
      include: 0,
      exclude: 0,
      defer: 0,
    });
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

  it("derives a deterministic mixed pilot batch without recording decisions", async () => {
    const inventory = await buildCurrentInventory();
    const pilotKeys = new Set(
      inventory.pilotBatch.candidates.map(
        (item) => `${item.sourceRegistryId}\0${item.intakeId}`,
      ),
    );

    expect(pilotKeys.size).toBe(inventory.summary.pilotCandidateCount);
    expect(inventory.summary.pilotCandidateCount).toBe(15);
    expect(
      inventory.candidates.filter((item) =>
        item.pilotReasons.includes("website"),
      ),
    ).toHaveLength(3);
    expect(
      inventory.candidates.filter((item) =>
        item.pilotReasons.includes("latest-playlist"),
      ),
    ).toHaveLength(10);
    expect(
      inventory.candidates.filter((item) =>
        item.pilotReasons.includes("newest-exact-title-group"),
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("reports changed and orphaned decisions without deleting them", async () => {
    const inputs = await currentInputs();
    const officialSite = inputs.intakeDatasets
      .find(
        (dataset) =>
          dataset.sourceRegistryId === "origin_gakumas_official_site",
      )
      .items[0];
    inputs.reviewDatasets = [
      {
        schemaVersion: 1,
        sourceRegistryId: "origin_gakumas_official_site",
        decisions: [
          {
            intakeId: officialSite.id,
            decision: "include",
            reviewedAt: "2026-07-29T12:00:00.000Z",
            reviewedBy: "maintainer",
            reviewedContentHash: "f".repeat(64),
            infoEventIds: [],
          },
          {
            intakeId: `intake_${"0".repeat(64)}`,
            decision: "exclude",
            reason: "not_an_event",
            reviewedAt: "2026-07-29T12:00:00.000Z",
            reviewedBy: "maintainer",
            reviewedContentHash: "e".repeat(64),
            infoEventIds: [],
          },
        ],
      },
    ];
    const inventory = buildRealworldReviewInventory(inputs);

    expect(inventory.summary.needsRecheckCount).toBe(1);
    expect(inventory.summary.orphanReviewCount).toBe(1);
    expect(inventory.summary.reviewDecisionCounts.include).toBe(1);
    expect(inventory.orphanReviews).toEqual([
      expect.objectContaining({
        intakeId: `intake_${"0".repeat(64)}`,
        decision: "exclude",
      }),
    ]);
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
