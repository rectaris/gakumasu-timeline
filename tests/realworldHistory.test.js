import { describe, expect, it } from "vitest";
import published from "../src/data/generated/realworld_events/published";
import {
  normalizeRealworldHistoryData,
  temporalEnd,
  temporalStart,
  validateRealworldHistoryData,
} from "../src/data/realworldHistoryModel";
import {
  filterInfoEvents,
  formatTemporal,
  layoutInfoEvents,
} from "../src/utils/realworldHistory";

describe("real-world history model", () => {
  it("accepts the reviewed published dataset", () => {
    expect(validateRealworldHistoryData(published)).toEqual([]);
    expect(normalizeRealworldHistoryData(published).events).toHaveLength(1);
  });

  it("rejects invented precision and missing published provenance", () => {
    const invalid = structuredClone(published);
    invalid.events[0].startsAt = {
      value: "2024-05-16T00:00",
      precision: "date",
    };
    invalid.events[0].sources = [];
    const errors = validateRealworldHistoryData(invalid);
    expect(errors.some((error) => error.includes("精度と一致"))).toBe(true);
    expect(errors.some((error) => error.includes("公式出典"))).toBe(true);
  });

  it("maps month and date precision to ranges without inventing labels", () => {
    const month = { value: "2024-02", precision: "month" };
    const date = { value: "2024-02-20", precision: "date" };
    expect(temporalEnd(month) - temporalStart(month)).toBe(
      29 * 86_400_000,
    );
    expect(temporalEnd(date) - temporalStart(date)).toBe(86_400_000);
    expect(formatTemporal(month)).toBe("2024年2月");
  });

  it("filters and lays out category lanes", () => {
    const events = published.events;
    expect(filterInfoEvents(events, { query: "配信開始" })).toHaveLength(1);
    expect(filterInfoEvents(events, { category: "music" })).toHaveLength(0);
    const layout = layoutInfoEvents(events, { width: 1000 });
    expect(layout.items[0].y).toBe(24);
    expect(layout.items[0].width).toBeGreaterThanOrEqual(12);
  });
});
