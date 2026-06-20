const VIEW_VERSION = "1";

const VIEW_PARAM_NAMES = [
  "view",
  "cat",
  "sort",
  "lm",
  "lanes",
  "q",
  "occ",
  "unc",
  "part",
  "commu",
  "wl",
  "range",
  "scale",
  "focus",
  "common",
];

const DEFAULT_CATEGORY = "idol";
const DEFAULT_SORT = "default";
const DEFAULT_FILTER_VALUE = "all";
const DEFAULT_VERTICAL_SCALE = 1;
const RANGE_PRECISION = 2;
const SCALE_PRECISION = 2;

function cleanString(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function cleanIdList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundNumber(value, precision) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function encodeNumber(value, precision) {
  return String(roundNumber(value, precision));
}

function sameNumber(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

function rangeIsDefault(range, fullRange) {
  if (!range || !fullRange) return true;
  return (
    sameNumber(range.min, fullRange.min) && sameNumber(range.max, fullRange.max)
  );
}

function isFullLaneSelection(selectedLaneIds, allLaneIds) {
  if (!allLaneIds.length) return true;
  if (selectedLaneIds.length !== allLaneIds.length) return false;

  const selected = new Set(selectedLaneIds);
  return allLaneIds.every((id) => selected.has(id));
}

function laneSelectionParams(selectedLaneIds, allLaneIds) {
  if (isFullLaneSelection(selectedLaneIds, allLaneIds)) return null;

  const allSet = new Set(allLaneIds);
  const selected = selectedLaneIds.filter((id) => allSet.has(id));
  const selectedSet = new Set(selected);
  const hidden = allLaneIds.filter((id) => !selectedSet.has(id));

  if (selected.length <= hidden.length) {
    return { mode: "include", ids: selected };
  }

  return { mode: "exclude", ids: hidden };
}

function setIfValue(params, key, value) {
  const text = cleanString(value);
  if (text) params.set(key, text);
}

export function parseTimelineViewState(search) {
  const params = new URLSearchParams(search);

  if (params.get("view") !== VIEW_VERSION) {
    return {
      hasViewState: false,
    };
  }

  const rangeParts = cleanIdList(params.get("range"));
  const rangeMin = parseFiniteNumber(rangeParts[0]);
  const rangeMax = parseFiniteNumber(rangeParts[1]);
  const verticalScale = parseFiniteNumber(params.get("scale"));
  const laneMode = params.get("lm");
  const hasLaneMode = laneMode === "include" || laneMode === "exclude";

  return {
    hasViewState: true,
    category: cleanString(params.get("cat")),
    laneSortMode: cleanString(params.get("sort")),
    laneSelection: hasLaneMode
      ? {
          mode: laneMode,
          ids: cleanIdList(params.get("lanes")),
          hasExplicitEmptyList: params.has("lanes") && !params.get("lanes"),
        }
      : null,
    filters: {
      query: params.get("q") ?? undefined,
      occurrenceType: cleanString(params.get("occ")),
      uncertainty: cleanString(params.get("unc")),
      participant: cleanString(params.get("part")),
      commu: cleanString(params.get("commu")),
      worldline: cleanString(params.get("wl")),
    },
    range:
      rangeMin !== null && rangeMax !== null && rangeMin < rangeMax
        ? { min: rangeMin, max: rangeMax }
        : null,
    verticalScale: verticalScale !== null && verticalScale > 0 ? verticalScale : null,
    focusedLaneId: cleanString(params.get("focus")),
    showCommonEvents:
      params.get("common") === "0"
        ? false
        : params.get("common") === "1"
          ? true
          : undefined,
  };
}

export function createTimelineViewStateParams(
  snapshot,
  { includeCommonEvents = false } = {},
) {
  const params = new URLSearchParams();
  const filters = snapshot.filters ?? {};
  const selectedLaneIds = snapshot.selectedLaneIds ?? [];
  const allLaneIds = snapshot.allLaneIds ?? [];

  if (snapshot.category && snapshot.category !== DEFAULT_CATEGORY) {
    params.set("cat", snapshot.category);
  }

  if (snapshot.laneSortMode && snapshot.laneSortMode !== DEFAULT_SORT) {
    params.set("sort", snapshot.laneSortMode);
  }

  const laneSelection = laneSelectionParams(selectedLaneIds, allLaneIds);
  if (laneSelection) {
    params.set("lm", laneSelection.mode);
    params.set("lanes", laneSelection.ids.join(","));
  }

  setIfValue(params, "q", filters.query);

  if (
    filters.occurrenceType &&
    filters.occurrenceType !== DEFAULT_FILTER_VALUE
  ) {
    params.set("occ", filters.occurrenceType);
  }

  if (filters.uncertainty && filters.uncertainty !== DEFAULT_FILTER_VALUE) {
    params.set("unc", filters.uncertainty);
  }

  if (filters.participant && filters.participant !== DEFAULT_FILTER_VALUE) {
    params.set("part", filters.participant);
  }

  if (filters.commu && filters.commu !== DEFAULT_FILTER_VALUE) {
    params.set("commu", filters.commu);
  }

  if (filters.worldline && filters.worldline !== DEFAULT_FILTER_VALUE) {
    params.set("wl", filters.worldline);
  }

  if (snapshot.range && !rangeIsDefault(snapshot.range, snapshot.fullRange)) {
    params.set(
      "range",
      `${encodeNumber(snapshot.range.min, RANGE_PRECISION)},${encodeNumber(
        snapshot.range.max,
        RANGE_PRECISION,
      )}`,
    );
  }

  if (
    Number.isFinite(snapshot.verticalScale) &&
    !sameNumber(snapshot.verticalScale, DEFAULT_VERTICAL_SCALE)
  ) {
    params.set("scale", encodeNumber(snapshot.verticalScale, SCALE_PRECISION));
  }

  setIfValue(params, "focus", snapshot.focusedLaneId);

  if (includeCommonEvents && snapshot.showCommonEvents === false) {
    params.set("common", "0");
  }

  if (Array.from(params.keys()).length > 0) {
    params.set("view", VIEW_VERSION);
  }

  return params;
}

export function replaceTimelineViewStateInUrl(
  locationLike,
  snapshot,
  options,
) {
  const params = new URLSearchParams(locationLike.search ?? "");
  VIEW_PARAM_NAMES.forEach((key) => params.delete(key));

  const viewParams = createTimelineViewStateParams(snapshot, options);
  viewParams.forEach((value, key) => {
    params.set(key, value);
  });

  const query = params.toString();
  return `${locationLike.pathname || "/"}${query ? `?${query}` : ""}${
    locationLike.hash || ""
  }`;
}

export { VIEW_PARAM_NAMES };
