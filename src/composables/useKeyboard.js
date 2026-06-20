import { onMounted, onUnmounted } from "vue";
import { isFormElementTarget } from "../utils/dom";

const SHORTCUTS = Object.freeze([
  { key: "Escape", action: "closeTopLayer" },
  { key: "ArrowLeft", action: "panLeft" },
  { key: "ArrowRight", action: "panRight" },
  { key: "+", action: "zoomInHorizontal" },
  { key: "=", action: "zoomInHorizontal" },
  { key: "-", action: "zoomOutHorizontal" },
  { key: "_", action: "zoomOutHorizontal" },
  { key: "/", action: "focusEventSearch" },
  { key: "n", action: "goToNextEvent" },
  { key: "p", action: "goToPreviousEvent" },
  { key: "r", action: "returnToSelectedEvent" },
]);

function normalizeShortcutKey(key) {
  return key?.length === 1 ? key.toLocaleLowerCase("en-US") : key;
}

export function shouldIgnoreShortcutEvent(event, { allowFromForm = false } = {}) {
  return (
    event.defaultPrevented ||
    event.isComposing ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    (!allowFromForm && isFormElementTarget(event.target))
  );
}

export function createKeyboardHandler({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  returnToSelectedEvent,
  closeTopLayer,
  focusEventSearch,
  goToNextEvent,
  goToPreviousEvent,
}) {
  const actions = {
    closeTopLayer,
    focusEventSearch,
    goToNextEvent,
    goToPreviousEvent,
    returnToSelectedEvent,
    zoomInHorizontal,
    zoomOutHorizontal,
    panLeft: () => panByViewportRatio?.(-0.12),
    panRight: () => panByViewportRatio?.(0.12),
  };

  return function handleKey(event) {
    const key = normalizeShortcutKey(event.key);
    const shortcut = SHORTCUTS.find((item) => item.key === key);
    const action = shortcut ? actions[shortcut.action] : null;

    if (!action) return;
    if (
      shouldIgnoreShortcutEvent(event, {
        allowFromForm: shortcut.action === "closeTopLayer",
      })
    ) {
      return;
    }

    event.preventDefault();
    action();
  };
}

export function useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  returnToSelectedEvent,
  closeTopLayer,
  focusEventSearch,
  goToNextEvent,
  goToPreviousEvent,
}) {
  const handleKey = createKeyboardHandler({
    panByViewportRatio,
    zoomInHorizontal,
    zoomOutHorizontal,
    returnToSelectedEvent,
    closeTopLayer,
    focusEventSearch,
    goToNextEvent,
    goToPreviousEvent,
  });

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);
  });
}
