import { computed } from "vue";
import { DAYS_IN_MONTH } from "../utils/constants";
import { timeToYearMonth } from "../utils/time";

const COARSE_YEAR_STEP = 5;
const COARSE_YEAR_THRESHOLD = DAYS_IN_MONTH * 12 * 9.8;

function monthStartTime(monthTime) {
  return monthTime * DAYS_IN_MONTH;
}

export function useTimelineScales({ viewRange, showMonthScale, showDayScale }) {
  const years = computed(() => {
    const startMonth = Math.floor(viewRange.value.min / DAYS_IN_MONTH);
    const endMonth = Math.floor(viewRange.value.max / DAYS_IN_MONTH);
    const startYear = Math.floor(startMonth / 12);
    const endYear = Math.floor(endMonth / 12);
    const span = viewRange.value.max - viewRange.value.min;
    const yearStep = span >= COARSE_YEAR_THRESHOLD ? COARSE_YEAR_STEP : 1;
    const firstYear =
      yearStep > 1 ? Math.floor(startYear / yearStep) * yearStep : startYear;
    const ticks = [];

    for (let year = firstYear; year <= endYear; year += yearStep) {
      ticks.push({
        year,
        time: monthStartTime(year * 12),
      });
    }

    return ticks;
  });

  const monthTicks = computed(() => {
    if (!showMonthScale.value) return [];

    const startMonth = Math.floor(viewRange.value.min / DAYS_IN_MONTH);
    const endMonth = Math.floor(viewRange.value.max / DAYS_IN_MONTH);
    const ticks = [];

    for (let monthTime = startMonth; monthTime <= endMonth; monthTime += 1) {
      const { month } = timeToYearMonth(monthTime);
      ticks.push({
        time: monthStartTime(monthTime),
        label: `${month}月`,
      });
    }

    return ticks;
  });

  const dayTicks = computed(() => {
    if (!showDayScale.value) return [];

    const startDay = Math.floor(viewRange.value.min);
    const endDay = Math.floor(viewRange.value.max);
    const ticks = [];

    for (let time = startDay; time <= endDay; time += 1) {
      const day =
        (((time % DAYS_IN_MONTH) + DAYS_IN_MONTH) % DAYS_IN_MONTH) + 1;
      ticks.push({ time, day });
    }

    return ticks;
  });

  return {
    years,
    monthTicks,
    dayTicks,
  };
}
