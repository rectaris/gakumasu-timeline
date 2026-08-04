import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import registry from "../data/raw/realworld_events/source-registry.json";
import youtubeSnapshot from "../data/raw/realworld_events/intake/origin_hatsuboshi_youtube.json";
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

function youtubeItem(videoId, title, publishedAt) {
  return {
    snippet: {
      title,
      description: `${title} description`,
      resourceId: { videoId },
      publishedAt,
    },
    contentDetails: {
      videoId,
      videoPublishedAt: publishedAt,
    },
    status: { privacyStatus: "public" },
  };
}

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

  it("requires bounded pagination metadata for successful YouTube datasets", () => {
    const missingPagination = structuredClone(youtubeSnapshot);
    missingPagination.status = "collected";
    delete missingPagination.pagination;
    expect(
      validateIntakeDataset(missingPagination, registry).some((error) =>
        error.includes("YouTubeの取得成功データ"),
      ),
    ).toBe(true);

    const overLimit = structuredClone(youtubeSnapshot);
    overLimit.pagination.pagesFetched =
      overLimit.pagination.pageLimit + 1;
    const errors = validateIntakeDataset(overLimit, registry);
    expect(
      errors.some((error) => error.includes("pageLimit以下")),
    ).toBe(true);
    expect(
      errors.some((error) => error.includes("pageLimitと一致")),
    ).toBe(true);
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
        "<html><head><title>公式&amp;lt;情報&amp;gt;</title></head><body>学マス更新<script>alert('bad')</script >本文</body></html>",
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
        title: "公式&lt;情報&gt;",
      }),
    );
    expect(dataset.items[0].summary).toContain("学マス更新 本文");
    expect(dataset.items[0].summary).not.toContain("alert");
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

  it("marks capped YouTube collection partial and preserves older candidates", async () => {
    const temporaryRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "realworld-youtube-partial-"),
    );
    const registryPath = path.join(temporaryRoot, "registry.json");
    const outputRoot = path.join(temporaryRoot, "intake");
    const playlistSource = structuredClone(
      registry.sources.find(
        (item) => item.id === "origin_imas_gakumas_playlist",
      ),
    );
    const testRegistry = { schemaVersion: 1, sources: [playlistSource] };
    await fs.writeFile(registryPath, JSON.stringify(testRegistry));

    const newer = youtubeItem(
      "newVideo001",
      "新しい動画",
      "2026-07-29T00:00:00Z",
    );
    const older = youtubeItem(
      "oldVideo001",
      "古い動画",
      "2026-07-28T00:00:00Z",
    );
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ items: [newer], nextPageToken: "next-page" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [older] }), { status: 200 }),
      );

    const options = {
      registry: registryPath,
      outputRoot,
      artifactRoot: path.join(temporaryRoot, "artifacts"),
      sourceIds: [],
      maxPages: 2,
      artifacts: false,
      requireAll: false,
    };
    const complete = await collectSources(options, {
      YOUTUBE_API_KEY: "test-key",
    });
    expect(complete[0]).toEqual(
      expect.objectContaining({ status: "collected", itemCount: 2 }),
    );

    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ items: [newer], nextPageToken: "still-more" }),
        { status: 200 },
      ),
    );
    const partial = await collectSources(
      { ...options, maxPages: 1 },
      { YOUTUBE_API_KEY: "test-key" },
    );
    expect(partial[0]).toEqual(
      expect.objectContaining({
        status: "partial",
        itemCount: 2,
        preservedExisting: true,
      }),
    );
    const dataset = JSON.parse(
      await fs.readFile(
        path.join(outputRoot, `${playlistSource.id}.json`),
        "utf8",
      ),
    );
    expect(dataset.pagination).toEqual({
      pagesFetched: 1,
      pageLimit: 1,
      nextPageAvailable: true,
      fetchedItemCount: 1,
      retainedItemCount: 1,
    });
    expect(dataset.items.map((item) => item.externalId).sort()).toEqual([
      "newVideo001",
      "oldVideo001",
    ]);
    expect(validateIntakeDataset(dataset, testRegistry)).toEqual([]);
  });

  it("continues after one source fails and preserves its valid dataset", async () => {
    const temporaryRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "realworld-source-failure-"),
    );
    const registryPath = path.join(temporaryRoot, "registry.json");
    const outputRoot = path.join(temporaryRoot, "intake");
    const first = structuredClone(registry.sources[0]);
    Object.assign(first, {
      id: "origin_first_site",
      url: "https://first.example/",
      externalId: "first.example",
      discoveryUrls: ["https://first.example/"],
    });
    const second = structuredClone(registry.sources[0]);
    Object.assign(second, {
      id: "origin_second_site",
      url: "https://second.example/",
      externalId: "second.example",
      discoveryUrls: ["https://second.example/"],
    });
    const testRegistry = { schemaVersion: 1, sources: [first, second] };
    await fs.writeFile(registryPath, JSON.stringify(testRegistry));
    global.fetch = vi.fn(async (url) =>
      new Response(
        `<html><title>${new URL(url).hostname}</title><body>初回</body></html>`,
        { status: 200 },
      ),
    );
    const options = {
      registry: registryPath,
      outputRoot,
      artifactRoot: path.join(temporaryRoot, "artifacts"),
      sourceIds: [],
      maxPages: 1,
      artifacts: false,
      requireAll: false,
    };
    await collectSources(options, {});
    const firstPath = path.join(outputRoot, `${first.id}.json`);
    const firstBeforeFailure = await fs.readFile(firstPath, "utf8");

    global.fetch = vi.fn(async (url) =>
      String(url).includes("first.example")
        ? new Response("failure", { status: 500 })
        : new Response(
            "<html><title>second updated</title><body>更新</body></html>",
            { status: 200 },
          ),
    );
    const results = await collectSources(options, {});
    expect(results).toEqual([
      expect.objectContaining({
        sourceId: first.id,
        status: "failed",
        failureKind: "http-error",
        preservedExisting: true,
      }),
      expect.objectContaining({
        sourceId: second.id,
        status: "collected",
      }),
    ]);
    expect(await fs.readFile(firstPath, "utf8")).toBe(firstBeforeFailure);
    const secondDataset = JSON.parse(
      await fs.readFile(path.join(outputRoot, `${second.id}.json`), "utf8"),
    );
    expect(secondDataset.items[0].title).toBe("second updated");
  });

  it("skips a paused X source before making a network request", async () => {
    const temporaryRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "realworld-paused-x-"),
    );
    const registryPath = path.join(temporaryRoot, "registry.json");
    const outputRoot = path.join(temporaryRoot, "intake");
    const xSource = structuredClone(
      registry.sources.find((item) => item.id === "origin_gakumas_x"),
    );
    const testRegistry = { schemaVersion: 1, sources: [xSource] };
    await fs.writeFile(registryPath, JSON.stringify(testRegistry));
    global.fetch = vi.fn();

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
      { X_BEARER_TOKEN: "unused-token" },
    );
    expect(results[0]).toEqual(
      expect.objectContaining({
        status: "skipped",
        skipReason: "Xからのデータ取得は保留中です。",
      }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
    const dataset = JSON.parse(
      await fs.readFile(path.join(outputRoot, `${xSource.id}.json`), "utf8"),
    );
    expect(validateIntakeDataset(dataset, testRegistry)).toEqual([]);
  });
});
