import { onMounted, onUnmounted } from "vue";

function isFormElementTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target?.isContentEditable
  );
}

export function useKeyboard({
  panByViewportRatio,
  zoomInHorizontal,
  zoomOutHorizontal,
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
