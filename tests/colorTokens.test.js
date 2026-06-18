import { describe, expect, it } from "vitest";
import { characterColorSources } from "../src/data/colorSources";
import {
  createColorRoles,
  resolveColorDesign,
  resolveCommonEventColorDesign
} from "../src/utils/colorTokens";
import { contrastRatioFromHex } from "../src/utils/colors";

describe("color token resolution", () => {
  it("prefers official CSS character colors over legacy data colors", () => {
    const { colorSource, colorRoles } = resolveColorDesign({
      id: "saki_hanami",
      name: "Saki",
      color: "#E30920"
    });

    expect(colorSource.sourceColor).toBe(
      characterColorSources.saki_hanami.sourceColor
    );
    expect(colorSource.legacyColor).toBe("#E30920");
    expect(colorRoles.eventFill).toBe("#E30F25");
  });

  it("keeps lane labels readable for very light official colors", () => {
    const roles = createColorRoles({
      sourceColor: "#EAFDFF",
      provenance: "official-css"
    });

    expect(contrastRatioFromHex(roles.labelText, roles.labelBg)).toBeGreaterThanOrEqual(4.5);
    expect(roles.accentStrong).not.toBe("#EAFDFF");
  });

  it("uses a semantic fill and lane accent for common events", () => {
    const laneDesign = resolveColorDesign({
      id: "temari_tsukimura",
      name: "Temari",
      color: "#0D7CBC"
    });
    const commonDesign = resolveCommonEventColorDesign(
      { id: "common_events", color: "#FFFFFF" },
      laneDesign.colorRoles
    );

    expect(commonDesign.colorSource.sourceColor).toBe("#F6F1E8");
    expect(commonDesign.colorRoles.eventFill).toContain(
      "--timeline-common-event-fill"
    );
    expect(commonDesign.colorRoles.eventStroke).toBe(
      laneDesign.colorRoles.accentStrong
    );
  });
});
