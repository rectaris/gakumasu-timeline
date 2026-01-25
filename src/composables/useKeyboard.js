import { onMounted, onUnmounted } from "vue";

export function useKeyboard({ zoomMode, moveYear, moveMonth, closePanel }) {
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

    if (zoomMode.value === "month") {
      moveMonth(delta);
    } else if (zoomMode.value === "year") {
      moveYear(delta);
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);
  });
}
