import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateRealworldReviewDataset } from "../src/data/realworldReviewDecisionModel.js";
import { recordRealworldReviewDecision } from "../scripts/set-realworld-review-decision.mjs";

const INTAKE_ID = `intake_${"a".repeat(64)}`;
const INFO_EVENT_ID = "info_11111111-1111-4111-8111-111111111111";
const CONTENT_HASH = "b".repeat(64);
const temporaryDirectories = [];

function fixtureRegistry() {
  return {
    schemaVersion: 1,
    sources: [
      {
        id: "origin_fixture",
        label: "Fixture official site",
        platform: "website",
        ownerScope: "gakumas",
        url: "https://example.com/",
        acquisition: "website",
        externalId: "example.com",
        scopeMode: "all",
        keywords: [],
      },
    ],
  };
}

function fixtureDecision(overrides = {}) {
  return {
    intakeId: INTAKE_ID,
    decision: "include",
    reviewedAt: "2026-07-29T12:00:00.000Z",
    reviewedBy: "maintainer",
    reviewedContentHash: CONTENT_HASH,
    infoEventIds: [INFO_EVENT_ID],
    ...overrides,
  };
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function createFixtureProject() {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "gakumas-review-decision-"),
  );
  temporaryDirectories.push(projectRoot);
  const root = path.join(projectRoot, "data/raw/realworld_events");
  await writeJson(path.join(root, "source-registry.json"), fixtureRegistry());
  await writeJson(path.join(root, "intake/origin_fixture.json"), {
    schemaVersion: 1,
    sourceRegistryId: "origin_fixture",
    collectedAt: "2026-07-29T11:00:00.000Z",
    status: "collected",
    items: [
      {
        id: INTAKE_ID,
        resourceType: "web-page",
        externalId: "https://example.com/item",
        resourceKey: "web:https://example.com/item",
        canonicalUrl: "https://example.com/item",
        title: "Fixture item",
        summary: "",
        retrievedAt: "2026-07-29T11:00:00.000Z",
        contentHash: CONTENT_HASH,
        match: { eligible: true, reasons: ["allowlisted-source"] },
      },
    ],
  });
  await writeJson(path.join(root, "published.json"), {
    dataset: {
      id: "fixture-published",
      label: "Fixture",
      status: "published",
      version: 1,
      timezone: "Asia/Tokyo",
    },
    events: [],
  });
  return projectRoot;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("real-world review decision contract", () => {
  it("accepts an included candidate with multiple known InfoEvent links", () => {
    const secondInfoEventId =
      "info_22222222-2222-4222-8222-222222222222";
    const errors = validateRealworldReviewDataset(
      {
        schemaVersion: 1,
        sourceRegistryId: "origin_fixture",
        decisions: [
          fixtureDecision({
            infoEventIds: [INFO_EVENT_ID, secondInfoEventId],
          }),
        ],
      },
      fixtureRegistry(),
      new Set([INFO_EVENT_ID, secondInfoEventId]),
    );

    expect(errors).toEqual([]);
  });

  it("requires controlled reasons and a note for other", () => {
    const dataset = {
      schemaVersion: 1,
      sourceRegistryId: "origin_fixture",
      decisions: [
        fixtureDecision({
          decision: "exclude",
          reason: "other",
          infoEventIds: [],
        }),
      ],
    };

    expect(
      validateRealworldReviewDataset(
        dataset,
        fixtureRegistry(),
        new Set(),
      ),
    ).toEqual([expect.stringContaining("reasonがotherの場合は必須")]);
  });

  it("rejects unknown InfoEvent links", () => {
    expect(
      validateRealworldReviewDataset(
        {
          schemaVersion: 1,
          sourceRegistryId: "origin_fixture",
          decisions: [fixtureDecision()],
        },
        fixtureRegistry(),
        new Set(),
      ),
    ).toEqual([expect.stringContaining("存在するInfoEventだけを参照")]);
  });

  it("validates a decision without writing during a dry run", async () => {
    const projectRoot = await createFixtureProject();
    const result = await recordRealworldReviewDecision({
      projectRoot,
      sourceRegistryId: "origin_fixture",
      intakeId: INTAKE_ID,
      decision: "exclude",
      reason: "not_an_event",
      reviewedBy: "maintainer",
      now: new Date("2026-07-29T12:00:00.000Z"),
      dryRun: true,
    });

    expect(result).toMatchObject({
      dryRun: true,
      entry: {
        intakeId: INTAKE_ID,
        decision: "exclude",
        reviewedContentHash: CONTENT_HASH,
      },
    });
    await expect(
      fs.access(
        path.join(
          projectRoot,
          "data/raw/realworld_events/reviews/origin_fixture.json",
        ),
      ),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("writes and replaces one explicit per-source decision", async () => {
    const projectRoot = await createFixtureProject();
    const input = {
      projectRoot,
      sourceRegistryId: "origin_fixture",
      intakeId: INTAKE_ID,
      reviewedBy: "maintainer",
    };
    await recordRealworldReviewDecision({
      ...input,
      decision: "exclude",
      reason: "not_an_event",
      now: new Date("2026-07-29T12:00:00.000Z"),
    });
    await recordRealworldReviewDecision({
      ...input,
      decision: "defer",
      reason: "needs_source_review",
      now: new Date("2026-07-29T13:00:00.000Z"),
    });

    const dataset = JSON.parse(
      await fs.readFile(
        path.join(
          projectRoot,
          "data/raw/realworld_events/reviews/origin_fixture.json",
        ),
        "utf8",
      ),
    );
    expect(dataset.decisions).toEqual([
      expect.objectContaining({
        intakeId: INTAKE_ID,
        decision: "defer",
        reason: "needs_source_review",
        reviewedAt: "2026-07-29T13:00:00.000Z",
        reviewedContentHash: CONTENT_HASH,
      }),
    ]);
  });
});
