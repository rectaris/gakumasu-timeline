import { describe, expect, it } from "vitest";
import { idolCommu } from "../src/data";

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
});
