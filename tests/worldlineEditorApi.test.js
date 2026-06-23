import { describe, expect, it } from "vitest";
import {
  applyWorldlineEditorMutation,
  previewWorldlineEditorMutation,
} from "../scripts/worldline-editor-api.mjs";

function baseEvent(id, title = id) {
  return {
    id,
    start: { year: 1, month: 4, day: 1 },
    end: { year: 1, month: 4, day: 1 },
    title,
    detail: `${title} detail`,
    occurrenceType: "singleWithinRange",
    participants: ["saki_hanami"],
  };
}

function baseState() {
  return {
    lanes: [
      {
        category: "idolCommu",
        sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
        lane: {
          id: "saki_hanami",
          name: "花海 咲季",
          color: "#E30920",
          events: [baseEvent("event_a", "A"), baseEvent("event_b", "B")],
        },
      },
      {
        category: "idolCommu",
        sourceFile: "data/raw/worldline_commu/idol_commu/002tsukimuraTemari.json",
        lane: {
          id: "temari_tsukimura",
          name: "月村 手毬",
          color: "#2269D4",
          events: [baseEvent("event_c", "C")],
        },
      },
    ],
  };
}

describe("worldline editor api", () => {
  it("updates an existing event by source file and event id", () => {
    const result = applyWorldlineEditorMutation(baseState(), {
      action: "update",
      sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      eventId: "event_a",
      event: { ...baseEvent("event_a", "Updated"), note: ["changed"] },
    });

    const lane = result.state.lanes[0].lane;
    expect(lane.events.map((event) => event.title)).toEqual(["Updated", "B"]);
    expect(result.changedSourceFiles).toEqual([
      "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
    ]);
  });

  it("moves an event between lane files", () => {
    const result = applyWorldlineEditorMutation(baseState(), {
      action: "update",
      sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      targetSourceFile: "data/raw/worldline_commu/idol_commu/002tsukimuraTemari.json",
      eventId: "event_b",
      event: {
        ...baseEvent("event_b", "B"),
        participants: ["temari_tsukimura"],
      },
    });

    expect(result.state.lanes[0].lane.events.map((event) => event.id)).toEqual([
      "event_a",
    ]);
    expect(result.state.lanes[1].lane.events.map((event) => event.id)).toEqual([
      "event_c",
      "event_b",
    ]);
    expect(result.changedSourceFiles).toEqual([
      "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      "data/raw/worldline_commu/idol_commu/002tsukimuraTemari.json",
    ]);
  });

  it("rejects invalid proposed edits during preview", async () => {
    const result = await previewWorldlineEditorMutation(
      {
        action: "add",
        sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
        event: {
          ...baseEvent("event_a", "Duplicate"),
        },
      },
      { state: baseState() },
    );

    expect(result.ok).toBe(false);
    expect(result.validation.errors.some((error) => error.field === "id")).toBe(
      true,
    );
    expect(result.patch).toContain("--- a/data/raw/worldline_commu/idol_commu/001hanamiSaki.json");
    expect(result.patch).toContain("Duplicate");
  });

  it("deletes only the selected event", () => {
    const result = applyWorldlineEditorMutation(baseState(), {
      action: "delete",
      sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      eventId: "event_a",
    });

    expect(result.state.lanes[0].lane.events.map((event) => event.id)).toEqual([
      "event_b",
    ]);
  });
});
