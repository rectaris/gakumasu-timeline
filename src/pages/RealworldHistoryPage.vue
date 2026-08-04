<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ApplicationHeader from "../components/ApplicationHeader.vue";
import { shouldIgnoreShortcutEvent } from "../composables/useKeyboard";
import { realworldHistory } from "../data/realworldHistory";
import {
  createRealworldSelectionUrl,
  parseRealworldSelection,
} from "../utils/timelineModeUrl";
import {
  createYearTicks,
  filterInfoEvents,
  formatTemporal,
  INFO_CATEGORY_META,
  INFO_STATUS_LABELS,
  layoutInfoEvents,
} from "../utils/realworldHistory";

const viewportRef = ref(null);
const YEAR_HEADER_HEIGHT = 32;
const query = ref("");
const category = ref("all");
const status = ref("all");
const zoom = ref(1);
const viewportWidth = ref(1000);
const selectedId = ref(null);
const categories = Object.entries(INFO_CATEGORY_META);

const filteredEvents = computed(() =>
  filterInfoEvents(realworldHistory.events, {
    query: query.value,
    category: category.value,
    status: status.value,
  }),
);
const defaultRange = (() => {
  const now = new Date();
  const start = Date.UTC(
    now.getUTCFullYear() - 1,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return { start, end: Date.now() + 90 * 86_400_000 };
})();
const dataBounds = computed(() => {
  if (!filteredEvents.value.length) return defaultRange;
  const eventLayout = layoutInfoEvents(filteredEvents.value, { width: 1 });
  return {
    start: Math.min(eventLayout.start, defaultRange.start),
    end: Math.max(eventLayout.end, defaultRange.end),
  };
});
const defaultSpan = defaultRange.end - defaultRange.start;
const stageWidth = computed(() => {
  const totalSpan = dataBounds.value.end - dataBounds.value.start;
  return Math.round(
    Math.max(viewportWidth.value, (totalSpan / defaultSpan) * viewportWidth.value) *
      zoom.value,
  );
});
const layout = computed(() =>
  layoutInfoEvents(filteredEvents.value, {
    width: stageWidth.value,
    bounds: defaultRange,
  }),
);
const yearTicks = computed(() =>
  createYearTicks(layout.value.start, layout.value.end, layout.value.width),
);
const selectedEvent = computed(
  () => realworldHistory.eventById.get(selectedId.value) ?? null,
);
const hasFilters = computed(
  () => query.value || category.value !== "all" || status.value !== "all",
);

function itemStyle(item) {
  return {
    left: `${item.x}px`,
    top: `${item.y + YEAR_HEADER_HEIGHT}px`,
    width: `${Math.max(item.width, 150)}px`,
    "--item-color": INFO_CATEGORY_META[item.event.category].color,
  };
}

function syncSelectionFromUrl() {
  const itemId = parseRealworldSelection(window.location.search);
  selectedId.value = realworldHistory.eventById.has(itemId) ? itemId : null;
}

function updateSelection(itemId) {
  selectedId.value = itemId;
  const url = createRealworldSelectionUrl(window.location, itemId);
  window.history.pushState(null, "", url);
}

function clearFilters() {
  query.value = "";
  category.value = "all";
  status.value = "all";
}

function setZoom(value) {
  zoom.value = Math.min(2, Math.max(0.3, value));
}

function showAll() {
  const totalSpan = dataBounds.value.end - dataBounds.value.start;
  setZoom(Math.min(1, defaultSpan / totalSpan));
  nextTick(() => {
    if (viewportRef.value) viewportRef.value.scrollLeft = 0;
  });
}

function goToNow() {
  const viewport = viewportRef.value;
  if (!viewport || !filteredEvents.value.length) return;
  const now = Date.now();
  const ratio = (now - layout.value.start) / (layout.value.end - layout.value.start);
  viewport.scrollLeft = Math.max(
    0,
    ratio * layout.value.width - viewport.clientWidth / 2,
  );
}

function measureViewport() {
  if (viewportRef.value) viewportWidth.value = viewportRef.value.clientWidth;
}

function focusDefaultRange() {
  const viewport = viewportRef.value;
  if (!viewport || !filteredEvents.value.length) return;
  const ratio =
    (defaultRange.start - layout.value.start) /
    (layout.value.end - layout.value.start);
  viewport.scrollLeft = Math.max(0, ratio * layout.value.width);
}

function handleKeydown(event) {
  const isEscape = event.key === "Escape";
  if (shouldIgnoreShortcutEvent(event, { allowFromForm: isEscape })) return;

  if (isEscape && selectedId.value) {
    event.preventDefault();
    updateSelection(null);
  } else if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    setZoom(zoom.value + 0.15);
  } else if (event.key === "-") {
    event.preventDefault();
    setZoom(zoom.value - 0.15);
  } else if (event.key === "0") {
    event.preventDefault();
    showAll();
  }
}

watch(filteredEvents, () => {
  if (
    selectedId.value &&
    !filteredEvents.value.some((event) => event.id === selectedId.value)
  ) {
    updateSelection(null);
  }
});

onMounted(() => {
  syncSelectionFromUrl();
  window.addEventListener("popstate", syncSelectionFromUrl);
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", measureViewport);
  nextTick(() => {
    measureViewport();
    nextTick(focusDefaultRange);
  });
});
onUnmounted(() => {
  window.removeEventListener("popstate", syncSelectionFromUrl);
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", measureViewport);
});
</script>

<template>
  <main class="realworld-page" aria-labelledby="realworld-page-title">
    <ApplicationHeader
      title="学マス情報史"
      title-id="realworld-page-title"
    />

    <section class="realworld-toolbar" aria-label="学マス情報史の検索と表示条件">
      <label>
        <span>検索</span>
        <input v-model="query" type="search" placeholder="タイトル・概要・タグ" />
      </label>
      <label>
        <span>カテゴリ</span>
        <select v-model="category">
          <option value="all">すべて</option>
          <option v-for="[id, meta] in categories" :key="id" :value="id">
            {{ meta.label }}
          </option>
        </select>
      </label>
      <label>
        <span>状態</span>
        <select v-model="status">
          <option value="all">すべて</option>
          <option v-for="(label, id) in INFO_STATUS_LABELS" :key="id" :value="id">
            {{ label }}
          </option>
        </select>
      </label>
      <button v-if="hasFilters" type="button" @click="clearFilters">条件を解除</button>
      <div class="realworld-zoom" aria-label="時間軸の拡大縮小">
        <button type="button" aria-label="縮小" @click="setZoom(zoom - 0.15)">−</button>
        <output>{{ Math.round(zoom * 100) }}%</output>
        <button type="button" aria-label="拡大" @click="setZoom(zoom + 0.15)">＋</button>
        <button type="button" @click="goToNow">現在へ</button>
        <button type="button" @click="showAll">全期間</button>
      </div>
    </section>

    <p class="realworld-summary" aria-live="polite">
      {{ filteredEvents.length }}件
      <span v-if="realworldHistory.dataset.status !== 'published'">・開発表示には未レビューの合成データを含みます</span>
    </p>

    <section v-if="filteredEvents.length" class="realworld-timeline-shell">
      <div class="realworld-lane-labels" aria-hidden="true">
        <div v-for="[id, meta] in categories" :key="id">
          <span :style="{ background: meta.color }"></span>{{ meta.label }}
        </div>
      </div>
      <div ref="viewportRef" class="realworld-viewport" tabindex="0" aria-label="現実世界の時間軸">
        <div
          class="realworld-stage"
          :style="{
            width: `${layout.width}px`,
            height: `${layout.height + YEAR_HEADER_HEIGHT}px`,
          }"
        >
          <div
            v-for="tick in yearTicks"
            :key="tick.year"
            class="realworld-year"
            :style="{ left: `${tick.x}px` }"
          >
            <span>{{ tick.year }}</span>
          </div>
          <div
            v-for="(_, index) in categories"
            :key="index"
            class="realworld-lane-line"
            :style="{ top: `${YEAR_HEADER_HEIGHT + index * 116}px` }"
          ></div>
          <button
            v-for="item in layout.items"
            :key="item.event.id"
            class="realworld-item"
            :class="[
              `is-${item.event.status}`,
              { 'is-selected': selectedId === item.event.id },
            ]"
            :style="itemStyle(item)"
            type="button"
            @click="updateSelection(item.event.id)"
          >
            <span class="realworld-item-status">{{ INFO_STATUS_LABELS[item.event.status] }}</span>
            <strong>{{ item.event.title }}</strong>
            <small>{{ formatTemporal(item.event.startsAt) }}</small>
          </button>
        </div>
      </div>
    </section>

    <section v-else class="realworld-empty">
      <h2>{{ realworldHistory.events.length ? "条件に一致する情報がありません" : "公開済みの学マス情報史はまだありません" }}</h2>
      <button v-if="hasFilters" type="button" @click="clearFilters">すべて表示</button>
    </section>

    <aside v-if="selectedEvent" class="realworld-detail" aria-labelledby="realworld-detail-title">
      <button type="button" class="detail-close" aria-label="詳細を閉じる" @click="updateSelection(null)">×</button>
      <p>{{ INFO_CATEGORY_META[selectedEvent.category].label }}・{{ INFO_STATUS_LABELS[selectedEvent.status] }}</p>
      <h2 id="realworld-detail-title">{{ selectedEvent.title }}</h2>
      <p>{{ selectedEvent.summary }}</p>
      <dl>
        <div><dt>開始</dt><dd>{{ formatTemporal(selectedEvent.startsAt) }}</dd></div>
        <div v-if="selectedEvent.endsAt"><dt>終了</dt><dd>{{ formatTemporal(selectedEvent.endsAt) }}</dd></div>
        <div v-if="selectedEvent.announcedAt"><dt>発表</dt><dd>{{ formatTemporal(selectedEvent.announcedAt) }}</dd></div>
        <div><dt>精度</dt><dd>{{ selectedEvent.startsAt.precision }}</dd></div>
      </dl>
      <h3>公式出典</h3>
      <ul v-if="selectedEvent.sources.length">
        <li v-for="source in selectedEvent.sources" :key="source.id">
          <a :href="source.url" target="_blank" rel="noreferrer">{{ source.label }}</a>
          <small>確認日 {{ source.checkedAt }}</small>
        </li>
      </ul>
      <p v-else class="detail-unreviewed">検証用データのため、公開出典はありません。</p>
    </aside>
  </main>
</template>

<style scoped>
.realworld-page { min-height: calc(100vh - var(--app-header-height)); background: radial-gradient(circle at 18% 0, rgba(48, 136, 120, .14), transparent 32rem), var(--app-bg); color: var(--text-primary); }
.realworld-toolbar { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; padding: 12px 16px 8px; background: var(--surface-elevated); }
.realworld-toolbar label { display: grid; gap: 3px; color: var(--text-muted); font-size: 10px; font-weight: 700; }
.realworld-toolbar input, .realworld-toolbar select, .realworld-toolbar button, .realworld-zoom button, .realworld-empty button { min-height: var(--app-control-height); box-sizing: border-box; border: 1px solid var(--border-strong); border-radius: var(--app-control-radius); background: var(--button-bg); color: var(--button-text); padding: 0 10px; font: inherit; font-size: 12px; }
.realworld-toolbar input { width: min(280px, 64vw); }
.realworld-zoom { margin-left: auto; display: flex; align-items: center; gap: 5px; }
.realworld-zoom output { min-width: 48px; text-align: center; color: var(--text-muted); font-size: 12px; }
.realworld-summary { margin: 0; padding: 4px 16px 10px; border-bottom: 1px solid var(--border); background: var(--surface-elevated); color: var(--text-muted); font-size: 12px; }
.realworld-timeline-shell { display: grid; grid-template-columns: 112px minmax(0, 1fr); margin: 0 20px 24px; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 10px 34px var(--shadow); }
.realworld-lane-labels { padding-top: 32px; background: var(--surface); border-right: 1px solid var(--border); z-index: 2; }
.realworld-lane-labels div { height: 116px; display: flex; align-items: center; gap: 8px; padding: 0 12px; box-sizing: border-box; border-bottom: 1px solid var(--border-soft); font-size: 12px; font-weight: 800; }
.realworld-lane-labels span { width: 9px; height: 9px; border-radius: 99px; }
.realworld-viewport { overflow: auto; background: var(--timeline-viewport-fill); touch-action: pan-x pan-y; }
.realworld-stage { position: relative; min-width: 100%; }
.realworld-year { position: absolute; top: 0; bottom: 0; border-left: 1px solid var(--timeline-month-line); }
.realworld-year span { position: absolute; top: 7px; left: 7px; color: var(--text-muted); font-size: 11px; font-weight: 800; }
.realworld-lane-line { position: absolute; right: 0; left: 0; height: 116px; border-bottom: 1px solid var(--border-soft); }
.realworld-item { position: absolute; min-height: 70px; padding: 8px 10px; overflow: hidden; display: grid; gap: 3px; text-align: left; border: 1px solid color-mix(in srgb, var(--item-color) 68%, var(--border)); border-left: 5px solid var(--item-color); border-radius: 9px; background: var(--surface-elevated); color: var(--text-primary); box-shadow: 0 4px 12px var(--shadow); cursor: pointer; }
.realworld-item:hover, .realworld-item.is-selected { transform: translateY(-2px); box-shadow: 0 8px 20px var(--shadow); }
.realworld-item.is-selected { outline: 3px solid var(--timeline-focus-stroke); }
.realworld-item.is-scheduled { border-style: dashed; }
.realworld-item.is-postponed, .realworld-item.is-cancelled { opacity: .76; }
.realworld-item-status { width: fit-content; border-radius: 999px; padding: 1px 6px; background: color-mix(in srgb, var(--item-color) 18%, transparent); font-size: 10px; font-weight: 800; }
.realworld-item strong { font-size: 13px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.realworld-item small { color: var(--text-muted); white-space: nowrap; }
.realworld-empty { margin: 40px 20px; padding: 48px 24px; text-align: center; border: 1px dashed var(--border); border-radius: 14px; background: var(--surface-soft); }
.realworld-detail { position: fixed; z-index: 1250; top: 136px; right: 16px; width: min(360px, calc(100vw - 32px)); max-height: calc(100vh - 164px); overflow: auto; box-sizing: border-box; padding: 20px; border: 1px solid var(--border); border-top: 5px solid #318878; border-radius: 14px; background: var(--surface-elevated); box-shadow: 0 18px 48px var(--shadow); }
.realworld-detail > p:first-of-type { margin: 0; color: #318878; font-size: 12px; font-weight: 800; }
.realworld-detail h2 { margin: 6px 32px 10px 0; font-size: 21px; }
.realworld-detail h3 { font-size: 14px; }
.realworld-detail dl { display: grid; gap: 7px; }
.realworld-detail dl div { display: grid; grid-template-columns: 56px 1fr; gap: 8px; }
.realworld-detail dt { color: var(--text-muted); font-weight: 700; }
.realworld-detail dd { margin: 0; }
.realworld-detail ul { padding-left: 20px; }
.realworld-detail li { margin-bottom: 8px; }
.realworld-detail li small { display: block; color: var(--text-muted); }
.detail-close { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 99px; background: var(--button-bg); color: var(--button-text); }
.detail-unreviewed { color: var(--text-muted); font-size: 13px; }
@media (max-width: 720px) {
  .realworld-toolbar { padding-inline: 12px; }
  .realworld-zoom { width: 100%; margin-left: 0; overflow-x: auto; }
  .realworld-summary { padding-inline: 12px; }
  .realworld-timeline-shell { grid-template-columns: 82px minmax(0, 1fr); margin-inline: 12px; }
  .realworld-lane-labels div { padding-inline: 7px; font-size: 10px; }
  .realworld-detail { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-height: 68vh; border-radius: 16px 16px 0 0; }
}
</style>
