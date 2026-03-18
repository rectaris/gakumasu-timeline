import { onMounted, onUnmounted } from "vue";

export function useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
  closePanel
}) {
  function handleKey(e) {
    if (e.key === "Escape") {
      closePanel();
      return;
    }

    const target = e.target;
    const tagName = target?.tagName?.toLowerCase();
    const isFormElement =
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target?.isContentEditable;

    if (isFormElement) return;

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
