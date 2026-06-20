import { describe, expect, it } from "vitest";
import {
  formatTimelineDataIntegrityErrors,
  validateTimelineData,
} from "../src/data/integrity";
import { runTimelineDataIntegrityValidation } from "../src/data/integrityRunner";

const ids = {
  characterIds: new Set(["character-a"]),
  worldlineIds: new Set(["worldline-a"]),
};

function entry(events) {
  return [
    {
      category: "test",
      sourceFile: "src/data/test.js",
      lane: {
        id: "lane-a",
        name: "Lane A",
        events,
      },
    },
  ];
}

function entryForSource(sourceFile, events, laneId = "lane-a") {
  return {
    category: "test",
    sourceFile,
    lane: {
      id: laneId,
      name: laneId,
      events,
    },
  };
}

function validEvent(overrides = {}) {
  return {
    id: "event-a",
    start: { year: 1, month: 4, day: 1 },
    end: { year: 1, month: 4, day: 1 },
    occurrenceType: "singleWithinRange",
    title: "Event A",
    detail: "Event A detail",
    participants: ["character-a"],
    worldlineId: ["worldline-a"],
    source: ["source-a"],
    note: ["note-a"],
    ...overrides,
  };
}

describe("timeline data integrity", () => {
  it("validates current durable timeline data", () => {
    const result = runTimelineDataIntegrityValidation();

    expect(result.errors, result.message).toEqual([]);
  });

  it("detects duplicate event ids", () => {
    const errors = validateTimelineData(
      entry([validEvent(), validEvent({ title: "Duplicate Event" })]),
      ids,
    );

    expect(errors).toEqual([
      expect.objectContaining({
        field: "id",
        reason: expect.stringContaining('duplicate event id "event-a"'),
      }),
    ]);
  });

  it("reports focused duplicate event ids using the full dataset context", () => {
    const errors = validateTimelineData(
      [
        entryForSource("src/data/a.js", [validEvent()]),
        entryForSource("src/data/b.js", [
          validEvent({ title: "Duplicate Event" }),
        ]),
      ],
      {
        ...ids,
        focusSourceFiles: new Set(["src/data/a.js"]),
      },
    );

    expect(errors).toEqual([
      expect.objectContaining({
        sourceFile: "src/data/a.js",
        field: "id",
        reason: expect.stringContaining('duplicate event id "event-a"'),
      }),
    ]);
  });

  it("suppresses non-focused field errors during focused validation", () => {
    const errors = validateTimelineData(
      [
        entryForSource("src/data/a.js", [validEvent()]),
        entryForSource("src/data/b.js", [
          validEvent({
            id: "event-b",
            start: { year: 1, month: 13, day: 1 },
          }),
        ]),
      ],
      {
        ...ids,
        focusSourceFiles: new Set(["src/data/a.js"]),
      },
    );

    expect(errors).toEqual([]);
  });

  it("detects invalid date parts and ranges", () => {
    const errors = validateTimelineData(
      entry([
        validEvent({
          start: { year: 1, month: 13, day: 1 },
          end: { year: 1, month: 4, day: 32 },
        }),
        validEvent({
          id: "event-b",
          start: { year: 1, month: 5, day: 1 },
          end: { year: 1, month: 4, day: 31 },
        }),
      ]),
      ids,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "start.month" }),
        expect.objectContaining({ field: "end.day" }),
        expect.objectContaining({
          field: "start",
          reason: "must be less than or equal to end",
        }),
      ]),
    );
  });

  it("requires an explicit occurrence type", () => {
    const { occurrenceType, ...eventWithoutOccurrenceType } = validEvent();
    const errors = validateTimelineData(entry([eventWithoutOccurrenceType]), ids);

    expect(errors).toEqual([
      expect.objectContaining({
        field: "occurrenceType",
        reason: "must be explicit",
      }),
    ]);
  });

  it("detects empty string values and broken references", () => {
    const errors = validateTimelineData(
      entry([
        validEvent({
          participants: ["", "missing-character"],
          worldlineId: ["missing-worldline"],
          source: [" "],
          note: [""],
        }),
      ]),
      ids,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "participants[0]" }),
        expect.objectContaining({
          field: "participants[1]",
          reason: 'unknown id "missing-character"',
        }),
        expect.objectContaining({
          field: "worldlineId[0]",
          reason: 'unknown id "missing-worldline"',
        }),
        expect.objectContaining({ field: "source[0]" }),
        expect.objectContaining({ field: "note[0]" }),
      ]),
    );
  });

  it("accepts structured uncertainty metadata", () => {
    const errors = validateTimelineData(
      entry([
        validEvent({
          dateConfidence: "rangeOnly",
          sourceBasis: "mixed",
          sourceStatus: "conflicting",
          rangeReason: "chapterOrder",
          sourceDetails: [
            {
              id: "reiris_1_1",
              label: "Story of Re;IRIS 1章 第1話",
              status: "confirmed",
              claim: "候補期間の開始を示す",
              supports: ["event", "date"],
            },
          ],
          conflicts: [
            {
              summary: "出典ごとに候補時期が異なる",
              sources: ["source-a", "source-b"],
              resolution: "未解決",
            },
          ],
        }),
      ]),
      ids,
    );

    expect(errors).toEqual([]);
  });

  it("detects unsupported uncertainty metadata combinations", () => {
    const errors = validateTimelineData(
      entry([
        validEvent({
          occurrenceType: "continuous",
          dateConfidence: "rangeOnly",
          rangeReason: "sourceRange",
          sourceStatus: "confirmed",
          conflicts: [{ summary: "出典矛盾あり" }],
          sourceDetails: [
            {
              id: "",
              label: "",
              status: "invalid",
              supports: ["invalid-target"],
            },
          ],
        }),
        validEvent({
          id: "event-b",
          sourceStatus: "unsourced",
          source: ["source-a"],
        }),
        validEvent({
          id: "event-c",
          sourceStatus: "confirmed",
          source: undefined,
        }),
        validEvent({
          id: "event-d",
          sourceStatus: "conflicting",
          conflicts: undefined,
        }),
        validEvent({
          id: "event-e",
          sourceDetails: [
            { id: "duplicate-source", label: "Source A" },
            { id: "duplicate-source", label: "Source B" },
          ],
        }),
      ]),
      ids,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "dateConfidence",
          reason: 'rangeOnly requires occurrenceType "singleWithinRange"',
        }),
        expect.objectContaining({
          field: "rangeReason",
          reason: 'requires occurrenceType "singleWithinRange"',
        }),
        expect.objectContaining({
          field: "sourceStatus",
          reason: 'must be "conflicting" when conflicts are present',
        }),
        expect.objectContaining({
          field: "sourceDetails[0].id",
          reason: "must not be empty",
        }),
        expect.objectContaining({
          field: "sourceDetails[0].label",
          reason: "must not be empty",
        }),
        expect.objectContaining({
          field: "sourceDetails[0].status",
          reason: expect.stringContaining("must be one of"),
        }),
        expect.objectContaining({
          field: "sourceDetails[0].supports[0]",
          reason: expect.stringContaining("must be one of"),
        }),
        expect.objectContaining({
          field: "sourceStatus",
          reason: 'must not be "unsourced" when source or sourceDetails are present',
        }),
        expect.objectContaining({
          field: "sourceStatus",
          reason: "confirmed requires source or sourceDetails",
        }),
        expect.objectContaining({
          field: "conflicts",
          reason: 'must be present when sourceStatus is "conflicting"',
        }),
        expect.objectContaining({
          field: "sourceDetails[1].id",
          reason: 'duplicate source detail id "duplicate-source"',
        }),
      ]),
    );
  });

  it("formats errors with source, lane, event, field, and reason", () => {
    const message = formatTimelineDataIntegrityErrors([
      {
        sourceFile: "src/data/test.js",
        category: "test",
        laneId: "lane-a",
        laneName: "Lane A",
        eventId: "event-a",
        eventTitle: "Event A",
        eventIndex: 0,
        field: "source[0]",
        reason: "must not be empty",
      },
    ]);

    expect(message).toContain("src/data/test.js");
    expect(message).toContain("lane-a (Lane A)");
    expect(message).toContain("id=event-a");
    expect(message).toContain("title=Event A");
    expect(message).toContain("field: source[0]");
    expect(message).toContain("reason: must not be empty");
  });
});
