/**
 * ZoomMode
 * FULL  : 全期間表示
 * YEAR  : 年中心ズーム（年単位で移動）
 * MONTH : 月中心ズーム（月単位で移動 / 日スケール表示）
 * DAY   : 日中心ズーム（日単位で移動 / 日スケール表示）
 *
 * 状態遷移:
 * FULL -> YEAR -> MONTH -> DAY
 * zoomOut は逆方向に遷移
 */

import { computed, onMounted, ref, watch } from "vue";
import { clamp } from "../utils/clamp";
import { DAYS_IN_MONTH } from "../utils/constants";
import { dayTimeValue, timeValue } from "../utils/time";

/**
 * ズーム状態と遷移を管理する状態機械。
 * - mode が表示単位と移動単位を決定する
 * - zoomIn/zoomOut で段階的に遷移
 * - moveNext/movePrev は mode に応じて年/月/日を移動
 *
 * @param {import("vue").Ref<number[]>} times
 * @param {import("vue").Ref<number[]>} timesDay
 * @param {import("vue").Ref<any>} selectedEvent
 */
export function useZoomMachine(times, timesDay, selectedEvent) {
  /** @type {import("vue").Ref<"FULL"|"YEAR"|"MONTH"|"DAY">} */
  const mode = ref("FULL");
  const centerYear = ref(0);
  const centerMonth = ref(0);
  const centerDay = ref(0);

  const zoomRangeYears = 1;
  const zoomRangeMonths = 1;
  const zoomRangeDays = 1;

  const zoomLabels = {
    FULL: "全期間表示",
    YEAR: "年表示",
    MONTH: "月表示",
    DAY: "日表示"
  };

  const isFullMode = computed(() => mode.value === "FULL");
  const isYearMode = computed(() => mode.value === "YEAR");
  const isMonthMode = computed(() => mode.value === "MONTH");
  const isDayMode = computed(() => mode.value === "DAY");
  const isDayScale = computed(
    () => mode.value === "MONTH" || mode.value === "DAY"
  );
  const showMonthScale = computed(
    () => mode.value === "MONTH" || mode.value === "DAY"
  );
  const showDayScale = computed(
    () => mode.value === "MONTH" || mode.value === "DAY"
  );

  const zoomLabel = computed(() => zoomLabels[mode.value]);

  watch(mode, nextMode => {
    const event = selectedEvent.value;
    if (!event) return;

    switch (nextMode) {
      case "YEAR":
        centerYear.value = event.start.year;
        break;
      case "MONTH":
        centerMonth.value = event.startTime;
        break;
      case "DAY":
        centerDay.value = event.startTimeDay;
        break;
      default:
        break;
    }
  });

  const viewRange = computed(() => {
    switch (mode.value) {
      case "YEAR": {
        const center = centerYear.value * 12;
        return {
          min: center - zoomRangeYears * 12,
          max: center + zoomRangeYears * 12
        };
      }
      case "MONTH": {
        const startMonth = centerMonth.value - zoomRangeMonths;
        const endMonth = centerMonth.value;
        return {
          min: startMonth * DAYS_IN_MONTH,
          max: endMonth * DAYS_IN_MONTH + (DAYS_IN_MONTH - 1)
        };
      }
      case "DAY": {
        return {
          min: centerDay.value - zoomRangeDays,
          max: centerDay.value + zoomRangeDays
        };
      }
      case "FULL":
      default:
        return {
          min: Math.min(...times.value),
          max: Math.max(...times.value)
        };
    }
  });

  const yearBounds = computed(() => {
    const minYear = Math.floor(Math.min(...times.value) / 12);
    const maxYear = Math.floor(Math.max(...times.value) / 12);

    if (maxYear - minYear < 2) {
      return {
        minYear: minYear - 1,
        maxYear: maxYear + 1
      };
    }

    return { minYear, maxYear };
  });

  const monthBounds = computed(() => {
    const minMonth = Math.min(...times.value);
    const maxMonth = Math.max(...times.value);

    if (maxMonth - minMonth < 2) {
      return {
        minMonth: minMonth - 1,
        maxMonth: maxMonth + 1
      };
    }

    return { minMonth, maxMonth };
  });

  const dayBounds = computed(() => {
    const minDay = Math.min(...timesDay.value);
    const maxDay = Math.max(...timesDay.value);

    if (maxDay - minDay < 2) {
      return {
        minDay: minDay - 1,
        maxDay: maxDay + 1
      };
    }

    return { minDay, maxDay };
  });

  function moveYear(delta) {
    centerYear.value = clamp(
      centerYear.value + delta,
      yearBounds.value.minYear,
      yearBounds.value.maxYear
    );
  }

  function moveMonth(delta) {
    centerMonth.value = clamp(
      centerMonth.value + delta,
      monthBounds.value.minMonth,
      monthBounds.value.maxMonth
    );
  }

  function moveDay(delta) {
    centerDay.value = clamp(
      centerDay.value + delta,
      dayBounds.value.minDay,
      dayBounds.value.maxDay
    );
  }

  function moveNext() {
    switch (mode.value) {
      case "YEAR":
        moveYear(1);
        break;
      case "MONTH":
        moveMonth(1);
        break;
      case "DAY":
        moveDay(1);
        break;
      default:
        break;
    }
  }

  function movePrev() {
    switch (mode.value) {
      case "YEAR":
        moveYear(-1);
        break;
      case "MONTH":
        moveMonth(-1);
        break;
      case "DAY":
        moveDay(-1);
        break;
      default:
        break;
    }
  }

  function zoomIn() {
    switch (mode.value) {
      case "FULL":
        mode.value = "YEAR";
        break;
      case "YEAR":
        mode.value = "MONTH";
        break;
      case "MONTH":
        mode.value = "DAY";
        break;
      case "DAY":
      default:
        break;
    }
  }

  function zoomOut() {
    switch (mode.value) {
      case "DAY":
        mode.value = "MONTH";
        break;
      case "MONTH":
        mode.value = "YEAR";
        break;
      case "YEAR":
        mode.value = "FULL";
        break;
      case "FULL":
      default:
        break;
    }
  }

  onMounted(() => {
    centerYear.value = 1;
    centerMonth.value = timeValue(1, 1);
    centerDay.value = dayTimeValue(1, 1, 1);
  });

  return {
    mode,
    centerYear,
    centerMonth,
    centerDay,
    zoomRangeYears,
    zoomRangeMonths,
    zoomRangeDays,
    zoomLabel,
    viewRange,
    yearBounds,
    monthBounds,
    dayBounds,
    isFullMode,
    isYearMode,
    isMonthMode,
    isDayMode,
    isDayScale,
    showMonthScale,
    showDayScale,
    moveYear,
    moveMonth,
    moveDay,
    moveNext,
    movePrev,
    zoomIn,
    zoomOut
  };
}
