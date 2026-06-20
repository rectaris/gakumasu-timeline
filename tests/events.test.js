import { describe, expect, it } from "vitest";
import {
  eventAuditSummary,
  eventUncertaintyState,
  eventUncertaintySummary,
  isUncertainEvent,
  sourceKeysForEvent,
  summarizeEventAuditQuality,
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
    const summary = eventUncertaintySummary({ occurrenceType: "continuous" });

    expect(eventUncertaintyState({ occurrenceType: "continuous" })).toBe(
      "confirmed",
    );
    expect(isUncertainEvent({ occurrenceType: "continuous" })).toBe(false);
    expect(summary).toMatchObject({
      sourceStatus: "unsourced",
      sourceStatusLabel: "出典なし",
    });

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

  it("derives ordered audit categories without changing the primary uncertainty state", () => {
    const audit = eventAuditSummary({
      occurrenceType: "singleWithinRange",
      dateConfidence: "inferred",
      sourceStatus: "unsourced",
    });

    expect(audit.categories).toEqual(["missingSource", "inferred"]);
    expect(audit.labels).toEqual(["出典なし", "推定"]);
    expect(audit.missingSource).toBe(true);
    expect(
      eventAuditSummary({
        occurrenceType: "continuous",
        sourceStatus: "inferred",
      }).categories,
    ).toContain("inferred");
  });

  it("creates source keys from structured sources before display text", () => {
    expect(
      sourceKeysForEvent({
        sourceDetails: [
          { id: "source-a", label: "出典A" },
          { url: "https://example.test/source-b", label: "出典B" },
          { label: "出典C" },
        ],
        source: ["出典D"],
      }),
    ).toEqual([
      "id:source-a",
      "url:https://example.test/source-b",
      "text:出典c",
      "text:出典d",
    ]);
  });

  it("summarizes lane-owned audit quality counts from derived categories", () => {
    expect(
      summarizeEventAuditQuality([
        { occurrenceType: "singleWithinRange", source: ["source-a"] },
        { occurrenceType: "continuous", sourceStatus: "unsourced" },
        { occurrenceType: "continuous", conflicts: [{ summary: "矛盾" }] },
      ]),
    ).toEqual({
      issueCount: 3,
      conflictCount: 1,
      missingSourceCount: 1,
      inferredCount: 0,
      rangeOnlyCount: 1,
    });
  });
});
