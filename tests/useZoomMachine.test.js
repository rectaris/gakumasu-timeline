import { nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { useZoomMachine } from "../src/composables/useZoomMachine";
import {
  MAX_VERTICAL_SCALE,
  MIN_VERTICAL_SCALE,
} from "../src/utils/constants";

function selectedEvent(start, end) {
  return {
    id: "selected",
    canonicalId: "selected",
    instanceId: "selected",
    laneIndex: 0,
    displayStartDay: start,
    displayEndDay: end,
    occurrenceType: "continuous",
  };
}

function zoomMachine() {
  const selected = ref(null);
  const machine = useZoomMachine(ref([0, 1000]), selected);

  return { ...machine, selected };
}

describe("useZoomMachine", () => {
  it("exposes viewport ratios for compact range controls", () => {
    const zoom = zoomMachine();

    zoom.setHorizontalRange(100, 200);

    expect(zoom.viewportRatio.value).toEqual({
      start: expect.closeTo(150 / 1100),
      end: expect.closeTo(250 / 1100),
      center: expect.closeTo(200 / 1100),
    });
  });

  it("moves the viewport center from a full-range ratio", () => {
    const zoom = zoomMachine();

    zoom.setHorizontalRange(100, 200);
    zoom.setViewportCenterByRatio(0);

    expect(zoom.viewRange.value).toEqual({
      min: expect.closeTo(-50),
      max: expect.closeTo(50),
    });
  });

  it("reveals a selected event with the smallest horizontal shift that contains it", async () => {
    const zoom = zoomMachine();

    zoom.setHorizontalRange(100, 200);
    zoom.selected.value = selectedEvent(210, 220);
    await nextTick();

    expect(zoom.viewRange.value).toEqual({
      min: expect.closeTo(124),
      max: expect.closeTo(224),
    });
  });

  it("centers deterministic presets on the selected event when present", async () => {
    const zoom = zoomMachine();

    zoom.selected.value = selectedEvent(500, 510);
    await nextTick();
    zoom.zoomToPreset("month");

    expect(zoom.viewRange.value).toEqual({
      min: expect.closeTo(489.5),
      max: expect.closeTo(520.5),
    });
  });

  it("clamps vertical scale to event-slot and Full HD derived bounds", () => {
    const zoom = zoomMachine();

    zoom.setVerticalScale(0.1);

    expect(zoom.verticalScale.value).toBeCloseTo(MIN_VERTICAL_SCALE);
    expect(zoom.canZoomOutVertical.value).toBe(false);

    zoom.setVerticalScale(50);

    expect(zoom.verticalScale.value).toBeCloseTo(MAX_VERTICAL_SCALE);
    expect(zoom.canZoomInVertical.value).toBe(false);

    zoom.resetVerticalZoom();

    expect(zoom.verticalScale.value).toBe(1);
    expect(zoom.canZoomInVertical.value).toBe(true);
    expect(zoom.canZoomOutVertical.value).toBe(true);
  });
});
