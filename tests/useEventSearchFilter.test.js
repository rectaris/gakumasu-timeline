import { computed, ref } from "vue";
import { describe, expect, it } from "vitest";
import {
  buildEventSearchText,
  collapseEventsByCanonicalId,
  compareEventsForNavigation,
  filterEvents,
  useEventSearchFilter,
} from "../src/composables/useEventSearchFilter";

const lanes = [
  { id: "lane-saki", name: "花海咲季" },
  { id: "lane-temari", name: "月村手毬" },
];

const characters = [
  { id: "saki_hanami", name: "花海咲季" },
  { id: "temari_tsukimura", name: "月村手毬" },
];

const worldlines = [
  { id: "idol_story", name: "アイドルコミュ" },
  { id: "hatsuboshi_commu", name: "初星コミュ" },
];

const context = { lanes, characters, worldlines };

function event(overrides) {
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
    isCommon: false,
    ...overrides,
  };
}

describe("event search and filters", () => {
  it("builds searchable text from event fields and resolved catalog names", () => {
    const text = buildEventSearchText(event(), context);

    expect(text).toContain("朝の練習");
    expect(text).toContain("saki_hanami");
    expect(text).toContain("花海咲季");
    expect(text).toContain("idol_story");
    expect(text).toContain("アイドルコミュ");
  });

  it("matches all query terms across different fields", () => {
    const events = [
      event(),
      event({
        id: "event-b",
        title: "別イベント",
        detail: "別の場所",
        participants: ["temari_tsukimura"],
      }),
    ];

    expect(
      filterEvents(
        events,
        {
          query: "咲季 屋上",
          occurrenceType: "all",
          uncertainty: "all",
          participant: "all",
          commu: "all",
          worldline: "all",
        },
        context,
      ),
    ).toEqual([events[0]]);
  });

  it("combines filter groups with AND semantics", () => {
    const events = [
      event({
        id: "event-a",
        canonicalId: "event-a",
        occurrenceType: "singleWithinRange",
      }),
      event({
        id: "event-b",
        canonicalId: "event-b",
        participants: ["temari_tsukimura"],
        laneIndex: 1,
        worldlineId: ["hatsuboshi_commu"],
      }),
    ];

    expect(
      filterEvents(
        events,
        {
          query: "",
          occurrenceType: "singleWithinRange",
          uncertainty: "uncertain",
          participant: "saki_hanami",
          commu: "lane-saki",
          worldline: "idol_story",
        },
        context,
      ),
    ).toEqual([events[0]]);
  });

  it("filters by explicit uncertainty states and indexes uncertainty labels", () => {
    const events = [
      event({
        id: "confirmed",
        canonicalId: "confirmed",
      }),
      event({
        id: "inferred",
        canonicalId: "inferred",
        dateConfidence: "inferred",
        sourceBasis: "inferred",
        sourceDetails: [
          {
            id: "source-inferred",
            label: "推定根拠",
            supports: ["date"],
          },
        ],
      }),
      event({
        id: "range",
        canonicalId: "range",
        occurrenceType: "singleWithinRange",
      }),
      event({
        id: "conflict",
        canonicalId: "conflict",
        conflicts: [{ summary: "出典Aと出典Bで時期が異なる" }],
      }),
    ];

    expect(
      filterEvents(
        events,
        {
          query: "source-inferred 時期",
          occurrenceType: "all",
          uncertainty: "inferred",
          participant: "all",
          commu: "all",
          worldline: "all",
        },
        context,
      ).map((item) => item.id),
    ).toEqual(["inferred"]);
    expect(
      filterEvents(
        events,
        {
          query: "出典矛盾",
          occurrenceType: "all",
          uncertainty: "conflicting",
          participant: "all",
          commu: "all",
          worldline: "all",
        },
        context,
      ).map((item) => item.id),
    ).toEqual(["conflict"]);
  });

  it("collapses duplicated common events by canonical id for navigation", () => {
    const events = [
      event({
        id: "common-a",
        canonicalId: "common-a",
        instanceId: "common-a__lane-saki",
        isCommon: true,
      }),
      event({
        id: "common-a",
        canonicalId: "common-a",
        instanceId: "common-a__lane-temari",
        isCommon: true,
        laneIndex: 1,
      }),
    ];

    expect(collapseEventsByCanonicalId(events)).toEqual([events[0]]);
  });

  it("orders navigation by timeline position, lane, then title", () => {
    const events = [
      event({ id: "late", canonicalId: "late", title: "Late", displayStartDay: 20 }),
      event({ id: "lane-1", canonicalId: "lane-1", title: "Lane 1", laneIndex: 1 }),
      event({ id: "lane-0", canonicalId: "lane-0", title: "Lane 0", laneIndex: 0 }),
    ];

    expect(events.slice().sort(compareEventsForNavigation).map((item) => item.id)).toEqual([
      "lane-0",
      "lane-1",
      "late",
    ]);
  });

  it("exposes filtered events, canonical navigation count, and active state", () => {
    const allEvents = ref([
      event(),
      event({
        id: "event-b",
        canonicalId: "event-b",
        instanceId: "event-b",
        title: "手毬の確認",
        participants: ["temari_tsukimura"],
        laneIndex: 1,
      }),
    ]);
    const laneRef = computed(() => lanes);
    const search = useEventSearchFilter({
      allEvents,
      lanes: laneRef,
      characterCatalog: characters,
      worldlines,
    });

    search.eventSearchQuery.value = "手毬";

    expect(search.filteredEvents.value.map((item) => item.id)).toEqual(["event-b"]);
    expect(search.resultSummary.value).toEqual({
      visible: 1,
      canonical: 1,
      total: 2,
    });
    expect(search.hasActiveEventFilters.value).toBe(true);
  });
});
