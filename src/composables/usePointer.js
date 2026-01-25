import { onUnmounted, ref } from "vue";

export function usePointer({ zoomMode, moveYear, moveMonth, moveDay }) {
  const holdIntervalId = ref(null);
  const holdTimeoutId = ref(null);
  const suppressClick = ref(false);

  function stopHold() {
    if (holdTimeoutId.value) {
      clearTimeout(holdTimeoutId.value);
      holdTimeoutId.value = null;
    }
    if (holdIntervalId.value) {
      clearInterval(holdIntervalId.value);
      holdIntervalId.value = null;
    }
  }

  function startHold(action) {
    suppressClick.value = true;
    stopHold();
    action();
    holdTimeoutId.value = setTimeout(() => {
      holdIntervalId.value = setInterval(action, 100);
    }, 300);
  }

  function handleNavClick(action) {
    if (suppressClick.value) {
      suppressClick.value = false;
      return;
    }
    action();
  }

  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const touchActive = ref(false);

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchActive.value = true;
    touchStartX.value = e.touches[0].clientX;
    touchStartY.value = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (!touchActive.value || e.touches.length !== 1) return;
  }

  function onTouchEnd(e) {
    if (!touchActive.value) return;
    touchActive.value = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - touchStartX.value;
    const diffY = endY - touchStartY.value;

    if (Math.abs(diffX) < 40 || Math.abs(diffX) <= Math.abs(diffY)) return;

    const delta = diffX < 0 ? 1 : -1;

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

  onUnmounted(() => {
    stopHold();
  });

  return {
    startHold,
    stopHold,
    handleNavClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}
