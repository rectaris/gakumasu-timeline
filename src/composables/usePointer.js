import { computed, onMounted, onUnmounted, ref } from "vue";

const MOUSE_DRAG_THRESHOLD = 4;
const TOUCH_DRAG_THRESHOLD = 8;
const TOUCH_PINCH_THRESHOLD = 4;
const CLICK_SUPPRESSION_MS = 80;

function pinchDistance(touchA, touchB) {
  const diffX = touchA.clientX - touchB.clientX;
  const diffY = touchA.clientY - touchB.clientY;
  return Math.hypot(diffX, diffY);
}

function pinchMidpoint(touchA, touchB) {
  return {
    clientX: (touchA.clientX + touchB.clientX) / 2,
    clientY: (touchA.clientY + touchB.clientY) / 2,
  };
}

export function usePointer({
  panByPixels,
  panVerticallyByPixels,
  zoomByPinch,
}) {
  const mouseActive = ref(false);
  const mousePanActive = ref(false);
  const touchActive = ref(false);
  const touchPanActive = ref(false);
  const touchPinchActive = ref(false);
  const suppressNextClick = ref(false);
  const dragSurfaceElement = ref(null);
  const lastPointerX = ref(0);
  const lastPointerY = ref(0);
  const lastPinchDistance = ref(0);
  let clearSuppressionTimer = null;

  const isDragging = computed(
    () =>
      mousePanActive.value || touchPanActive.value || touchPinchActive.value,
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
    touchPinchActive.value = false;
    dragSurfaceElement.value = null;
    lastPinchDistance.value = 0;
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
    panVerticallyByPixels(diffY);
    lastPointerX.value = clientX;
    lastPointerY.value = clientY;
  }

  function onTouchStart(event) {
    dragSurfaceElement.value = event.currentTarget;

    if (event.touches.length === 2) {
      event.preventDefault();
      touchActive.value = false;
      touchPanActive.value = false;
      touchPinchActive.value = true;
      lastPinchDistance.value = pinchDistance(
        event.touches[0],
        event.touches[1],
      );
      const midpoint = pinchMidpoint(event.touches[0], event.touches[1]);
      lastPointerX.value = midpoint.clientX;
      lastPointerY.value = midpoint.clientY;
      return;
    }

    if (event.touches.length !== 1) return;

    touchActive.value = true;
    touchPanActive.value = false;
    touchPinchActive.value = false;
    lastPointerX.value = event.touches[0].clientX;
    lastPointerY.value = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (event.touches.length === 2) {
      const currentDistance = pinchDistance(event.touches[0], event.touches[1]);
      const midpoint = pinchMidpoint(event.touches[0], event.touches[1]);

      if (!touchPinchActive.value) {
        touchActive.value = false;
        touchPanActive.value = false;
        touchPinchActive.value = true;
        lastPinchDistance.value = currentDistance;
        lastPointerX.value = midpoint.clientX;
        lastPointerY.value = midpoint.clientY;
        event.preventDefault();
        return;
      }

      if (
        Math.abs(currentDistance - lastPinchDistance.value) <
        TOUCH_PINCH_THRESHOLD
      ) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      zoomByPinch(
        lastPinchDistance.value / currentDistance,
        midpoint.clientX,
        dragSurfaceElement.value ?? event.currentTarget,
      );
      lastPinchDistance.value = currentDistance;
      lastPointerX.value = midpoint.clientX;
      lastPointerY.value = midpoint.clientY;
      return;
    }

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

      touchPanActive.value = true;
    }

    if (!touchPanActive.value) return;

    event.preventDefault();
    panByPixels(-diffX, event.currentTarget);
    panVerticallyByPixels(diffY);
    lastPointerX.value = touch.clientX;
    lastPointerY.value = touch.clientY;
  }

  function onTouchEnd() {
    if (touchPanActive.value || touchPinchActive.value) {
      consumeNextClick();
    }

    resetTouch();
  }

  function suppressClick(event) {
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
    suppressClick(event);
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
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
