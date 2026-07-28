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
import TimelineModeSwitcher from "./components/TimelineModeSwitcher.vue";
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
  <section
    v-else
    class="realworld-placeholder"
    role="main"
    aria-labelledby="realworld-page-title"
  >
    <header class="placeholder-header">
      <h1
        id="realworld-page-title"
        data-timeline-page-heading
        tabindex="-1"
      >学マス情報史</h1>
      <TimelineModeSwitcher />
    </header>
    <div class="placeholder-content">
      <p class="placeholder-kicker">現実世界史</p>
      <h2>このビューは開発準備中です</h2>
      <p>
        3ビューの選択境界だけを先に用意しています。
        学マス情報史のデータと表示は専用プランで実装します。
      </p>
    </div>
  </section>
</template>

<style scoped>
.realworld-placeholder {
  min-height: calc(100vh - 56px);
  background:
    radial-gradient(circle at 20% 15%, rgba(82, 154, 151, 0.15), transparent 32rem),
    var(--app-bg);
}

.placeholder-header {
  position: fixed;
  z-index: 1200;
  top: 0;
  right: 0;
  left: 0;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--header-bg);
  box-shadow: 0 4px 16px var(--shadow);
  backdrop-filter: blur(14px);
}

.placeholder-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
}

.placeholder-content {
  max-width: 680px;
  margin: 0 auto;
  padding: min(18vh, 160px) 24px 48px;
}

.placeholder-content h2 {
  margin: 8px 0 12px;
  color: var(--text-primary);
  font-size: clamp(28px, 5vw, 46px);
}

.placeholder-content p {
  color: var(--text-secondary);
  line-height: 1.8;
}

.placeholder-kicker {
  margin: 0;
  color: #2c7775;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
</style>
