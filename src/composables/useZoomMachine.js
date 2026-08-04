import { computed, ref, watch } from "vue";
import { clamp } from "../utils/clamp";
import {
  DAYS_IN_MONTH,
  MAX_VERTICAL_SCALE,
  MIN_VERTICAL_SCALE,
} from "../utils/constants";

const MIN_HORIZONTAL_SPAN = 3;
const HORIZONTAL_ZOOM_STEP = 0.85;
const VERTICAL_ZOOM_STEP = 1.15;
const FOCUS_PADDING_DAYS = 4;
const DAY_SCALE_THRESHOLD_MONTHS = 2.8;
const HORIZONTAL_PRESETS = Object.freeze([
  { id: "overview", label: "全体", span: null },
  { id: "year", label: "年", span: DAYS_IN_MONTH * 12 },
  { id: "month", label: "月", span: DAYS_IN_MONTH },
  { id: "detail", label: "詳細", span: 7 },
]);
const DEFAULT_TIME_BOUNDS = {
  min: -2,
  max: 2,
};

function formatSpanLabel(spanInDays) {
  const months = spanInDays / DAYS_IN_MONTH;

  if (months >= 24) {
    return `${(months / 12).toFixed(1)}y`;
  }

  if (months >= 2) {
    return `${months.toFixed(1)}mo`;
  }

  return `${Math.max(1, Math.round(spanInDays))}d`;
}

export function useZoomMachine(timesDay, selectedEvent) {
  const horizontalCenter = ref(0);
  const horizontalSpan = ref(MIN_HORIZONTAL_SPAN);
  const verticalScale = ref(1);
  const hasInitialized = ref(false);
  const resolvedTimeBounds = ref(DEFAULT_TIME_BOUNDS);

  watch(
    timesDay,
    (values) => {
      if (!values.length) return;

      const minDay = Math.min(...values);
      const maxDay = Math.max(...values);
      const extent = Math.max(1, maxDay - minDay);
      const padding = Math.max(2, extent * 0.05);

      resolvedTimeBounds.value = {
        min: minDay - padding,
        max: maxDay + padding,
      };
    },
    { immediate: true },
  );

  const timeBounds = computed(() => resolvedTimeBounds.value);

  const maxHorizontalSpan = computed(() =>
    Math.max(1, timeBounds.value.max - timeBounds.value.min),
  );

  const minHorizontalSpan = computed(() =>
    Math.min(MIN_HORIZONTAL_SPAN, maxHorizontalSpan.value),
  );

  function clampViewport(nextCenter, nextSpan) {
    const clampedSpan = clamp(
      nextSpan,
      minHorizontalSpan.value,
      maxHorizontalSpan.value,
    );
    const halfSpan = clampedSpan / 2;
    const minCenter = timeBounds.value.min + halfSpan;
    const maxCenter = timeBounds.value.max - halfSpan;

    if (minCenter > maxCenter) {
      return {
        center: (timeBounds.value.min + timeBounds.value.max) / 2,
        span: maxHorizontalSpan.value,
      };
    }

    return {
      center: clamp(nextCenter, minCenter, maxCenter),
      span: clampedSpan,
    };
  }

  function setViewport(nextCenter, nextSpan) {
    const viewport = clampViewport(nextCenter, nextSpan);
    horizontalCenter.value = viewport.center;
    horizontalSpan.value = viewport.span;
  }

  function resetHorizontalZoom() {
    setViewport(
      (timeBounds.value.min + timeBounds.value.max) / 2,
      maxHorizontalSpan.value,
    );
  }

  function setHorizontalRange(min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return;
    setViewport((min + max) / 2, max - min);
  }

  function setViewportCenterByRatio(ratio) {
    if (!Number.isFinite(ratio)) return;

    const center =
      timeBounds.value.min + maxHorizontalSpan.value * clamp(ratio, 0, 1);

    setViewport(center, horizontalSpan.value);
  }

  function panHorizontally(delta) {
    setViewport(horizontalCenter.value + delta, horizontalSpan.value);
  }

  function panByViewportRatio(ratio) {
    panHorizontally(horizontalSpan.value * ratio);
  }

  function zoomHorizontallyBy(factor, anchorRatio = 0.5) {
    const currentSpan = horizontalSpan.value;
    const nextSpan = currentSpan * factor;
    const clampedRatio = clamp(anchorRatio, 0, 1);
    const currentMin = horizontalCenter.value - currentSpan / 2;
    const anchorTime = currentMin + currentSpan * clampedRatio;
    const targetSpan = clamp(
      nextSpan,
      minHorizontalSpan.value,
      maxHorizontalSpan.value,
    );
    const nextMin = anchorTime - targetSpan * clampedRatio;

    setViewport(nextMin + targetSpan / 2, targetSpan);
  }

  function zoomInHorizontal() {
    zoomHorizontallyBy(HORIZONTAL_ZOOM_STEP);
  }

  function zoomOutHorizontal() {
    zoomHorizontallyBy(1 / HORIZONTAL_ZOOM_STEP);
  }

  function zoomInVertical() {
    zoomVerticallyBy(VERTICAL_ZOOM_STEP);
  }

  function zoomOutVertical() {
    zoomVerticallyBy(1 / VERTICAL_ZOOM_STEP);
  }

  function zoomVerticallyBy(factor) {
    verticalScale.value = clamp(
      verticalScale.value * factor,
      MIN_VERTICAL_SCALE,
      MAX_VERTICAL_SCALE,
    );
  }

  function resetVerticalZoom() {
    verticalScale.value = 1;
  }

  function setVerticalScale(value) {
    if (!Number.isFinite(value)) return;
    verticalScale.value = clamp(value, MIN_VERTICAL_SCALE, MAX_VERTICAL_SCALE);
  }

  function revealHorizontalRange(min, max, padding = FOCUS_PADDING_DAYS) {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return false;

    const targetMin = Math.min(min, max) - padding;
    const targetMax = Math.max(min, max) + padding;
    const requiredSpan = Math.max(
      minHorizontalSpan.value,
      targetMax - targetMin,
    );
    const nextSpan = Math.max(horizontalSpan.value, requiredSpan);
    const currentMin = horizontalCenter.value - horizontalSpan.value / 2;
    const currentMax = horizontalCenter.value + horizontalSpan.value / 2;

    if (targetMin >= currentMin && targetMax <= currentMax) {
      return false;
    }

    if (nextSpan > horizontalSpan.value) {
      setViewport((targetMin + targetMax) / 2, nextSpan);
      return true;
    }

    if (targetMin < currentMin) {
      setViewport(targetMin + nextSpan / 2, nextSpan);
      return true;
    }

    setViewport(targetMax - nextSpan / 2, nextSpan);
    return true;
  }

  function selectedEventCenterDay() {
    const event = selectedEvent.value;
    if (!event) return null;

    return (event.displayStartDay + event.displayEndDay) / 2;
  }

  function revealSelectedEvent() {
    const event = selectedEvent.value;
    if (!event) return false;

    return revealHorizontalRange(event.displayStartDay, event.displayEndDay);
  }

  function zoomToPreset(presetId) {
    const preset = HORIZONTAL_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    if (preset.id === "overview") {
      resetHorizontalZoom();
      return;
    }

    setViewport(selectedEventCenterDay() ?? horizontalCenter.value, preset.span);
  }

  const viewRange = computed(() => ({
    min: horizontalCenter.value - horizontalSpan.value / 2,
    max: horizontalCenter.value + horizontalSpan.value / 2,
  }));

  const viewportRatio = computed(() => {
    const fullSpan = maxHorizontalSpan.value;
    if (!fullSpan) {
      return { start: 0, end: 1, center: 0.5 };
    }

    const start = clamp((viewRange.value.min - timeBounds.value.min) / fullSpan, 0, 1);
    const end = clamp((viewRange.value.max - timeBounds.value.min) / fullSpan, 0, 1);

    return {
      start,
      end,
      center: clamp((start + end) / 2, 0, 1),
    };
  });

  const selectedEventRangeRatio = computed(() => {
    const event = selectedEvent.value;
    const fullSpan = maxHorizontalSpan.value;
    if (!event || !fullSpan) return null;

    const start = clamp(
      (event.displayStartDay - timeBounds.value.min) / fullSpan,
      0,
      1,
    );
    const end = clamp(
      (event.displayEndDay - timeBounds.value.min) / fullSpan,
      0,
      1,
    );

    return {
      start: Math.min(start, end),
      end: Math.max(start, end),
      center: clamp((start + end) / 2, 0, 1),
    };
  });

  const showMonthScale = computed(
    () => horizontalSpan.value <= DAYS_IN_MONTH * 48,
  );

  const showDayScale = computed(
    () => horizontalSpan.value <= DAYS_IN_MONTH * DAY_SCALE_THRESHOLD_MONTHS,
  );

  const horizontalZoomLabel = computed(() =>
    formatSpanLabel(horizontalSpan.value),
  );

  const verticalZoomLabel = computed(
    () => `${Math.round(verticalScale.value * 100)}%`,
  );

  const canZoomInHorizontal = computed(
    () => horizontalSpan.value > minHorizontalSpan.value + 0.001,
  );

  const canZoomOutHorizontal = computed(
    () => horizontalSpan.value < maxHorizontalSpan.value - 0.001,
  );

  const canZoomInVertical = computed(
    () => verticalScale.value < MAX_VERTICAL_SCALE - 0.001,
  );

  const canZoomOutVertical = computed(
    () => verticalScale.value > MIN_VERTICAL_SCALE + 0.001,
  );

  watch(
    timesDay,
    (values) => {
      if (!values.length) return;

      if (!hasInitialized.value) {
        resetHorizontalZoom();
        hasInitialized.value = true;
        return;
      }

      setViewport(horizontalCenter.value, horizontalSpan.value);
    },
    { immediate: true },
  );

  watch(selectedEvent, (event) => {
    if (!event) return;

    revealHorizontalRange(event.displayStartDay, event.displayEndDay);
  });

  return {
    viewRange,
    timeBounds,
    viewportRatio,
    selectedEventRangeRatio,
    horizontalSpan,
    verticalScale,
    horizontalZoomLabel,
    verticalZoomLabel,
    horizontalPresetOptions: HORIZONTAL_PRESETS.map(({ id, label }) => ({
      id,
      label,
    })),
    showMonthScale,
    showDayScale,
    canZoomInHorizontal,
    canZoomOutHorizontal,
    canZoomInVertical,
    canZoomOutVertical,
    panHorizontally,
    panByViewportRatio,
    setHorizontalRange,
    setViewportCenterByRatio,
    revealSelectedEvent,
    zoomToPreset,
    zoomHorizontallyBy,
    zoomVerticallyBy,
    zoomInHorizontal,
    zoomOutHorizontal,
    resetHorizontalZoom,
    zoomInVertical,
    zoomOutVertical,
    setVerticalScale,
    resetVerticalZoom,
  };
}
