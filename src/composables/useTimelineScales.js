import { computed } from "vue";
import { DAYS_IN_MONTH } from "../utils/constants";
import { timeToYearMonth } from "../utils/time";

export function useTimelineScales({ viewRange, isDayScale }) {
  function dayTime(monthTime, day) {
    return monthTime * DAYS_IN_MONTH + (day - 1);
  }

  function displayTimeForMonth(monthTime) {
    return isDayScale.value ? monthTime * DAYS_IN_MONTH : monthTime;
  }

  const dayTicks = computed(() => {
    if (!isDayScale.value) return [];

    const { min, max } = viewRange.value;
    const startMonth = Math.floor(min / DAYS_IN_MONTH);
    const endMonth = Math.floor(max / DAYS_IN_MONTH);
    const ticks = [];

    for (let monthTime = startMonth; monthTime <= endMonth; monthTime += 1) {
      for (let day = 1; day <= 31; day += 1) {
        const time = dayTime(monthTime, day);
        if (time < min || time > max) continue;
        ticks.push({ time, day });
      }
    }

    return ticks;
  });

  const monthTicks = computed(() => {
    if (!isDayScale.value) return [];

    const { min, max } = viewRange.value;
    const startMonth = Math.floor(min / DAYS_IN_MONTH);
    const endMonth = Math.floor(max / DAYS_IN_MONTH);
    const ticks = [];

    for (let monthTime = startMonth; monthTime <= endMonth; monthTime += 1) {
      const { month } = timeToYearMonth(monthTime);
      ticks.push({
        time: dayTime(monthTime, 1),
        label: `${month}月`
      });
    }

    return ticks;
  });

  const years = computed(() => {
    const { min, max } = viewRange.value;
    const minMonth = isDayScale.value
      ? Math.floor(min / DAYS_IN_MONTH)
      : Math.floor(min);
    const maxMonth = isDayScale.value
      ? Math.floor(max / DAYS_IN_MONTH)
      : Math.floor(max);
    const startYear = Math.floor(minMonth / 12);
    const endYear = Math.floor(maxMonth / 12);

    const result = [];
    for (let y = startYear; y <= endYear; y++) {
      result.push({
        year: y,
        time: displayTimeForMonth(y * 12)
      });
    }
    return result;
  });

  return {
    years,
    monthTicks,
    dayTicks
  };
}
