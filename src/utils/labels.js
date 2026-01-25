import { timeToYearMonth } from "./time";

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
