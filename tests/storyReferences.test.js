import { describe, expect, it } from "vitest";
import {
  buildStoryReferenceIndex,
  storyReferenceMap,
} from "../src/data/storyReferences";

function entry(events) {
  return {
    sourceFile: "data/raw/worldline_commu/test.json",
    lane: {
      id: "lane-a",
      name: "検証レーン",
      events,
    },
  };
}

describe("story reference index", () => {
  it("derives a reverse index without mutating source-owned references", () => {
    const references = [
      {
        id: "ref_40000000-0000-4000-8000-000000000002",
        storyBlockId: "block_20000000-0000-4000-8000-000000000001",
        type: "related",
        order: 2,
      },
      {
        id: "ref_40000000-0000-4000-8000-000000000001",
        storyBlockId: "block_20000000-0000-4000-8000-000000000001",
        type: "source",
        label: "出典コミュ",
        order: 1,
      },
    ];
    const index = buildStoryReferenceIndex([
      entry([
        {
          id: "event-a",
          title: "出来事A",
          storyReferences: references,
        },
      ]),
    ]);

    expect(index).toEqual({
      "block_20000000-0000-4000-8000-000000000001": [
        expect.objectContaining({
          referenceId: references[1].id,
          eventId: "event-a",
          laneName: "検証レーン",
        }),
        expect.objectContaining({
          referenceId: references[0].id,
          eventId: "event-a",
        }),
      ],
    });
    expect(references[0]).not.toHaveProperty("eventId");
    expect(storyReferenceMap(index).get(references[0].storyBlockId)).toHaveLength(
      2,
    );
  });
});
