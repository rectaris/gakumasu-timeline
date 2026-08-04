<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
} from "vue";
import { APPLICATION_APPEARANCE_CONTEXT } from "./composables/useApplicationAppearance";
import { usePersistedThemeMode } from "./composables/usePersistedSettings";
import { TIMELINE_MODE_CONTEXT } from "./composables/useTimelineMode";
import {
  parseTimelineMode,
} from "./utils/timelineModeUrl";
import { createTimelineModeMemory } from "./utils/timelineModeMemory";

const NarrativeTimeline = defineAsyncComponent(
  () => import("./pages/NarrativeTimelinePage.vue"),
);
const StoryGraphPage = defineAsyncComponent(
  () => import("./pages/StoryGraphPage.vue"),
);
const RealworldHistoryPage = defineAsyncComponent(
  () => import("./pages/RealworldHistoryPage.vue"),
);
const locationSearch = ref(window.location.search);
const modeMemory = createTimelineModeMemory();
const appearance = usePersistedThemeMode();
const isWorldlineEditorMode =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("editor") === "worldline";
const mode = computed(() =>
  isWorldlineEditorMode ? "narrative" : parseTimelineMode(locationSearch.value),
);

function syncLocation() {
  locationSearch.value = window.location.search;
}

async function focusActivePageHeading() {
  await nextTick();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const heading = document.querySelector("[data-timeline-page-heading]");
    if (heading) {
      heading.focus();
      return;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

function navigateToMode(nextMode, { focusPage = false } = {}) {
  if (nextMode === mode.value) return;
  modeMemory.remember(mode.value, window.location);
  const url = modeMemory.resolve(nextMode, window.location);
  window.history.pushState(null, "", url);
  syncLocation();
  if (focusPage) void focusActivePageHeading();
}

provide(TIMELINE_MODE_CONTEXT, {
  mode,
  navigateToMode,
});
provide(APPLICATION_APPEARANCE_CONTEXT, appearance);

onMounted(() => window.addEventListener("popstate", syncLocation));
onUnmounted(() => window.removeEventListener("popstate", syncLocation));
</script>

<template>
  <NarrativeTimeline v-if="mode === 'narrative'" />
  <StoryGraphPage v-else-if="mode === 'story-graph'" />
  <RealworldHistoryPage v-else />
</template>
