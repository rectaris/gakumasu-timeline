import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  applyWorldlineEditorMutation,
  previewWorldlineEditorMutation,
  readWorldlineEditorState,
  validateWorldlineEditorWriteRequest,
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
  it("requires same-origin JSON writes with the current editor session token", () => {
    const request = (headers) => ({ headers });
    const validHeaders = {
      host: "127.0.0.1:5173",
      origin: "http://127.0.0.1:5173",
      "content-type": "application/json; charset=utf-8",
      "x-worldline-editor-token": "test-session-token",
    };

    expect(
      validateWorldlineEditorWriteRequest(request(validHeaders), "test-session-token"),
    ).toBeNull();
    expect(
      validateWorldlineEditorWriteRequest(
        request({ ...validHeaders, origin: "https://attacker.example" }),
        "test-session-token",
      ),
    ).toMatchObject({ statusCode: 403 });
    expect(
      validateWorldlineEditorWriteRequest(
        request({ ...validHeaders, "x-worldline-editor-token": "wrong" }),
        "test-session-token",
      ),
    ).toMatchObject({ statusCode: 403 });
    expect(
      validateWorldlineEditorWriteRequest(
        request({ ...validHeaders, "content-type": "text/plain" }),
        "test-session-token",
      ),
    ).toMatchObject({ statusCode: 415 });
  });

  it("keeps participant options in raw idol commu file order", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "worldline-editor-"));
    const rawDirectory = path.join(root, "data/raw/worldline_commu/idol_commu");
    await fs.mkdir(rawDirectory, { recursive: true });
    await fs.writeFile(
      path.join(rawDirectory, "001zeta.json"),
      JSON.stringify({
        id: "zeta_idol",
        name: "ゼータ",
        color: "#111111",
        events: [],
      }),
    );
    await fs.writeFile(
      path.join(rawDirectory, "002alpha.json"),
      JSON.stringify({
        id: "alpha_idol",
        name: "アルファ",
        color: "#222222",
        events: [],
      }),
    );

    const state = await readWorldlineEditorState({
      root,
      files: [
        {
          category: "idolCommu",
          raw: "data/raw/worldline_commu/idol_commu/002alpha.json",
          generated: "unused/002alpha.js",
        },
        {
          category: "idolCommu",
          raw: "data/raw/worldline_commu/idol_commu/001zeta.json",
          generated: "unused/001zeta.js",
        },
      ],
    });

    expect(state.options.participants.map((option) => option.id)).toEqual([
      "zeta_idol",
      "alpha_idol",
    ]);
  });

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

  it("adds an event to a new lane file", () => {
    const result = applyWorldlineEditorMutation(baseState(), {
      action: "add",
      sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      targetSourceFile: "data/raw/worldline_commu/event_commu/001newEvent.json",
      targetNewLane: {
        category: "eventCommus",
        lane: {
          id: "new_event_commu",
          name: "新規イベントコミュ",
          color: "#888888",
          events: [],
        },
      },
      event: baseEvent("new_event", "New Event"),
    });

    const newLane = result.state.lanes.find(
      (entry) =>
        entry.sourceFile === "data/raw/worldline_commu/event_commu/001newEvent.json",
    );

    expect(newLane).toMatchObject({
      category: "eventCommus",
      generatedFile: "src/data/generated/worldline_commu/event_commu/001newEvent.js",
      lane: {
        id: "new_event_commu",
        name: "新規イベントコミュ",
        color: "#888888",
      },
    });
    expect(newLane.lane.events.map((event) => event.id)).toEqual(["new_event"]);
    expect(result.changedSourceFiles).toEqual([
      "data/raw/worldline_commu/event_commu/001newEvent.json",
    ]);
  });

  it("moves an existing event to a new lane file", () => {
    const result = applyWorldlineEditorMutation(baseState(), {
      action: "update",
      sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
      targetSourceFile: "data/raw/worldline_commu/event_commu/001newEvent.json",
      targetNewLane: {
        category: "eventCommus",
        lane: {
          id: "new_event_commu",
          name: "新規イベントコミュ",
          color: "#888888",
          events: [],
        },
      },
      eventId: "event_b",
      event: baseEvent("event_b", "B"),
    });

    const newLane = result.state.lanes.find(
      (entry) =>
        entry.sourceFile === "data/raw/worldline_commu/event_commu/001newEvent.json",
    );
    const sourceLane = result.state.lanes.find(
      (entry) =>
        entry.sourceFile === "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
    );

    expect(sourceLane.lane.events.map((event) => event.id)).toEqual([
      "event_a",
    ]);
    expect(newLane.lane.events.map((event) => event.id)).toEqual(["event_b"]);
    expect(result.changedSourceFiles).toEqual([
      "data/raw/worldline_commu/event_commu/001newEvent.json",
      "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
    ]);
  });

  it("rejects invalid new lane file paths", () => {
    expect(() =>
      applyWorldlineEditorMutation(baseState(), {
        action: "add",
        sourceFile: "data/raw/worldline_commu/idol_commu/001hanamiSaki.json",
        targetSourceFile: "data/raw/worldline_commu/event_commu/nested/bad.json",
        targetNewLane: {
          category: "eventCommus",
          lane: {
            id: "bad",
            name: "Bad",
            color: "#888888",
            events: [],
          },
        },
        event: baseEvent("new_event", "New Event"),
      }),
    ).toThrow("Invalid new source file");
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
