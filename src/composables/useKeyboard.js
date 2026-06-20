import { onMounted, onUnmounted } from "vue";
import { isFormElementTarget } from "../utils/dom";

export function useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  returnToSelectedEvent,
  closePanel,
}) {
  function handleKey(e) {
    const target = e.target;
    const isFormElement = isFormElementTarget(target);

    if (isFormElement) return;

    if (e.key === "Escape") {
      closePanel();
      return;
    }

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        panByViewportRatio(-0.12);
        break;
      case "ArrowRight":
        e.preventDefault();
        panByViewportRatio(0.12);
        break;
      case "+":
      case "=":
        e.preventDefault();
        zoomInHorizontal();
        break;
      case "-":
      case "_":
        e.preventDefault();
        zoomOutHorizontal();
        break;
      case "r":
      case "R":
        if (!returnToSelectedEvent) break;
        e.preventDefault();
        returnToSelectedEvent();
        break;
      default:
        break;
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);
  });
}
