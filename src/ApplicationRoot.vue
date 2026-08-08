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
import TimelineContribution from "./components/TimelineContribution.vue";
import TimelineReviewQueue from "./components/TimelineReviewQueue.vue";
import {
  isTimelineAuthoringOrigin,
  requestTimelineAuthoringRoles,
} from "./auth/timelineAuthoring";
import { TOOL_SESSION_CONTEXT } from "./auth/toolSession";
import {
  commonTimeline,
  eventCommus,
  hatsuboshiCommus,
  idolCommu,
  supportCardCommus,
} from "./data";

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
const authoringState = ref("idle");
const authoringRoles = ref([]);
const isWorldlineEditorMode =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("editor") === "worldline";
const mode = computed(() =>
  isWorldlineEditorMode ? "narrative" : parseTimelineMode(locationSearch.value),
);
const authoringLanes = [
  { ...commonTimeline, category: "commonTimeline" },
  ...idolCommu.map((lane) => ({ ...lane, category: "idolCommu" })),
  ...hatsuboshiCommus.map((lane) => ({ ...lane, category: "hatsuboshiCommus" })),
  ...eventCommus.map((lane) => ({ ...lane, category: "eventCommus" })),
  ...supportCardCommus.map((lane) => ({ ...lane, category: "supportCardCommus" })),
].map(({ id, name, category }) => ({ id, name, category }));
const canContribute = computed(() =>
  authoringRoles.value.some((role) => ["contributor", "admin"].includes(role)),
);
const canReview = computed(() =>
  authoringRoles.value.some((role) => ["reviewer", "admin"].includes(role)),
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

async function checkTimelineAuthoring() {
  if (
    isWorldlineEditorMode ||
    !isTimelineAuthoringOrigin(window.location)
  ) return;
  authoringState.value = "loading";
  const result = await requestTimelineAuthoringRoles();
  authoringState.value = result.status;
  authoringRoles.value = result.roles;
}

function handleToolLogoutSucceeded() {
  authoringState.value = "anonymous";
  authoringRoles.value = [];
}

provide(TIMELINE_MODE_CONTEXT, {
  mode,
  navigateToMode,
});
provide(APPLICATION_APPEARANCE_CONTEXT, appearance);
provide(TOOL_SESSION_CONTEXT, {
  logoutSucceeded: handleToolLogoutSucceeded,
});

onMounted(() => {
  window.addEventListener("popstate", syncLocation);
  void checkTimelineAuthoring();
});
onUnmounted(() => window.removeEventListener("popstate", syncLocation));
</script>

<template>
  <NarrativeTimeline v-if="mode === 'narrative'" />
  <StoryGraphPage v-else-if="mode === 'story-graph'" />
  <RealworldHistoryPage v-else />
  <TimelineContribution v-if="canContribute" :lanes="authoringLanes" />
  <TimelineReviewQueue v-if="canReview" />
  <p
    v-if="authoringState === 'unavailable'"
    class="timeline-authoring-unavailable"
    data-authoring-state="unavailable"
    role="status"
  >投稿機能を確認できません</p>
</template>

<style scoped>
.timeline-authoring-unavailable {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 1270;
  margin: 0;
  padding: 8px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-elevated);
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
