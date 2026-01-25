import { DAYS_IN_MONTH } from "./constants";

export function timeValue(year, month) {
  return year * 12 + (month - 1);
}

export function dayTimeValue(year, month, day = 1) {
  return timeValue(year, month) * DAYS_IN_MONTH + (day - 1);
}

export function timeToYearMonth(time) {
  const year = Math.floor(time / 12);
  const monthIndex = ((time % 12) + 12) % 12;
  return { year, month: monthIndex + 1 };
}
