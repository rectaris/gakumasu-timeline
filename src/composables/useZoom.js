import { computed, onMounted, ref, watch } from "vue";
import { clamp } from "../utils/clamp";
import { DAYS_IN_MONTH } from "../utils/constants";
import { timeValue } from "../utils/time";

export function useZoom(times, selectedEvent) {
  const zoomMode = ref("all");
  const zoomCenterYear = ref(0);
  const zoomRangeYears = 1;
  const zoomCenterMonth = ref(0);
  const zoomRangeMonths = 1;

  const zoomLabels = {
    all: "全期間表示",
    year: "年表示",
    month: "月表示"
  };

  watch(zoomMode, mode => {
    if (mode === "year" && selectedEvent.value) {
      zoomCenterYear.value = selectedEvent.value.start.year;
    }
    if (mode === "month" && selectedEvent.value) {
      zoomCenterMonth.value = selectedEvent.value.startTime;
    }
  });

  const viewRange = computed(() => {
    if (zoomMode.value === "year") {
      const center = zoomCenterYear.value * 12;
      return {
        min: center - zoomRangeYears * 12,
        max: center + zoomRangeYears * 12
      };
    }

    if (zoomMode.value === "month") {
      const startMonth = zoomCenterMonth.value - zoomRangeMonths;
      const endMonth = zoomCenterMonth.value;
      return {
        min: startMonth * DAYS_IN_MONTH,
        max: endMonth * DAYS_IN_MONTH + (DAYS_IN_MONTH - 1)
      };
    }

    return {
      min: Math.min(...times.value),
      max: Math.max(...times.value)
    };
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

  const zoomLabel = computed(() => zoomLabels[zoomMode.value]);
  const isDayScale = computed(() => zoomMode.value === "month");

  function moveYear(delta) {
    zoomCenterYear.value = clamp(
      zoomCenterYear.value + delta,
      yearBounds.value.minYear,
      yearBounds.value.maxYear
    );
  }

  function moveMonth(delta) {
    zoomCenterMonth.value = clamp(
      zoomCenterMonth.value + delta,
      monthBounds.value.minMonth,
      monthBounds.value.maxMonth
    );
  }

  function prevYear() {
    moveYear(-1);
  }

  function nextYear() {
    moveYear(1);
  }

  function prevMonth() {
    moveMonth(-1);
  }

  function nextMonth() {
    moveMonth(1);
  }

  function zoomIn() {
    if (zoomMode.value === "all") {
      zoomMode.value = "year";
      return;
    }
    if (zoomMode.value === "year") {
      zoomMode.value = "month";
    }
  }

  function zoomOut() {
    if (zoomMode.value === "month") {
      zoomMode.value = "year";
      return;
    }
    if (zoomMode.value === "year") {
      zoomMode.value = "all";
    }
  }

  onMounted(() => {
    zoomCenterYear.value = 1;
    zoomCenterMonth.value = timeValue(1, 1);
  });

  return {
    zoomMode,
    zoomCenterYear,
    zoomRangeYears,
    zoomCenterMonth,
    zoomRangeMonths,
    zoomLabel,
    viewRange,
    yearBounds,
    monthBounds,
    isDayScale,
    moveYear,
    moveMonth,
    prevYear,
    nextYear,
    prevMonth,
    nextMonth,
    zoomIn,
    zoomOut
  };
}
