import { DAYS_IN_MONTH } from "./constants";
import { timeToYearMonth } from "./time";

export const EVENT_LABEL_FONT_SIZE = 9.5;
export const EVENT_CONTEXT_LABEL_FONT_SIZE = 11;
export const EVENT_CONTEXT_LABEL_MAX_WIDTH = 220;

const EVENT_LABEL_MIN_BAR_HEIGHT = 11;
const EVENT_LABEL_HORIZONTAL_PADDING = 7;
const EVENT_LABEL_END_MARKER_RESERVE = 22;
const EVENT_LABEL_UNCERTAIN_MARKER_RESERVE = 18;
const EVENT_LABEL_MIN_TEXT_WIDTH = 28;
const MONTH_LABEL_MIN_PX = 44;
const DAY_LABEL_MIN_PX = 18;

export function yearLabel(year) {
  if (year === 1) return "1年目";
  if (year > 1) return `${year}年目`;
  const diff = 1 - year;
  return `${diff}年前`;
}

export function monthLabel(time) {
  const { year, month } = timeToYearMonth(time);
  return `${yearLabel(year)} ${month}月`;
}

export function dayLabel(dayTime) {
  const monthTime = Math.floor(dayTime / DAYS_IN_MONTH);
  const day = ((dayTime % DAYS_IN_MONTH) + DAYS_IN_MONTH) % DAYS_IN_MONTH + 1;
  const { year, month } = timeToYearMonth(monthTime);
  return `${yearLabel(year)} ${month}月${day}日`;
}

export function estimateTextWidth(text, { fontSize = 12 } = {}) {
  if (!text) return 0;

  const asciiWidth = fontSize * 0.58;
  const spaceWidth = fontSize * 0.28;
  const halfKanaWidth = fontSize * 0.72;
  const wideWidth = fontSize * 0.98;

  return Array.from(String(text)).reduce((total, char) => {
    if (char === " ") return total + spaceWidth;
    if (/^[\uFF61-\uFF9F]$/.test(char)) return total + halfKanaWidth;
    if (/^[\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF]$/.test(char)) {
      return total + wideWidth;
    }
    if (char.charCodeAt(0) <= 0x007f) return total + asciiWidth;
    return total + wideWidth;
  }, 0);
}

export function ellipsizeTextToWidth(text, maxWidth, { fontSize = 12 } = {}) {
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) return "";
  if (maxWidth <= 0) return "";
  if (estimateTextWidth(normalizedText, { fontSize }) <= maxWidth) {
    return normalizedText;
  }

  const ellipsis = "…";
  if (estimateTextWidth(ellipsis, { fontSize }) > maxWidth) return "";

  let result = "";
  for (const char of Array.from(normalizedText)) {
    const candidate = `${result}${char}`;
    if (estimateTextWidth(`${candidate}${ellipsis}`, { fontSize }) > maxWidth) {
      return result ? `${result}${ellipsis}` : "";
    }
    result = candidate;
  }

  return normalizedText;
}

export function eventInlineLabel({
  title,
  visibleWidth,
  eventBarHeight,
  isCommon = false,
  isSingleWithinRange = false,
  isSelected = false,
  isInteractive = false,
} = {}) {
  const normalizedTitle = String(title ?? "").trim();
  if (!normalizedTitle) return null;
  if (eventBarHeight < EVENT_LABEL_MIN_BAR_HEIGHT) return null;
  if (isCommon && !isSelected && !isInteractive) return null;

  const markerReserve =
    EVENT_LABEL_END_MARKER_RESERVE +
    (isSingleWithinRange ? EVENT_LABEL_UNCERTAIN_MARKER_RESERVE : 0);
  const availableWidth =
    visibleWidth - markerReserve - EVENT_LABEL_HORIZONTAL_PADDING * 2;

  if (availableWidth < EVENT_LABEL_MIN_TEXT_WIDTH) return null;

  const text = ellipsizeTextToWidth(normalizedTitle, availableWidth, {
    fontSize: EVENT_LABEL_FONT_SIZE,
  });

  return text ? { text, availableWidth } : null;
}

export function eventContextLabel(
  title,
  maxWidth = EVENT_CONTEXT_LABEL_MAX_WIDTH,
) {
  const text = ellipsizeTextToWidth(String(title ?? "").trim(), maxWidth, {
    fontSize: EVENT_CONTEXT_LABEL_FONT_SIZE,
  });

  if (!text) return null;

  return {
    text,
    width: estimateTextWidth(text, {
      fontSize: EVENT_CONTEXT_LABEL_FONT_SIZE,
    }),
  };
}

export function timelineScaleVisibility({ viewMin, viewMax, viewportWidth } = {}) {
  const min = Number.isFinite(Number(viewMin)) ? Number(viewMin) : 0;
  const max = Number.isFinite(Number(viewMax)) ? Number(viewMax) : min + 1;
  const span = Math.max(1, max - min);
  const width = Math.max(0, Number(viewportWidth) || 0);
  const pxPerDay = width / span;
  const pxPerMonth = pxPerDay * DAYS_IN_MONTH;

  return {
    showMonthScale: pxPerMonth >= MONTH_LABEL_MIN_PX,
    showDayScale: pxPerDay >= DAY_LABEL_MIN_PX,
  };
}
