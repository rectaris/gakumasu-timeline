import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertValidIntakeDataset,
  assertValidSourceRegistry,
  isEligibleForSource,
} from "../src/data/realworldIntakeModel.js";

const DEFAULT_REGISTRY = "data/raw/realworld_events/source-registry.json";
const DEFAULT_OUTPUT_ROOT = "data/raw/realworld_events/intake";
const DEFAULT_ARTIFACT_ROOT = ".agent-artifacts/realworld-ingest";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function intakeId(sourceId, externalId) {
  return `intake_${sha256(`${sourceId}\0${externalId}`)}`;
}

function canonicalTimestamp(value) {
  if (!value) return undefined;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? undefined : timestamp.toISOString();
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function htmlText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function htmlTitle(html, fallback) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeHtml(match?.[1]?.replace(/\s+/g, " ").trim() || fallback);
}

function matchMetadata(source, text) {
  const eligible = isEligibleForSource(source, text);
  return {
    eligible,
    reasons:
      source.scopeMode === "all"
        ? ["allowlisted-source"]
        : eligible
          ? source.keywords.filter((keyword) => text.includes(keyword))
          : ["no-explicit-gakumas-keyword"],
  };
}

function createItem(source, {
  externalId,
  resourceType,
  canonicalUrl,
  title,
  summary = "",
  publishedAt,
  retrievedAt,
  contentHash,
}) {
  const matchText = `${title}\n${summary}`;
  const resourceNamespace =
    resourceType === "youtube-video"
      ? "youtube"
      : resourceType === "x-post"
        ? "x"
        : "web";
  return {
    id: intakeId(source.id, externalId),
    resourceType,
    externalId,
    resourceKey: `${resourceNamespace}:${externalId}`,
    canonicalUrl,
    title: title.trim(),
    summary: summary.trim().slice(0, 600),
    ...(publishedAt ? { publishedAt: canonicalTimestamp(publishedAt) } : {}),
    retrievedAt,
    contentHash,
    match: matchMetadata(source, matchText),
  };
}

async function fetchChecked(url, options = {}) {
  const safeUrl = new URL(url);
  if (safeUrl.searchParams.has("key")) {
    safeUrl.searchParams.set("key", "[redacted]");
  }
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(`Request failed: ${safeUrl.toString()}`);
  }
  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${safeUrl.toString()}`,
    );
  }
  return response;
}

async function writeArtifact(context, filename, content) {
  if (!context.artifactDirectory) return;
  const target = path.join(context.artifactDirectory, filename);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  context.artifacts.push(path.relative(context.artifactDirectory, target));
}

async function fetchJson(context, url, options, artifactName) {
  const response = await fetchChecked(url, options);
  const text = await response.text();
  await writeArtifact(context, artifactName, text);
  return JSON.parse(text);
}

export async function collectWebsite(source, context) {
  const urls = source.discoveryUrls ?? [source.url];
  const items = [];
  for (let index = 0; index < urls.length; index += 1) {
    const pageUrl = urls[index];
    const response = await fetchChecked(pageUrl, {
      headers: {
        "user-agent": "gakumasu-timeline-source-review/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const html = await response.text();
    await writeArtifact(context, `${source.id}/page-${index + 1}.html`, html);
    const text = htmlText(html);
    items.push(
      createItem(source, {
        externalId: response.url || pageUrl,
        resourceType: "web-page",
        canonicalUrl: response.url || pageUrl,
        title: htmlTitle(html, source.label),
        summary: text,
        retrievedAt: context.retrievedAt,
        contentHash: sha256(html),
      }),
    );
  }
  return items;
}

async function youtubePlaylistItems(source, playlistId, context) {
  const items = [];
  let pageToken = "";
  for (let page = 1; page <= context.maxPages; page += 1) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails,status");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", context.youtubeApiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const payload = await fetchJson(
      context,
      url,
      {},
      `${source.id}/playlist-items-${page}.json`,
    );
    payload.items?.forEach((item) => {
      const videoId =
        item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (!videoId || item.status?.privacyStatus === "private") return;
      const title = item.snippet?.title || videoId;
      const summary = item.snippet?.description || "";
      items.push(
        createItem(source, {
          externalId: videoId,
          resourceType: "youtube-video",
          canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
          title,
          summary,
          publishedAt:
            item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt,
          retrievedAt: context.retrievedAt,
          contentHash: sha256(JSON.stringify(item)),
        }),
      );
    });
    pageToken = payload.nextPageToken || "";
    if (!pageToken) break;
  }
  return items;
}

export async function collectYouTube(source, context) {
  if (!context.youtubeApiKey) {
    return { skipped: "YOUTUBE_API_KEY is not set", items: [] };
  }
  if (source.platform === "youtube-playlist") {
    return {
      skipped: null,
      items: await youtubePlaylistItems(source, source.externalId, context),
    };
  }
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("forHandle", source.externalId.replace(/^@/, ""));
  url.searchParams.set("key", context.youtubeApiKey);
  const channel = await fetchJson(
    context,
    url,
    {},
    `${source.id}/channel.json`,
  );
  const playlistId =
    channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    throw new Error(`${source.id}: YouTube upload playlist was not found.`);
  }
  return {
    skipped: null,
    items: await youtubePlaylistItems(source, playlistId, context),
  };
}

export async function collectX(source, context) {
  if (!context.xBearerToken) {
    return { skipped: "X_BEARER_TOKEN is not set", items: [] };
  }
  const headers = { authorization: `Bearer ${context.xBearerToken}` };
  const user = await fetchJson(
    context,
    `https://api.x.com/2/users/by/username/${encodeURIComponent(source.externalId)}`,
    { headers },
    `${source.id}/user.json`,
  );
  const userId = user.data?.id;
  if (!userId) throw new Error(`${source.id}: X user ID was not found.`);
  const items = [];
  let paginationToken = "";
  for (let page = 1; page <= context.maxPages; page += 1) {
    const url = new URL(`https://api.x.com/2/users/${userId}/tweets`);
    url.searchParams.set("max_results", "100");
    url.searchParams.set("tweet.fields", "created_at,entities,attachments");
    url.searchParams.set("exclude", "retweets,replies");
    if (paginationToken) {
      url.searchParams.set("pagination_token", paginationToken);
    }
    const payload = await fetchJson(
      context,
      url,
      { headers },
      `${source.id}/posts-${page}.json`,
    );
    payload.data?.forEach((post) => {
      const text = post.text || post.id;
      items.push(
        createItem(source, {
          externalId: post.id,
          resourceType: "x-post",
          canonicalUrl: `https://x.com/${source.externalId}/status/${post.id}`,
          title: text.split("\n")[0].slice(0, 160),
          summary: text,
          publishedAt: post.created_at,
          retrievedAt: context.retrievedAt,
          contentHash: sha256(JSON.stringify(post)),
        }),
      );
    });
    paginationToken = payload.meta?.next_token || "";
    if (!paginationToken) break;
  }
  return { skipped: null, items };
}

async function loadRegistry(registryPath) {
  const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
  return assertValidSourceRegistry(registry, registryPath);
}

function parseArgs(argv) {
  const options = {
    registry: DEFAULT_REGISTRY,
    outputRoot: DEFAULT_OUTPUT_ROOT,
    artifactRoot: DEFAULT_ARTIFACT_ROOT,
    sourceIds: [],
    maxPages: 2,
    artifacts: true,
    requireAll: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") options.sourceIds.push(argv[++index]);
    else if (arg === "--registry") options.registry = argv[++index];
    else if (arg === "--output-root") options.outputRoot = argv[++index];
    else if (arg === "--artifact-root") options.artifactRoot = argv[++index];
    else if (arg === "--max-pages") options.maxPages = Number(argv[++index]);
    else if (arg === "--no-artifacts") options.artifacts = false;
    else if (arg === "--require-all") options.requireAll = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.maxPages) || options.maxPages < 1) {
    throw new Error("--max-pages must be a positive integer.");
  }
  return options;
}

export async function collectSources(options, environment = process.env) {
  const registry = await loadRegistry(options.registry);
  const selected = options.sourceIds.length
    ? registry.sources.filter((source) => options.sourceIds.includes(source.id))
    : registry.sources;
  const unknown = options.sourceIds.filter(
    (sourceId) => !registry.sources.some((source) => source.id === sourceId),
  );
  if (unknown.length) throw new Error(`Unknown source ID: ${unknown.join(", ")}`);

  const retrievedAt = new Date().toISOString();
  const runId = retrievedAt.replace(/[-:.]/g, "").replace("Z", "Z");
  const artifactDirectory = options.artifacts
    ? path.join(options.artifactRoot, runId)
    : null;
  const context = {
    retrievedAt,
    maxPages: options.maxPages,
    youtubeApiKey: environment.YOUTUBE_API_KEY || "",
    xBearerToken: environment.X_BEARER_TOKEN || "",
    artifactDirectory,
    artifacts: [],
  };
  const results = [];
  for (const source of selected) {
    let collection;
    if (source.acquisition === "website") {
      collection = { skipped: null, items: await collectWebsite(source, context) };
    } else if (source.acquisition === "youtube-data-api") {
      collection = await collectYouTube(source, context);
    } else {
      collection = await collectX(source, context);
    }
    if (collection.skipped && options.requireAll) {
      throw new Error(`${source.id}: ${collection.skipped}`);
    }
    const dataset = {
      schemaVersion: 1,
      sourceRegistryId: source.id,
      collectedAt: retrievedAt,
      status: collection.skipped ? "skipped" : "collected",
      ...(collection.skipped ? { skipReason: collection.skipped } : {}),
      items: collection.items.sort((a, b) =>
        a.externalId.localeCompare(b.externalId, "en"),
      ),
    };
    assertValidIntakeDataset(dataset, registry, source.id);
    await fs.mkdir(options.outputRoot, { recursive: true });
    await fs.writeFile(
      path.join(options.outputRoot, `${source.id}.json`),
      `${JSON.stringify(dataset, null, 2)}\n`,
    );
    results.push({
      sourceId: source.id,
      status: dataset.status,
      itemCount: dataset.items.length,
      eligibleCount: dataset.items.filter((item) => item.match.eligible).length,
      skipReason: collection.skipped,
    });
  }
  if (artifactDirectory) {
    await fs.mkdir(artifactDirectory, { recursive: true });
    await fs.writeFile(
      path.join(artifactDirectory, "manifest.json"),
      `${JSON.stringify(
        {
          run_id: runId,
          created_at: retrievedAt,
          task: "real-world official source intake",
          plans: ["docs/plan/active/075-realworld-official-source-intake.md"],
          artifacts: context.artifacts,
          redaction_report: "redaction-report.md",
          pinned: false,
        },
        null,
        2,
      )}\n`,
    );
    await fs.writeFile(
      path.join(artifactDirectory, "redaction-report.md"),
      [
        "# Redaction report",
        "",
        "- Credentials and environment values were not written.",
        "- HTTP authorization headers and request URLs containing API keys were not written.",
        "- Full fetched payloads remain local under this run directory.",
        "- Public response bodies were stored as received and must be reviewed before sharing.",
        "",
      ].join("\n"),
    );
  }
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const results = await collectSources(options);
  results.forEach((result) => {
    const detail = result.skipReason
      ? `skipped (${result.skipReason})`
      : `${result.itemCount} item(s), ${result.eligibleCount} eligible`;
    console.log(`${result.sourceId}: ${detail}`);
  });
}

const entrypoint = process.argv[1] ? fileURLToPath(import.meta.url) : "";
if (entrypoint && path.resolve(process.argv[1]) === entrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
