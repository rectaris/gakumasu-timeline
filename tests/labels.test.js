import { describe, expect, it } from "vitest";
import {
  ellipsizeTextToWidth,
  estimateTextWidth,
  eventInlineLabel,
  timelineScaleVisibility,
} from "../src/utils/labels";
import { DAYS_IN_MONTH } from "../src/utils/constants";

describe("label helpers", () => {
  it("ellipsizes text only when it exceeds the target width", () => {
    expect(ellipsizeTextToWidth("初星学園", 200, { fontSize: 12 })).toBe(
      "初星学園",
    );

    const shortened = ellipsizeTextToWidth("初星学園高等部入学式", 42, {
      fontSize: 12,
    });

    expect(shortened).toMatch(/…$/);
    expect(estimateTextWidth(shortened, { fontSize: 12 })).toBeLessThanOrEqual(
      42,
    );
  });

  it("keeps common event labels quiet until the event is active", () => {
    expect(
      eventInlineLabel({
        title: "共通イベント",
        visibleWidth: 160,
        eventBarHeight: 12,
        isCommon: true,
      }),
    ).toBeNull();

    expect(
      eventInlineLabel({
        title: "共通イベント",
        visibleWidth: 160,
        eventBarHeight: 12,
        isCommon: true,
        isSelected: true,
      })?.text,
    ).toBe("共通イベント");
  });

  it("requires enough width and height for inline event labels", () => {
    expect(
      eventInlineLabel({
        title: "短い",
        visibleWidth: 24,
        eventBarHeight: 12,
      }),
    ).toBeNull();

    expect(
      eventInlineLabel({
        title: "短い",
        visibleWidth: 120,
        eventBarHeight: 8,
      }),
    ).toBeNull();

    expect(
      eventInlineLabel({
        title: "短い",
        visibleWidth: 120,
        eventBarHeight: 12,
      })?.text,
    ).toBe("短い");
  });

  it("uses pixel density for month and day scale visibility", () => {
    expect(
      timelineScaleVisibility({
        viewMin: 0,
        viewMax: DAYS_IN_MONTH * 24,
        viewportWidth: 900,
      }),
    ).toEqual({ showMonthScale: false, showDayScale: false });

    expect(
      timelineScaleVisibility({
        viewMin: 0,
        viewMax: DAYS_IN_MONTH * 12,
        viewportWidth: 900,
      }),
    ).toEqual({ showMonthScale: true, showDayScale: false });

    expect(
      timelineScaleVisibility({
        viewMin: 0,
        viewMax: 40,
        viewportWidth: 900,
      }),
    ).toEqual({ showMonthScale: true, showDayScale: true });
  });
});
