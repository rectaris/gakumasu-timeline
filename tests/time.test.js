import { describe, expect, it } from "vitest";
import { yearLabel } from "../src/utils/labels";
import {
  dayTimeValue,
  timeToYearMonth,
  timeValue,
  yearOf,
  yearsAgo,
} from "../src/utils/time";

describe("time utilities", () => {
  it("treats each month as 31 days", () => {
    expect(timeValue(1, 1)).toBe(12);
    expect(dayTimeValue(1, 1, 1)).toBe(372);
    expect(dayTimeValue(1, 1, 31)).toBe(402);
    expect(dayTimeValue(1, 2, 1) - dayTimeValue(1, 1, 1)).toBe(31);
  });

  it("converts abstract month time back to year/month", () => {
    expect(timeToYearMonth(timeValue(1, 1))).toEqual({ year: 1, month: 1 });
    expect(timeToYearMonth(timeValue(3, 12))).toEqual({ year: 3, month: 12 });
    expect(timeToYearMonth(timeValue(-2, 3))).toEqual({ year: -2, month: 3 });
  });

  it("formats labels for years before and after year 1", () => {
    expect(yearOf(1)).toBe(1);
    expect(yearsAgo(16)).toBe(-15);
    expect(yearLabel(1)).toBe("1年目");
    expect(yearLabel(5)).toBe("5年目");
    expect(yearLabel(0)).toBe("1年前");
    expect(yearLabel(-2)).toBe("3年前");
  });
});
