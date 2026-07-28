import { characterCatalog } from "./characterCatalog";
import { worldlines } from "./worldlines";
import { storyGraph } from "./storyGraph";
import {
  formatTimelineDataIntegrityErrors,
  validateTimelineData,
} from "./integrity";

const durableTimelineModules = import.meta.glob("./worldline_commu/**/*.js", {
  eager: true,
  import: "default",
});

const generatedTimelineModules = import.meta.glob(
  "./generated/worldline_commu/**/*.js",
  {
    eager: true,
    import: "default",
  },
);

function sourceFileForModulePath(modulePath) {
  if (modulePath.startsWith("./generated/worldline_commu/")) {
    return `data/raw/${modulePath
      .replace(/^\.\/generated\//, "")
      .replace(/\.js$/, ".json")}`;
  }

  return `src/data/${modulePath.replace(/^\.\//, "")}`;
}

function categoryForModulePath(modulePath) {
  if (modulePath.includes("/idol_commu/")) {
    return "idolCommu";
  }

  if (modulePath.includes("/hatsuboshi_commu/")) {
    return "hatsuboshiCommus";
  }

  if (modulePath.includes("/event_commu/")) {
    return "eventCommus";
  }

  if (modulePath.includes("/support_story/")) {
    return "supportCardCommus";
  }

  if (modulePath.endsWith("/common_timeline.js")) {
    return "commonTimeline";
  }

  return "unknown";
}

export function getTimelineDataEntries() {
  return [
    ...Object.entries(durableTimelineModules),
    ...Object.entries(generatedTimelineModules),
  ]
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([modulePath, lane]) => ({
      category: categoryForModulePath(modulePath),
      sourceFile: sourceFileForModulePath(modulePath),
      lane,
    }));
}

function normalizeTargetPath(targetPath) {
  let normalized = String(targetPath)
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");

  if (normalized.startsWith("worldline_commu/")) {
    normalized = `src/data/${normalized}`;
  }

  return normalized;
}

function entryMatchesTarget(entry, targetPath) {
  const sourceFile = normalizeTargetPath(entry.sourceFile);
  const normalizedTarget = normalizeTargetPath(targetPath);

  return (
    sourceFile === normalizedTarget ||
    sourceFile.startsWith(`${normalizedTarget}/`)
  );
}

function formatTargetPaths(targetPaths) {
  return targetPaths.map((targetPath) => `- ${targetPath}`).join("\n");
}

export function runTimelineDataIntegrityValidation({ targetPaths = [] } = {}) {
  const characterIds = new Set(characterCatalog.map((character) => character.id));
  const worldlineIds = new Set(worldlines.map((worldline) => worldline.id));
  const storyBlockIds = new Set(storyGraph.blocks.map((block) => block.id));
  const entries = getTimelineDataEntries();
  const normalizedTargetPaths = targetPaths.map(normalizeTargetPath);
  const focusedEntries = normalizedTargetPaths.length
    ? entries.filter((entry) =>
        normalizedTargetPaths.some((targetPath) =>
          entryMatchesTarget(entry, targetPath),
        ),
      )
    : entries;

  if (normalizedTargetPaths.length && focusedEntries.length === 0) {
    return {
      ok: false,
      errors: [],
      message: [
        "No timeline data files matched the focused validation target.",
        formatTargetPaths(normalizedTargetPaths),
      ].join("\n"),
    };
  }

  const focusSourceFiles = normalizedTargetPaths.length
    ? new Set(focusedEntries.map((entry) => entry.sourceFile))
    : null;
  const errors = validateTimelineData(entries, {
    characterIds,
    worldlineIds,
    storyBlockIds,
    focusSourceFiles,
  });

  return {
    ok: errors.length === 0,
    errors,
    message:
      errors.length === 0 && normalizedTargetPaths.length
        ? `Timeline data integrity check passed for ${focusedEntries.length} focused file(s).`
        : formatTimelineDataIntegrityErrors(errors),
  };
}
