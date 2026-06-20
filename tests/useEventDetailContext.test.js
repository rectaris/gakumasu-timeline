import { describe, expect, it } from "vitest";
import {
  createEventShareUrl,
  resolveEventDetailContext,
} from "../src/composables/useEventDetailContext";

const characterCatalog = [
  { id: "saki_hanami", name: "花海咲季" },
  { id: "temari_tsukimura", name: "月村手毬" },
];

const worldlines = [
  { id: "idol_story", name: "アイドルコミュ" },
  { id: "hatsuboshi_commu", name: "初星コミュ" },
];

function event(overrides = {}) {
  return {
    id: "event-a",
    canonicalId: "event-a",
    instanceId: "event-a",
    title: "朝の練習",
    detail: "屋上で基礎練習をする",
    source: ["花海咲季 親愛度 第1話"],
    note: ["補足メモ"],
    participants: ["saki_hanami"],
    worldlineId: ["idol_story"],
    occurrenceType: "continuous",
    displayStartDay: 10,
    displayEndDay: 12,
    laneIndex: 0,
    character: "花海咲季",
    isCommon: false,
    ...overrides,
  };
}

describe("event detail context", () => {
  it("resolves labels, source fields, uncertainty, and absolute share URL", () => {
    const selectedEvent = event({
      occurrenceType: "singleWithinRange",
      worldlineId: ["idol_story", "missing_worldline"],
      participants: ["saki_hanami", "unknown_person"],
    });

    const context = resolveEventDetailContext({
      selectedEvent,
      allEvents: [selectedEvent],
      visibleEvents: [selectedEvent],
      characterCatalog,
      worldlines,
      locationLike: {
        href: "https://example.test/timeline/?foo=bar",
        pathname: "/timeline/",
        search: "?foo=bar",
      },
    });

    expect(context.participantLabels).toEqual(["花海咲季", "unknown_person"]);
    expect(context.worldlineLabels).toEqual(["アイドルコミュ", "missing_worldline"]);
    expect(context.sources).toEqual(["花海咲季 親愛度 第1話"]);
    expect(context.notes).toEqual(["補足メモ"]);
    expect(context.isUncertain).toBe(true);
    expect(context.uncertainty).toMatchObject({
      state: "rangeOnly",
      stateLabel: "期間内の1日",
      dateConfidenceLabel: "期間内の1日",
      sourceStatusLabel: "出典確認",
      rangeReasonLabel: "出典上の候補期間",
    });
    expect(context.shareUrl).toBe("https://example.test/timeline/?foo=bar&event=event-a");
  });

  it("resolves structured source details and conflict metadata", () => {
    const selectedEvent = event({
      dateConfidence: "inferred",
      sourceBasis: "mixed",
      sourceStatus: "conflicting",
      sourceDetails: [
        {
          id: "reiris_1_1",
          label: "Story of Re;IRIS 1章 第1話",
          status: "confirmed",
          claim: "時期Aを示す",
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
    });

    const context = resolveEventDetailContext({
      selectedEvent,
      allEvents: [selectedEvent],
      visibleEvents: [selectedEvent],
      characterCatalog,
      worldlines,
      locationLike: {
        href: "https://example.test/",
        pathname: "/",
        search: "",
      },
    });

    expect(context.sourceDetails).toEqual(selectedEvent.sourceDetails);
    expect(context.conflicts).toEqual(selectedEvent.conflicts);
    expect(context.uncertainty).toMatchObject({
      state: "conflicting",
      stateLabel: "出典矛盾",
      dateConfidenceLabel: "推定",
      sourceBasisLabel: "混在",
      sourceStatusLabel: "出典矛盾",
    });
  });

  it("deduplicates related events by canonical id and prefers the selected lane instance", () => {
    const selectedEvent = event();
    const commonLaneZero = event({
      id: "common-a",
      canonicalId: "common-a",
      instanceId: "common-a__lane-zero",
      title: "共通イベント",
      laneIndex: 0,
      isCommon: true,
    });
    const commonLaneOne = event({
      id: "common-a",
      canonicalId: "common-a",
      instanceId: "common-a__lane-one",
      title: "共通イベント",
      laneIndex: 1,
      isCommon: true,
    });

    const context = resolveEventDetailContext({
      selectedEvent,
      allEvents: [selectedEvent, commonLaneOne, commonLaneZero],
      visibleEvents: [selectedEvent, commonLaneOne, commonLaneZero],
      characterCatalog,
      worldlines,
      locationLike: {
        href: "https://example.test/",
        pathname: "/",
        search: "",
      },
    });
    const commonSection = context.relatedSections.find(
      (section) => section.id === "common",
    );

    expect(commonSection.items).toEqual([commonLaneZero]);
  });

  it("adds same-source context without implying event causality", () => {
    const selectedEvent = event({
      source: undefined,
      sourceDetails: [{ id: "shared-source", label: "共有出典" }],
    });
    const sameSource = event({
      id: "same-source",
      canonicalId: "same-source",
      instanceId: "same-source",
      title: "同じ出典のイベント",
      source: undefined,
      sourceDetails: [{ id: "shared-source", label: "共有出典" }],
      displayStartDay: 20,
      displayEndDay: 20,
    });
    const differentSource = event({
      id: "different-source",
      canonicalId: "different-source",
      instanceId: "different-source",
      source: undefined,
      sourceDetails: [{ id: "other-source", label: "別出典" }],
    });

    const context = resolveEventDetailContext({
      selectedEvent,
      allEvents: [selectedEvent, sameSource, differentSource],
      visibleEvents: [selectedEvent, sameSource, differentSource],
      characterCatalog,
      worldlines,
      locationLike: {
        href: "https://example.test/",
        pathname: "/",
        search: "",
      },
    });
    const sourceSection = context.relatedSections.find(
      (section) => section.id === "same-source",
    );

    expect(sourceSection.title).toBe("同じ出典");
    expect(sourceSection.description).toBe("出典キーが共通するイベントです。");
    expect(sourceSection.items.map((item) => item.id)).toEqual(["same-source"]);
  });

  it("uses visible events for visible-period context and caps related sections", () => {
    const selectedEvent = event();
    const visibleRelated = event({
      id: "visible-related",
      canonicalId: "visible-related",
      instanceId: "visible-related",
      title: "表示中の同時期",
      laneIndex: 1,
    });
    const hiddenRelated = event({
      id: "hidden-related",
      canonicalId: "hidden-related",
      instanceId: "hidden-related",
      title: "非表示の同時期",
      laneIndex: 1,
    });
    const sameParticipantEvents = Array.from({ length: 4 }, (_, index) =>
      event({
        id: `participant-${index}`,
        canonicalId: `participant-${index}`,
        instanceId: `participant-${index}`,
        title: `参加者イベント${index}`,
        displayStartDay: 20 + index,
        displayEndDay: 20 + index,
      }),
    );

    const context = resolveEventDetailContext({
      selectedEvent,
      allEvents: [
        selectedEvent,
        visibleRelated,
        hiddenRelated,
        ...sameParticipantEvents,
      ],
      visibleEvents: [selectedEvent, visibleRelated],
      characterCatalog,
      worldlines,
      locationLike: {
        href: "https://example.test/",
        pathname: "/",
        search: "",
      },
    });
    const nearbySection = context.relatedSections.find(
      (section) => section.id === "nearby-visible",
    );
    const participantSection = context.relatedSections.find(
      (section) => section.id === "same-participant",
    );

    expect(nearbySection.items.map((item) => item.id)).toEqual(["visible-related"]);
    expect(participantSection.items).toHaveLength(3);
    expect(participantSection.overflowCount).toBe(3);
  });

  it("creates share URLs with canonical event ids", () => {
    expect(
      createEventShareUrl(event({ id: "render-id", canonicalId: "canonical-id" }), {
        href: "https://example.test/app/?event=old",
        pathname: "/app/",
        search: "?event=old",
      }),
    ).toBe("https://example.test/app/?event=canonical-id");
  });
});
