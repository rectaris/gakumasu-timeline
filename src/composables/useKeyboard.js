import { onMounted, onUnmounted } from "vue";

export function useKeyboard({
  zoomMode,
  moveYear,
  moveMonth,
  moveDay,
  closePanel
}) {
  function handleKey(e) {
    if (e.key === "Escape") closePanel();
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

    const target = e.target;
    const tagName = target?.tagName?.toLowerCase();
    const isFormElement =
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target?.isContentEditable;

    if (isFormElement) return;

    const delta = e.key === "ArrowRight" ? 1 : -1;

    if (e.shiftKey) {
      moveYear(delta);
      return;
    }

    switch (zoomMode.value) {
      case "MONTH":
        moveMonth(delta);
        break;
      case "DAY":
        if (moveDay) moveDay(delta);
        break;
      case "YEAR":
        moveYear(delta);
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
