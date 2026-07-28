import { onMounted, ref, watch } from "vue";

const THEME_MODE_STORAGE_KEY = "gakumasu:theme-mode";
const SHOW_ZOOM_HINTS_STORAGE_KEY = "gakumasu:show-zoom-hints";
const SHOW_COMMON_EVENTS_STORAGE_KEY = "gakumasu:show-common-events";
const INTRO_GUIDE_DISMISSED_KEY = "gakumasu:intro-guide-dismissed";

function readBooleanSetting(storageKey, fallbackValue) {
  const rawValue = window.localStorage.getItem(storageKey);
  if (rawValue === null) return fallbackValue;
  return rawValue === "true";
}

function applyThemeMode(mode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", mode);
}

export function usePersistedThemeMode() {
  const themeMode = ref("system");
  const settingsReady = ref(false);

  onMounted(() => {
    const storedThemeMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (
      storedThemeMode === "system" ||
      storedThemeMode === "light" ||
      storedThemeMode === "dark"
    ) {
      themeMode.value = storedThemeMode;
    }
    applyThemeMode(themeMode.value);
    settingsReady.value = true;
  });

  watch(themeMode, (mode) => {
    applyThemeMode(mode);
    if (!settingsReady.value) return;
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  });

  return { themeMode };
}

export function usePersistedTimelineSettings({ initialShowCommonEvents } = {}) {
  const showZoomHints = ref(true);
  const showCommonEvents = ref(initialShowCommonEvents ?? true);
  const showIntroGuide = ref(true);
  const settingsReady = ref(false);

  function dismissIntroGuide() {
    showIntroGuide.value = false;
    window.localStorage.setItem(INTRO_GUIDE_DISMISSED_KEY, "true");
  }

  onMounted(() => {
    showZoomHints.value = readBooleanSetting(
      SHOW_ZOOM_HINTS_STORAGE_KEY,
      true,
    );
    if (initialShowCommonEvents === undefined) {
      showCommonEvents.value = readBooleanSetting(
        SHOW_COMMON_EVENTS_STORAGE_KEY,
        true,
      );
    }
    showIntroGuide.value = !readBooleanSetting(
      INTRO_GUIDE_DISMISSED_KEY,
      false,
    );
    settingsReady.value = true;
  });

  watch(showZoomHints, (value) => {
    if (!settingsReady.value) return;
    window.localStorage.setItem(SHOW_ZOOM_HINTS_STORAGE_KEY, String(value));
  });

  watch(showCommonEvents, (value) => {
    if (!settingsReady.value) return;
    window.localStorage.setItem(SHOW_COMMON_EVENTS_STORAGE_KEY, String(value));
  });

  return {
    showZoomHints,
    showCommonEvents,
    showIntroGuide,
    dismissIntroGuide,
  };
}
