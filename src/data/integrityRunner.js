import { characterCatalog } from "./characterCatalog";
import { worldlines } from "./worldlines";
import {
  formatTimelineDataIntegrityErrors,
  validateTimelineData,
} from "./integrity";

const durableTimelineModules = import.meta.glob("./worldline_commu/**/*.js", {
  eager: true,
  import: "default",
});

function sourceFileForModulePath(modulePath) {
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
  return Object.entries(durableTimelineModules)
    .filter(([modulePath]) => !modulePath.endsWith("/template.js"))
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([modulePath, lane]) => ({
      category: categoryForModulePath(modulePath),
      sourceFile: sourceFileForModulePath(modulePath),
      lane,
    }));
}

export function runTimelineDataIntegrityValidation() {
  const characterIds = new Set(characterCatalog.map((character) => character.id));
  const worldlineIds = new Set(worldlines.map((worldline) => worldline.id));
  const errors = validateTimelineData(getTimelineDataEntries(), {
    characterIds,
    worldlineIds,
  });

  return {
    ok: errors.length === 0,
    errors,
    message: formatTimelineDataIntegrityErrors(errors),
  };
}
