import { computed, onMounted, onUnmounted, ref } from "vue";

const MOUSE_DRAG_THRESHOLD = 4;
const TOUCH_DRAG_THRESHOLD = 8;
const CLICK_SUPPRESSION_MS = 80;

export function usePointer({ panByPixels }) {
  const mouseActive = ref(false);
  const mousePanActive = ref(false);
  const touchActive = ref(false);
  const touchPanActive = ref(false);
  const suppressNextClick = ref(false);
  const dragSurfaceElement = ref(null);
  const lastPointerX = ref(0);
  const lastPointerY = ref(0);
  let clearSuppressionTimer = null;

  const isDragging = computed(
    () => mousePanActive.value || touchPanActive.value,
  );

  function clearClickSuppressionTimer() {
    if (clearSuppressionTimer !== null) {
      window.clearTimeout(clearSuppressionTimer);
      clearSuppressionTimer = null;
    }
  }

  function scheduleClickSuppressionClear() {
    clearClickSuppressionTimer();
    clearSuppressionTimer = window.setTimeout(() => {
      suppressNextClick.value = false;
      clearSuppressionTimer = null;
    }, CLICK_SUPPRESSION_MS);
  }

  function consumeNextClick() {
    suppressNextClick.value = true;
    scheduleClickSuppressionClear();
  }

  function resetMouse() {
    mouseActive.value = false;
    mousePanActive.value = false;
    dragSurfaceElement.value = null;
  }

  function resetTouch() {
    touchActive.value = false;
    touchPanActive.value = false;
  }

  function onMouseDown(event) {
    if (event.button !== 0) return;

    event.preventDefault();
    mouseActive.value = true;
    mousePanActive.value = false;
    dragSurfaceElement.value = event.currentTarget;
    lastPointerX.value = event.clientX;
    lastPointerY.value = event.clientY;
  }

  function handleMouseMove(clientX, clientY) {
    if (!mouseActive.value || !dragSurfaceElement.value) return;

    const diffX = clientX - lastPointerX.value;
    const diffY = clientY - lastPointerY.value;

    if (!mousePanActive.value) {
      if (
        Math.abs(diffX) < MOUSE_DRAG_THRESHOLD &&
        Math.abs(diffY) < MOUSE_DRAG_THRESHOLD
      ) {
        return;
      }

      mousePanActive.value = true;
    }

    panByPixels(-diffX, dragSurfaceElement.value);
    lastPointerX.value = clientX;
    lastPointerY.value = clientY;
  }

  function onTouchStart(event) {
    if (event.touches.length !== 1) return;

    touchActive.value = true;
    touchPanActive.value = false;
    lastPointerX.value = event.touches[0].clientX;
    lastPointerY.value = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!touchActive.value || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const diffX = touch.clientX - lastPointerX.value;
    const diffY = touch.clientY - lastPointerY.value;

    if (!touchPanActive.value) {
      if (
        Math.abs(diffX) < TOUCH_DRAG_THRESHOLD &&
        Math.abs(diffY) < TOUCH_DRAG_THRESHOLD
      ) {
        return;
      }

      touchPanActive.value = Math.abs(diffX) > Math.abs(diffY);
    }

    if (!touchPanActive.value) return;

    event.preventDefault();
    panByPixels(-diffX, event.currentTarget);
    lastPointerX.value = touch.clientX;
    lastPointerY.value = touch.clientY;
  }

  function onTouchEnd() {
    if (touchPanActive.value) {
      consumeNextClick();
    }

    resetTouch();
  }

  function onClickCapture(event) {
    if (!suppressNextClick.value) return;

    event.preventDefault();
    event.stopPropagation();
    suppressNextClick.value = false;
    clearClickSuppressionTimer();
  }

  function handleWindowMouseMove(event) {
    if (!mouseActive.value) return;

    event.preventDefault();
    handleMouseMove(event.clientX, event.clientY);
  }

  function handleWindowMouseUp() {
    if (mousePanActive.value) {
      consumeNextClick();
    }

    resetMouse();
  }

  function handleWindowClick(event) {
    onClickCapture(event);
  }

  onMounted(() => {
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("click", handleWindowClick, true);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    window.removeEventListener("click", handleWindowClick, true);
    clearClickSuppressionTimer();
  });

  return {
    isDragging,
    onClickCapture,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
