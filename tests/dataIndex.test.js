import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { hatsuboshiCommus, idolCommu } from "../src/data";
import legacyStoryOfReiris from "../src/data/worldline_commu/hatsuboshi_commu/001storyOfReiris";
import { useTimelineData } from "../src/composables/useTimelineData";

function sortedDefaultExports(modules) {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "en"))
    .map(([, moduleDefault]) => moduleDefault);
}

const legacyIdolCommu = sortedDefaultExports(
  import.meta.glob("../src/data/worldline_commu/idol_commu/*.js", {
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

  it("loads generated idol commus without changing legacy ids or order", () => {
    expect(idolCommu.map((lane) => lane.id)).toEqual(
      legacyIdolCommu.map((lane) => lane.id),
    );
    expect(eventIds(idolCommu)).toEqual(eventIds(legacyIdolCommu));
  });

  it("keeps generated idol event ids as URL-facing canonical ids", () => {
    const { allEvents } = useTimelineData(ref(idolCommu));

    expect(allEvents.value.map((event) => event.canonicalId)).toEqual(
      eventIds(legacyIdolCommu),
    );
  });

  it("loads generated hatsuboshi commus without changing legacy ids or order", () => {
    const [storyOfReiris] = hatsuboshiCommus;

    expect(storyOfReiris.id).toBe(legacyStoryOfReiris.id);
    expect(storyOfReiris.events.map((event) => event.id)).toEqual(
      legacyStoryOfReiris.events.map((event) => event.id),
    );
  });

  it("keeps generated hatsuboshi event ids as URL-facing canonical ids", () => {
    const { allEvents } = useTimelineData(ref(hatsuboshiCommus));

    expect(allEvents.value.map((event) => event.canonicalId)).toEqual(
      legacyStoryOfReiris.events.map((event) => event.id),
    );
  });
});
