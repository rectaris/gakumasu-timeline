export const TIMELINE_MODES = ["narrative", "story-graph", "realworld"];

export const TIMELINE_MODE_OPTIONS = [
  { id: "narrative", label: "物語時系列" },
  { id: "story-graph", label: "物語イベント" },
  { id: "realworld", label: "学マス情報史" },
];

const NARRATIVE_PARAMS = [
  "view",
  "cat",
  "sort",
  "lm",
  "lanes",
  "q",
  "occ",
  "unc",
  "audit",
  "src",
  "part",
  "commu",
  "wl",
  "range",
  "scale",
  "focus",
  "compare",
  "common",
  "event",
];
const STORY_GRAPH_PARAMS = ["node", "edge"];
const REALWORLD_PARAMS = ["item"];
const VIEW_PARAMS = [
  "mode",
  ...NARRATIVE_PARAMS,
  ...STORY_GRAPH_PARAMS,
  ...REALWORLD_PARAMS,
];

export function parseTimelineMode(search) {
  const requested = new URLSearchParams(search).get("mode");
  return TIMELINE_MODES.includes(requested) ? requested : "narrative";
}

export function parseStoryGraphSelection(search) {
  const params = new URLSearchParams(search);
  const nodeId = params.get("node");
  const edgeId = params.get("edge");
  if (nodeId) return { type: "node", id: nodeId };
  if (edgeId) return { type: "edge", id: edgeId };
  return null;
}

function baseParams(search) {
  const params = new URLSearchParams(search ?? "");
  VIEW_PARAMS.forEach((key) => params.delete(key));
  return params;
}

function createUrl(locationLike, params) {
  const query = params.toString();
  return `${locationLike.pathname || "/"}${query ? `?${query}` : ""}${
    locationLike.hash || ""
  }`;
}

export function createTimelineModeUrl(locationLike, mode) {
  const normalizedMode = TIMELINE_MODES.includes(mode) ? mode : "narrative";
  const params = baseParams(locationLike.search);
  if (normalizedMode !== "narrative") params.set("mode", normalizedMode);
  return createUrl(locationLike, params);
}

export function createStoryGraphSelectionUrl(locationLike, selection) {
  const params = baseParams(locationLike.search);
  params.set("mode", "story-graph");
  if (selection?.type === "node") params.set("node", selection.id);
  if (selection?.type === "edge") params.set("edge", selection.id);
  return createUrl(locationLike, params);
}

export { VIEW_PARAMS as TIMELINE_VIEW_PARAM_NAMES };
