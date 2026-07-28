import {
  TIMELINE_MODES,
  createTimelineModeUrl,
} from "./timelineModeUrl.js";

function relativeLocationUrl(locationLike) {
  return `${locationLike.pathname || "/"}${locationLike.search || ""}${
    locationLike.hash || ""
  }`;
}

export function createTimelineModeMemory() {
  const urls = new Map();

  return {
    remember(mode, locationLike) {
      if (!TIMELINE_MODES.includes(mode) || !locationLike) return;
      urls.set(mode, relativeLocationUrl(locationLike));
    },
    resolve(mode, locationLike) {
      if (!TIMELINE_MODES.includes(mode)) {
        return createTimelineModeUrl(locationLike, "narrative");
      }
      return urls.get(mode) ?? createTimelineModeUrl(locationLike, mode);
    },
  };
}
