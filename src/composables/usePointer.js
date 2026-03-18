import { ref } from "vue";

export function usePointer({ panByPixels }) {
  const touchActive = ref(false);
  const touchPanActive = ref(false);
  const lastTouchX = ref(0);
  const lastTouchY = ref(0);

  function resetTouch() {
    touchActive.value = false;
    touchPanActive.value = false;
  }

  function onTouchStart(event) {
    if (event.touches.length !== 1) return;

    touchActive.value = true;
    touchPanActive.value = false;
    lastTouchX.value = event.touches[0].clientX;
    lastTouchY.value = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!touchActive.value || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const diffX = touch.clientX - lastTouchX.value;
    const diffY = touch.clientY - lastTouchY.value;

    if (!touchPanActive.value) {
      if (Math.abs(diffX) < 8 && Math.abs(diffY) < 8) return;
      touchPanActive.value = Math.abs(diffX) > Math.abs(diffY);
    }

    if (!touchPanActive.value) return;

    event.preventDefault();
    panByPixels(-diffX, event.currentTarget);
    lastTouchX.value = touch.clientX;
    lastTouchY.value = touch.clientY;
  }

  function onTouchEnd() {
    resetTouch();
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}
