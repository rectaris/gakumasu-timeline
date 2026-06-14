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
