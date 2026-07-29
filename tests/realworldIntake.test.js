import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import registry from "../data/raw/realworld_events/source-registry.json";
import {
  isEligibleForSource,
  validateIntakeDataset,
  validateSourceRegistry,
} from "../src/data/realworldIntakeModel";
import {
  collectSources,
  collectYouTube,
} from "../scripts/collect-realworld-sources.mjs";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("real-world intake model", () => {
  it("accepts all seven approved source origins", () => {
    expect(validateSourceRegistry(registry)).toEqual([]);
    expect(registry.sources).toHaveLength(7);
  });

  it("filters umbrella sources but trusts explicitly allowlisted sources", () => {
    const portal = registry.sources.find(
      (source) => source.id === "origin_idolmaster_portal",
    );
    const playlist = registry.sources.find(
      (source) => source.id === "origin_imas_gakumas_playlist",
    );
    expect(isEligibleForSource(portal, "学マスの最新情報")).toBe(true);
    expect(isEligibleForSource(portal, "シンデレラガールズの最新情報")).toBe(
      false,
    );
    expect(isEligibleForSource(playlist, "タイトルだけの動画")).toBe(true);
  });

  it("collects a public website into a normalized intake file", async () => {
    const temporaryRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "realworld-intake-"),
    );
    const registryPath = path.join(temporaryRoot, "registry.json");
    const outputRoot = path.join(temporaryRoot, "intake");
    const websiteSource = structuredClone(registry.sources[0]);
    delete websiteSource.discoveryUrls;
    const testRegistry = {
      schemaVersion: 1,
      sources: [websiteSource],
    };
    await fs.writeFile(registryPath, JSON.stringify(testRegistry));
    global.fetch = vi.fn(async () =>
      new Response(
        "<html><head><title>公式情報</title></head><body>学マス更新</body></html>",
        { status: 200 },
      ),
    );

    const results = await collectSources(
      {
        registry: registryPath,
        outputRoot,
        artifactRoot: path.join(temporaryRoot, "artifacts"),
        sourceIds: [],
        maxPages: 1,
        artifacts: false,
        requireAll: false,
      },
      {},
    );
    expect(results).toEqual([
      expect.objectContaining({ status: "collected", itemCount: 1 }),
    ]);
    const dataset = JSON.parse(
      await fs.readFile(
        path.join(outputRoot, "origin_gakumas_official_site.json"),
        "utf8",
      ),
    );
    expect(validateIntakeDataset(dataset, testRegistry)).toEqual([]);
    expect(dataset.items[0]).toEqual(
      expect.objectContaining({
        resourceType: "web-page",
        resourceKey: "web:https://gakuen.idolmaster-official.jp/",
        title: "公式情報",
      }),
    );
  });

  it("does not expose a YouTube API key in an HTTP error", async () => {
    global.fetch = vi.fn(async () =>
      new Response("forbidden", { status: 403, statusText: "Forbidden" }),
    );
    const source = registry.sources.find(
      (item) => item.id === "origin_hatsuboshi_youtube",
    );
    await expect(
      collectYouTube(source, {
        youtubeApiKey: "super-secret-key",
        retrievedAt: "2026-07-29T00:00:00.000Z",
        maxPages: 1,
        artifactDirectory: null,
        artifacts: [],
      }),
    ).rejects.not.toThrow(/super-secret-key/);
  });
});
