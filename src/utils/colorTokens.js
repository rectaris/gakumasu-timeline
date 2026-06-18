import {
  backgroundFromTextColor,
  contrastRatioFromHex,
  mixHexColors,
  normalizeHexColor,
  readableTextColor
} from "./colors";
import {
  COLOR_CONFIDENCE,
  COLOR_PROVENANCE,
  getColorSourceById,
  semanticColorSources
} from "../data/colorSources";

const FALLBACK_COLORS = ["#7a7a7a", "#4d7ea8", "#a26ea1", "#c2854b"];
const DARK_TEXT = "#1a1a1a";
const LIGHT_TEXT = "#ffffff";
const EVENT_STROKE_CSS = "var(--timeline-event-stroke, var(--text-primary))";
const COMMON_EVENT_FILL_CSS = "var(--timeline-common-event-fill, #f6f1e8)";
const COMMON_EVENT_MARKER_CSS = "var(--timeline-common-event-marker, #f6f1e8)";
const SELECTED_EVENT_STROKE_CSS =
  "var(--timeline-selected-event-stroke, #1a1a1a)";
const UNCERTAIN_MARKER_CSS = "var(--timeline-uncertain-marker, #535353)";

function fallbackColorAt(index = 0) {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function normalizeSourceRecord(record, fallbackColor, fallbackIndex = 0) {
  const normalizedSource = normalizeHexColor(record?.sourceColor);
  const normalizedLegacy = normalizeHexColor(record?.legacyColor);
  const normalizedFallback = normalizeHexColor(fallbackColor);
  const sourceColor =
    normalizedSource ??
    normalizedFallback ??
    normalizedLegacy ??
    fallbackColorAt(fallbackIndex);

  return {
    sourceColor,
    legacyColor: normalizedLegacy ?? normalizedFallback ?? null,
    provenance: record?.provenance ?? COLOR_PROVENANCE.TEMPORARY,
    sourceUrl: record?.sourceUrl ?? null,
    sourceSelector: record?.sourceSelector ?? null,
    sampleRegion: record?.sampleRegion ?? null,
    confidence: record?.confidence ?? COLOR_CONFIDENCE.LOW,
    note: record?.note ?? null
  };
}

function accentStrongFor(color) {
  const whiteContrast = contrastRatioFromHex(color, LIGHT_TEXT);
  const darkContrast = contrastRatioFromHex(color, DARK_TEXT);
  if (whiteContrast >= 4.5 || darkContrast >= 4.5) {
    return whiteContrast > darkContrast
      ? mixHexColors(color, "#000000", 0.18)
      : mixHexColors(color, "#000000", 0.28);
  }

  return mixHexColors(color, "#000000", 0.36);
}

function labelBackgroundFor(color) {
  const background = backgroundFromTextColor(color);
  const contrast = contrastRatioFromHex(color, background);
  if (contrast >= 4.5) return background;
  return mixHexColors(background, "#ffffff", 0.18);
}

export function resolveColorSource(entity, options = {}) {
  const record = getColorSourceById(entity?.id);
  return {
    id: entity?.id ?? null,
    name: entity?.name ?? entity?.title ?? entity?.label ?? null,
    category: options.category ?? null,
    ...normalizeSourceRecord(
      record,
      options.fallbackColor ?? entity?.color,
      options.fallbackIndex
    )
  };
}

export function resolveSemanticColorSource(id, fallbackColor) {
  return {
    id,
    name: id,
    category: "semantic",
    ...normalizeSourceRecord(semanticColorSources[id], fallbackColor)
  };
}

export function createColorRoles(colorSource, options = {}) {
  const accent = normalizeHexColor(colorSource?.sourceColor) ?? fallbackColorAt();
  const accentStrong = accentStrongFor(accent);
  const accentSoft = labelBackgroundFor(accent);
  const labelText =
    contrastRatioFromHex(accent, accentSoft) >= 4.5
      ? accent
      : readableTextColor(accentSoft);
  const eventStroke =
    contrastRatioFromHex(accent, "#ffffff") >= 3
      ? EVENT_STROKE_CSS
      : accentStrong;
  const isCommon = options.variant === "common";
  const laneAccent = options.laneColorRoles?.accentStrong ?? accentStrong;

  if (isCommon) {
    return {
      accent,
      accentSoft,
      accentStrong: laneAccent,
      accentText: readableTextColor(accentSoft),
      labelText,
      labelBg: accentSoft,
      eventFill: COMMON_EVENT_FILL_CSS,
      eventStroke: laneAccent,
      markerFill: COMMON_EVENT_MARKER_CSS,
      selectedStroke: SELECTED_EVENT_STROKE_CSS,
      uncertainMarker: UNCERTAIN_MARKER_CSS,
      panelAccent: laneAccent,
      laneAccent,
      provenance: colorSource?.provenance ?? COLOR_PROVENANCE.TEMPORARY
    };
  }

  return {
    accent,
    accentSoft,
    accentStrong,
    accentText: readableTextColor(accent),
    labelText,
    labelBg: accentSoft,
    eventFill: accent,
    eventStroke,
    markerFill: accent,
    selectedStroke: SELECTED_EVENT_STROKE_CSS,
    uncertainMarker: UNCERTAIN_MARKER_CSS,
    panelAccent: accentStrong,
    laneAccent: accentStrong,
    provenance: colorSource?.provenance ?? COLOR_PROVENANCE.TEMPORARY
  };
}

export function resolveColorDesign(entity, options = {}) {
  const colorSource = resolveColorSource(entity, options);
  return {
    colorSource,
    colorRoles: createColorRoles(colorSource, options)
  };
}

export function resolveCommonEventColorDesign(commonTimeline, laneColorRoles) {
  const colorSource = resolveSemanticColorSource(
    "common_events",
    commonTimeline?.color
  );
  return {
    colorSource,
    colorRoles: createColorRoles(colorSource, {
      variant: "common",
      laneColorRoles
    })
  };
}
