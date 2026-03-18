import { computed, ref, watch } from "vue";
import { clamp } from "../utils/clamp";
import { DAYS_IN_MONTH } from "../utils/constants";

const MIN_HORIZONTAL_SPAN = 3;
const HORIZONTAL_ZOOM_STEP = 0.85;
const MIN_VERTICAL_SCALE = 0.75;
const MAX_VERTICAL_SCALE = 2.5;
const VERTICAL_ZOOM_STEP = 1.15;
const FOCUS_PADDING_DAYS = 4;
const DAY_SCALE_THRESHOLD_MONTHS = 2.8;

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

  const timeBounds = computed(() => {
    const minDay = Math.min(...timesDay.value);
    const maxDay = Math.max(...timesDay.value);
    const extent = Math.max(1, maxDay - minDay);
    const padding = Math.max(2, extent * 0.05);

    return {
      min: minDay - padding,
      max: maxDay + padding,
    };
  });

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
    verticalScale.value = clamp(
      verticalScale.value * VERTICAL_ZOOM_STEP,
      MIN_VERTICAL_SCALE,
      MAX_VERTICAL_SCALE,
    );
  }

  function zoomOutVertical() {
    verticalScale.value = clamp(
      verticalScale.value / VERTICAL_ZOOM_STEP,
      MIN_VERTICAL_SCALE,
      MAX_VERTICAL_SCALE,
    );
  }

  function resetVerticalZoom() {
    verticalScale.value = 1;
  }

  const viewRange = computed(() => ({
    min: horizontalCenter.value - horizontalSpan.value / 2,
    max: horizontalCenter.value + horizontalSpan.value / 2,
  }));

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
    timeBounds,
    () => {
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

    const eventMin = event.displayStartDay ?? event.startTimeDay;
    const eventMax = event.displayEndDay ?? event.endTimeDay;
    const requiredSpan = Math.max(
      horizontalSpan.value,
      eventMax - eventMin + FOCUS_PADDING_DAYS * 2,
    );

    if (eventMin >= viewRange.value.min && eventMax <= viewRange.value.max) {
      return;
    }

    setViewport((eventMin + eventMax) / 2, requiredSpan);
  });

  return {
    viewRange,
    horizontalSpan,
    verticalScale,
    horizontalZoomLabel,
    verticalZoomLabel,
    showMonthScale,
    showDayScale,
    canZoomInHorizontal,
    canZoomOutHorizontal,
    canZoomInVertical,
    canZoomOutVertical,
    panHorizontally,
    panByViewportRatio,
    zoomHorizontallyBy,
    zoomInHorizontal,
    zoomOutHorizontal,
    resetHorizontalZoom,
    zoomInVertical,
    zoomOutVertical,
    resetVerticalZoom,
  };
}
