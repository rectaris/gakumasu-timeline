import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  generateDataFiles,
  generatedPathForRaw,
  getGeneratedDataFiles,
} from "./generate-data.mjs";
import {
  formatTimelineDataIntegrityErrors,
  validateTimelineData,
} from "../src/data/integrity.js";
import { worldlines } from "../src/data/worldlines.js";

const EDITOR_API_PREFIX = "/__worldline-editor/api";
const EDITOR_TOKEN_HEADER = "x-worldline-editor-token";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const LOCAL_ADDRESSES = new Set([
  "127.0.0.1",
  "::1",
  "::ffff:127.0.0.1",
  "localhost",
]);

const NEW_FILE_DIRECTORIES = {
  eventCommus: "data/raw/worldline_commu/event_commu",
  hatsuboshiCommus: "data/raw/worldline_commu/hatsuboshi_commu",
  idolCommu: "data/raw/worldline_commu/idol_commu",
  supportCardCommus: "data/raw/worldline_commu/support_story",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSourceFile(sourceFile) {
  return String(sourceFile ?? "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function sortRawFiles(files) {
  return [...files].sort((fileA, fileB) =>
    fileA.raw.localeCompare(fileB.raw, "en"),
  );
}

function categoryLabel(category) {
  return {
    commonTimeline: "共通イベント",
    eventCommus: "イベントコミュ",
    hatsuboshiCommus: "初星コミュ",
    idolCommu: "アイドルコミュ",
    supportCardCommus: "サポートカードコミュ",
  }[category] ?? category;
}

async function readJsonFile(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function readRawLaneFile(root, file) {
  const lane = await readJsonFile(path.resolve(root, file.raw));
  return {
    category: file.category,
    categoryLabel: categoryLabel(file.category),
    sourceFile: file.raw,
    generatedFile: file.generated,
    lane,
  };
}

export async function readWorldlineEditorState({
  root = process.cwd(),
  files = getGeneratedDataFiles(),
} = {}) {
  const lanes = [];

  for (const file of sortRawFiles(files)) {
    lanes.push(await readRawLaneFile(root, file));
  }

  const participantOptions = lanes
    .filter((entry) => entry.category === "idolCommu")
    .map((entry) => ({
      id: entry.lane.id,
      label: entry.lane.name,
      color: entry.lane.color,
    }));

  return {
    lanes,
    options: {
      participants: participantOptions,
      worldlines: worldlines.map((worldline) => ({
        id: worldline.id,
        label: worldline.name,
      })),
      occurrenceTypes: [
        { id: "singleWithinRange", label: "期間内の1日" },
        { id: "continuous", label: "期間" },
      ],
      dateConfidence: [
        { id: "", label: "未指定" },
        { id: "confirmed", label: "確定" },
        { id: "inferred", label: "推定" },
        { id: "rangeOnly", label: "期間内の1日" },
      ],
      sourceBasis: [
        { id: "", label: "未指定" },
        { id: "explicit", label: "明示" },
        { id: "inferred", label: "推定" },
        { id: "mixed", label: "混在" },
        { id: "unknown", label: "未分類" },
      ],
      sourceStatus: [
        { id: "", label: "未指定" },
        { id: "confirmed", label: "確認済み" },
        { id: "inferred", label: "推定根拠" },
        { id: "conflicting", label: "矛盾あり" },
        { id: "unreviewed", label: "未確認" },
        { id: "unsourced", label: "出典なし" },
        { id: "unknown", label: "分類不能" },
      ],
      rangeReason: [
        { id: "", label: "未指定" },
        { id: "monthOnly", label: "月のみ確定" },
        { id: "sourceRange", label: "出典範囲" },
        { id: "chapterOrder", label: "章/話数順" },
        { id: "relativeOrder", label: "前後関係" },
        { id: "unknown", label: "不明" },
      ],
      sourceSupports: [
        { id: "event", label: "イベント" },
        { id: "date", label: "日付" },
        { id: "detail", label: "詳細" },
        { id: "worldline", label: "世界線" },
        { id: "participants", label: "参加者" },
      ],
    },
  };
}

function laneMapFromState(state) {
  return new Map(
    state.lanes.map((entry) => [normalizeSourceFile(entry.sourceFile), clone(entry)]),
  );
}

function findEventIndex(entry, eventId) {
  return entry.lane.events.findIndex((event) => event.id === eventId);
}

function requireEntry(entriesBySource, sourceFile) {
  const normalized = normalizeSourceFile(sourceFile);
  const entry = entriesBySource.get(normalized);
  if (!entry) {
    throw new Error(`Unknown source file: ${sourceFile}`);
  }
  return entry;
}

function categoryForNewSourceFile(category, sourceFile) {
  const directory = NEW_FILE_DIRECTORIES[category];
  const normalized = normalizeSourceFile(sourceFile);

  if (!directory) {
    throw new Error(`Cannot create files for category: ${category}`);
  }

  if (
    !normalized.endsWith(".json") ||
    normalized.includes("..") ||
    path.posix.dirname(normalized) !== directory ||
    !/^[a-zA-Z0-9_-]+\.json$/.test(path.posix.basename(normalized))
  ) {
    throw new Error(`Invalid new source file: ${sourceFile}`);
  }

  return normalized;
}

function requireNewLane(request, targetSourceFile) {
  const newLane = request?.targetNewLane;
  if (!newLane || typeof newLane !== "object") {
    return null;
  }

  const category = String(newLane.category ?? "");
  const sourceFile = categoryForNewSourceFile(category, targetSourceFile);
  const lane = clone(newLane.lane);

  if (!lane || typeof lane !== "object" || Array.isArray(lane)) {
    throw new Error("New file lane must be an object.");
  }

  if (
    typeof lane.id !== "string" ||
    typeof lane.name !== "string" ||
    typeof lane.color !== "string" ||
    !lane.id.trim() ||
    !lane.name.trim() ||
    !lane.color.trim()
  ) {
    throw new Error("New file lane requires id, name, and color.");
  }

  return {
    category,
    categoryLabel: categoryLabel(category),
    sourceFile,
    generatedFile: generatedPathForRaw(sourceFile),
    lane: {
      ...lane,
      id: lane.id.trim(),
      name: lane.name.trim(),
      color: lane.color.trim(),
      events: Array.isArray(lane.events) ? lane.events : [],
    },
  };
}

function targetEntryForRequest(entriesBySource, request, targetSourceFile) {
  const existing = entriesBySource.get(targetSourceFile);
  const newEntry = requireNewLane(request, targetSourceFile);

  if (existing) {
    if (newEntry) {
      throw new Error(`Source file already exists: ${targetSourceFile}`);
    }
    return existing;
  }

  if (!newEntry) {
    return requireEntry(entriesBySource, targetSourceFile);
  }

  entriesBySource.set(targetSourceFile, newEntry);
  return newEntry;
}

function requireEvent(entry, eventId) {
  const index = findEventIndex(entry, eventId);
  if (index === -1) {
    throw new Error(`Event "${eventId}" was not found in ${entry.sourceFile}.`);
  }
  return index;
}

function normalizeEvent(event) {
  const normalized = clone(event);

  [
    "dateConfidence",
    "sourceBasis",
    "sourceStatus",
    "rangeReason",
  ].forEach((field) => {
    if (normalized[field] === "") {
      delete normalized[field];
    }
  });

  [
    "participants",
    "worldlineId",
    "source",
    "sourceDetails",
    "conflicts",
    "note",
  ].forEach((field) => {
    if (Array.isArray(normalized[field]) && normalized[field].length === 0) {
      delete normalized[field];
    }
  });

  return normalized;
}

function insertEvent(entry, event, insertAfterId = null) {
  const normalizedEvent = normalizeEvent(event);

  if (insertAfterId) {
    const insertAfterIndex = findEventIndex(entry, insertAfterId);
    if (insertAfterIndex !== -1) {
      entry.lane.events.splice(insertAfterIndex + 1, 0, normalizedEvent);
      return;
    }
  }

  entry.lane.events.push(normalizedEvent);
}

export function applyWorldlineEditorMutation(state, request) {
  const entriesBySource = laneMapFromState(state);
  const action = request?.action;
  const changedSourceFiles = new Set();

  if (!["add", "update", "delete", "duplicate", "move"].includes(action)) {
    throw new Error(`Unsupported editor action: ${action}`);
  }

  const sourceEntry =
    action === "add" ? null : requireEntry(entriesBySource, request.sourceFile);
  const targetSourceFile = normalizeSourceFile(
    request.targetSourceFile || request.sourceFile,
  );
  const targetEntry = targetEntryForRequest(
    entriesBySource,
    request,
    targetSourceFile,
  );

  if (action === "add" || action === "duplicate") {
    insertEvent(targetEntry, request.event, request.insertAfterId);
    changedSourceFiles.add(targetEntry.sourceFile);
  }

  if (action === "update") {
    const index = requireEvent(sourceEntry, request.eventId);

    if (sourceEntry.sourceFile === targetEntry.sourceFile) {
      sourceEntry.lane.events.splice(index, 1, normalizeEvent(request.event));
      changedSourceFiles.add(sourceEntry.sourceFile);
    } else {
      sourceEntry.lane.events.splice(index, 1);
      insertEvent(targetEntry, request.event, request.insertAfterId);
      changedSourceFiles.add(sourceEntry.sourceFile);
      changedSourceFiles.add(targetEntry.sourceFile);
    }
  }

  if (action === "move") {
    const index = requireEvent(sourceEntry, request.eventId);
    const [event] = sourceEntry.lane.events.splice(index, 1);
    insertEvent(targetEntry, request.event ?? event, request.insertAfterId);
    changedSourceFiles.add(sourceEntry.sourceFile);
    changedSourceFiles.add(targetEntry.sourceFile);
  }

  if (action === "delete") {
    const index = requireEvent(sourceEntry, request.eventId);
    sourceEntry.lane.events.splice(index, 1);
    changedSourceFiles.add(sourceEntry.sourceFile);
  }

  const nextState = {
    ...state,
    lanes: Array.from(entriesBySource.values()).sort((a, b) =>
      a.sourceFile.localeCompare(b.sourceFile, "en"),
    ),
  };

  return {
    state: nextState,
    changedSourceFiles: Array.from(changedSourceFiles).sort(),
  };
}

function validationEntriesForState(state) {
  return state.lanes.map((entry) => ({
    category: entry.category,
    sourceFile: entry.sourceFile,
    lane: entry.lane,
  }));
}

function validateEditorState(state, focusSourceFiles = []) {
  const characterIds = new Set(
    state.lanes
      .filter((entry) => entry.category === "idolCommu")
      .map((entry) => entry.lane.id),
  );
  const worldlineIds = new Set(worldlines.map((worldline) => worldline.id));
  const focusSourceFileSet = focusSourceFiles.length
    ? new Set(focusSourceFiles)
    : null;
  const errors = validateTimelineData(validationEntriesForState(state), {
    characterIds,
    worldlineIds,
    focusSourceFiles: focusSourceFileSet,
  });

  return {
    ok: errors.length === 0,
    errors,
    message: formatTimelineDataIntegrityErrors(errors),
  };
}

function rawLaneText(entry) {
  return `${JSON.stringify(entry.lane, null, 2)}\n`;
}

function entryBySource(state) {
  return new Map(
    state.lanes.map((entry) => [normalizeSourceFile(entry.sourceFile), entry]),
  );
}

function prefixedLines(prefix, text) {
  return text.split("\n").map((line) => `${prefix}${line}`);
}

function formatPatchText(previousState, nextState, changedSourceFiles) {
  const previousEntries = entryBySource(previousState);
  const nextEntries = entryBySource(nextState);

  return changedSourceFiles
    .map((sourceFile) => {
      const previousEntry = previousEntries.get(normalizeSourceFile(sourceFile));
      const nextEntry = nextEntries.get(normalizeSourceFile(sourceFile));
      const previousText = previousEntry ? rawLaneText(previousEntry) : "";
      const nextText = nextEntry ? rawLaneText(nextEntry) : "";

      if (previousText === nextText) {
        return "";
      }

      return [
        `--- a/${sourceFile}`,
        `+++ b/${sourceFile}`,
        "@@ full raw lane @@",
        ...prefixedLines("-", previousText),
        ...prefixedLines("+", nextText),
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");
}

export async function previewWorldlineEditorMutation(request, options = {}) {
  const state = options.state ?? await readWorldlineEditorState(options);
  const result = applyWorldlineEditorMutation(state, request);
  const validation = validateEditorState(result.state, result.changedSourceFiles);

  return {
    ok: validation.ok,
    action: request.action,
    changedSourceFiles: result.changedSourceFiles,
    patch: formatPatchText(state, result.state, result.changedSourceFiles),
    validation,
  };
}

async function writeChangedLanes(root, state, changedSourceFiles) {
  const changed = new Set(changedSourceFiles.map(normalizeSourceFile));
  const writes = state.lanes
    .filter((entry) => changed.has(normalizeSourceFile(entry.sourceFile)))
    .map(async (entry) => {
      const targetPath = path.resolve(root, entry.sourceFile);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, `${JSON.stringify(entry.lane, null, 2)}\n`);
    });

  await Promise.all(writes);
}

export async function saveWorldlineEditorMutation(request, options = {}) {
  const root = options.root ?? process.cwd();
  const state = options.state ?? await readWorldlineEditorState({ ...options, root });
  const result = applyWorldlineEditorMutation(state, request);
  const validation = validateEditorState(result.state, result.changedSourceFiles);

  if (!validation.ok) {
    return {
      ok: false,
      action: request.action,
      changedSourceFiles: result.changedSourceFiles,
      patch: formatPatchText(state, result.state, result.changedSourceFiles),
      validation,
    };
  }

  await writeChangedLanes(root, result.state, result.changedSourceFiles);
  await generateDataFiles();

  return {
    ok: true,
    action: request.action,
    changedSourceFiles: result.changedSourceFiles,
    patch: formatPatchText(state, result.state, result.changedSourceFiles),
    validation,
  };
}

function isLocalRequest(req) {
  const address = req.socket.remoteAddress;
  return !address || LOCAL_ADDRESSES.has(address);
}

function tokensMatch(actual, expected) {
  const actualBuffer = Buffer.from(String(actual ?? ""));
  const expectedBuffer = Buffer.from(String(expected ?? ""));
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function isSameOriginRequest(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    return (
      (originUrl.protocol === "http:" || originUrl.protocol === "https:") &&
      originUrl.host === req.headers.host
    );
  } catch {
    return false;
  }
}

export function validateWorldlineEditorWriteRequest(req, sessionToken) {
  if (!isSameOriginRequest(req)) {
    return { statusCode: 403, message: "Same-origin requests only." };
  }
  if (!tokensMatch(req.headers[EDITOR_TOKEN_HEADER], sessionToken)) {
    return { statusCode: 403, message: "Invalid editor session token." };
  }
  if (req.headers["content-type"]?.split(";", 1)[0].trim() !== "application/json") {
    return { statusCode: 415, message: "JSON requests only." };
  }
  return null;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, JSON_HEADERS);
  res.end(JSON.stringify(payload));
}

function readRequestJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8").trim();
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export function worldlineEditorApiPlugin({
  root = process.cwd(),
  sessionToken = crypto.randomBytes(32).toString("base64url"),
} = {}) {
  return {
    name: "worldline-editor-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "", "http://localhost");

        if (!url.pathname.startsWith(EDITOR_API_PREFIX)) {
          next();
          return;
        }

        if (!isLocalRequest(req)) {
          sendJson(res, 403, { ok: false, message: "Local requests only." });
          return;
        }

        if (req.method === "POST") {
          const denial = validateWorldlineEditorWriteRequest(req, sessionToken);
          if (denial) {
            sendJson(res, denial.statusCode, { ok: false, message: denial.message });
            return;
          }
        }

        try {
          if (req.method === "GET" && url.pathname === `${EDITOR_API_PREFIX}/state`) {
            sendJson(res, 200, {
              ...(await readWorldlineEditorState({ root })),
              editorSessionToken: sessionToken,
            });
            return;
          }

          if (
            req.method === "POST" &&
            url.pathname === `${EDITOR_API_PREFIX}/preview`
          ) {
            const body = await readRequestJson(req);
            sendJson(res, 200, await previewWorldlineEditorMutation(body, { root }));
            return;
          }

          if (req.method === "POST" && url.pathname === `${EDITOR_API_PREFIX}/save`) {
            const body = await readRequestJson(req);
            const result = await saveWorldlineEditorMutation(body, { root });
            sendJson(res, result.ok ? 200 : 422, result);
            return;
          }

          sendJson(res, 404, { ok: false, message: "Unknown editor endpoint." });
        } catch (error) {
          sendJson(res, 500, {
            ok: false,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    },
  };
}
