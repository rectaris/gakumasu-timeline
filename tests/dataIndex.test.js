import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { commonTimeline, hatsuboshiCommus, idolCommu } from "../src/data";
import rawStoryOfReiris from "../data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.json";
import rawCommonTimeline from "../data/raw/worldline_commu/common_timeline.json";
import { useTimelineData } from "../src/composables/useTimelineData";

function sortedDefaultExports(modules) {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([, moduleDefault]) => moduleDefault);
}

const rawIdolCommu = sortedDefaultExports(
  import.meta.glob("../data/raw/worldline_commu/idol_commu/*.json", {
    eager: true,
    import: "default",
  }),
);

function eventIds(lanes) {
  return lanes.flatMap((lane) => lane.events.map((event) => event.id));
}

describe("data index", () => {
  it("loads idol commus in numbered filename order", () => {
    expect(idolCommu.map((lane) => lane.id)).toEqual([
      "saki_hanami",
      "temari_tsukimura",
      "kotone_fujita",
      "mao_arimura",
      "lilja_katsuragi",
      "china_kuramoto",
      "sumika_shiun",
      "hiro_shinosawa",
      "rinami_himesaki",
      "ume_hanami",
      "sena_juo",
      "misuzu_hataya",
      "tsubame_amaya",
    ]);
  });

  it("loads generated idol commus without changing raw ids or order", () => {
    expect(idolCommu.map((lane) => lane.id)).toEqual(
      rawIdolCommu.map((lane) => lane.id),
    );
    expect(eventIds(idolCommu)).toEqual(eventIds(rawIdolCommu));
  });

  it("keeps generated idol event ids as URL-facing canonical ids", () => {
    const { allEvents } = useTimelineData(ref(idolCommu));

    expect(allEvents.value.map((event) => event.canonicalId)).toEqual(
      eventIds(rawIdolCommu),
    );
  });

  it("loads generated hatsuboshi commus without changing raw ids or order", () => {
    const [storyOfReiris] = hatsuboshiCommus;

    expect(storyOfReiris.id).toBe(rawStoryOfReiris.id);
    expect(storyOfReiris.events.map((event) => event.id)).toEqual(
      rawStoryOfReiris.events.map((event) => event.id),
    );
  });

  it("keeps generated hatsuboshi event ids as URL-facing canonical ids", () => {
    const { allEvents } = useTimelineData(ref(hatsuboshiCommus));

    expect(allEvents.value.map((event) => event.canonicalId)).toEqual(
      rawStoryOfReiris.events.map((event) => event.id),
    );
  });

  it("loads generated common timeline without changing raw ids or order", () => {
    expect(commonTimeline.id).toBe(rawCommonTimeline.id);
    expect(commonTimeline.events.map((event) => event.id)).toEqual(
      rawCommonTimeline.events.map((event) => event.id),
    );
  });

  it("keeps generated common event ids as URL-facing canonical ids", () => {
    const visibleLanes = idolCommu.slice(0, 2);
    const { allEvents } = useTimelineData(
      ref(visibleLanes),
      commonTimeline,
      ref(true),
    );
    const commonEvents = allEvents.value.filter((event) => event.isCommon);
    const expectedCanonicalIds = visibleLanes.flatMap(() =>
      rawCommonTimeline.events.map((event) => event.id),
    );

    expect(commonEvents.map((event) => event.canonicalId)).toEqual(
      expectedCanonicalIds,
    );
  });
});
