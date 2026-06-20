import { describe, expect, it, vi } from "vitest";
import {
  createKeyboardHandler,
  shouldIgnoreShortcutEvent,
} from "../src/composables/useKeyboard";

function keyboardEvent(overrides = {}) {
  return {
    key: "n",
    target: { tagName: "body" },
    defaultPrevented: false,
    isComposing: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  };
}

describe("useKeyboard", () => {
  it("ignores shortcut handling while typing or composing", () => {
    expect(
      shouldIgnoreShortcutEvent(
        keyboardEvent({ target: { tagName: "input" } }),
      ),
    ).toBe(true);
    expect(shouldIgnoreShortcutEvent(keyboardEvent({ isComposing: true }))).toBe(
      true,
    );
    expect(shouldIgnoreShortcutEvent(keyboardEvent({ ctrlKey: true }))).toBe(
      true,
    );
  });

  it("dispatches navigation, search, return, pan, zoom, and close shortcuts", () => {
    const actions = {
      panByViewportRatio: vi.fn(),
      zoomInHorizontal: vi.fn(),
      zoomOutHorizontal: vi.fn(),
      returnToSelectedEvent: vi.fn(),
      closeTopLayer: vi.fn(),
      focusEventSearch: vi.fn(),
      goToNextEvent: vi.fn(),
      goToPreviousEvent: vi.fn(),
    };
    const handleKey = createKeyboardHandler(actions);

    [
      ["ArrowLeft", () => expect(actions.panByViewportRatio).toHaveBeenCalledWith(-0.12)],
      ["ArrowRight", () => expect(actions.panByViewportRatio).toHaveBeenCalledWith(0.12)],
      ["+", () => expect(actions.zoomInHorizontal).toHaveBeenCalledTimes(1)],
      ["-", () => expect(actions.zoomOutHorizontal).toHaveBeenCalledTimes(1)],
      ["/", () => expect(actions.focusEventSearch).toHaveBeenCalledTimes(1)],
      ["n", () => expect(actions.goToNextEvent).toHaveBeenCalledTimes(1)],
      ["p", () => expect(actions.goToPreviousEvent).toHaveBeenCalledTimes(1)],
      ["R", () => expect(actions.returnToSelectedEvent).toHaveBeenCalledTimes(1)],
      ["Escape", () => expect(actions.closeTopLayer).toHaveBeenCalledTimes(1)],
    ].forEach(([key, assertion]) => {
      const event = keyboardEvent({ key });
      handleKey(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      assertion();
    });
  });

  it("does not prevent defaults for unknown or guarded keys", () => {
    const closeTopLayer = vi.fn();
    const goToNextEvent = vi.fn();
    const handleKey = createKeyboardHandler({ closeTopLayer, goToNextEvent });
    const unknown = keyboardEvent({ key: "x" });
    const guarded = keyboardEvent({
      key: "n",
      target: { tagName: "textarea" },
    });
    const escapeFromInput = keyboardEvent({
      key: "Escape",
      target: { tagName: "input" },
    });

    handleKey(unknown);
    handleKey(guarded);
    handleKey(escapeFromInput);

    expect(unknown.preventDefault).not.toHaveBeenCalled();
    expect(guarded.preventDefault).not.toHaveBeenCalled();
    expect(goToNextEvent).not.toHaveBeenCalled();
    expect(escapeFromInput.preventDefault).toHaveBeenCalledTimes(1);
    expect(closeTopLayer).toHaveBeenCalledTimes(1);
  });
});
