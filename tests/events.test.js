import { describe, expect, it } from "vitest";
import {
  eventUncertaintyState,
  eventUncertaintySummary,
  isUncertainEvent,
} from "../src/utils/events";

describe("event uncertainty helpers", () => {
  it("derives range-only uncertainty from single-within-range events", () => {
    const summary = eventUncertaintySummary({
      occurrenceType: "singleWithinRange",
      source: ["source-a"],
    });

    expect(summary).toMatchObject({
      state: "rangeOnly",
      stateLabel: "期間内の1日",
      dateConfidence: "rangeOnly",
      rangeReason: "sourceRange",
      sourceStatus: "confirmed",
      isUncertain: true,
    });
  });

  it("keeps continuous events confirmed unless explicit metadata says otherwise", () => {
    expect(eventUncertaintyState({ occurrenceType: "continuous" })).toBe(
      "confirmed",
    );
    expect(isUncertainEvent({ occurrenceType: "continuous" })).toBe(false);

    expect(
      eventUncertaintySummary({
        occurrenceType: "continuous",
        dateConfidence: "inferred",
        sourceBasis: "inferred",
      }),
    ).toMatchObject({
      state: "inferred",
      stateLabel: "推定",
      sourceBasisLabel: "推論",
      isUncertain: true,
    });
  });

  it("treats source conflicts as the highest-priority uncertainty state", () => {
    expect(
      eventUncertaintySummary({
        occurrenceType: "singleWithinRange",
        conflicts: [{ summary: "出典Aと出典Bで時期が異なる" }],
      }),
    ).toMatchObject({
      state: "conflicting",
      stateLabel: "出典矛盾",
      sourceStatus: "conflicting",
      isUncertain: true,
    });
  });
});
