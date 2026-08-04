<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import ApplicationHeader from "../components/ApplicationHeader.vue";
import { storyGraph } from "../data/storyGraph";
import {
  createNarrativeEventUrl,
  createStoryGraphSelectionUrl,
  parseStoryGraphSelection,
} from "../utils/timelineModeUrl";
import {
  filterStoryGraph,
  layoutStoryGraph,
  STORY_CATEGORY_META,
  STORY_CONFIDENCE_LABELS,
  STORY_DIRECTION_LABELS,
  STORY_RELATION_LABELS,
} from "../utils/storyGraph";

const viewportRef = ref(null);
const selected = ref(null);
const query = ref("");
const category = ref("all");
const character = ref("all");
const scale = ref(0.82);
const pan = reactive({ x: 36, y: 36 });
const drag = reactive({
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  panX: 0,
  panY: 0,
});
const nodeElements = new Map();

const characterOptions = computed(() => {
  const characters = new Map();
  storyGraph.blocks.forEach((block) => {
    block.characters.forEach((characterItem) => {
      characters.set(characterItem.id, {
        id: characterItem.id,
        name: characterItem.name,
      });
    });
  });
  return [...characters.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ja"),
  );
});

const filteredGraph = computed(() =>
  filterStoryGraph(storyGraph, {
    query: query.value,
    category: category.value,
    character: character.value,
  }),
);
const layout = computed(() =>
  layoutStoryGraph(filteredGraph.value.blocks, filteredGraph.value.edges),
);
const stageStyle = computed(() => ({
  width: `${layout.value.width}px`,
  height: `${layout.value.height}px`,
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}));
const selectedNode = computed(() =>
  selected.value?.type === "node"
    ? storyGraph.blockById.get(selected.value.id) ?? null
    : null,
);
const selectedEdge = computed(() =>
  selected.value?.type === "edge"
    ? storyGraph.edgeById.get(selected.value.id) ?? null
    : null,
);
const selectedEdgeSource = computed(() =>
  selectedEdge.value
    ? storyGraph.blockById.get(selectedEdge.value.sourceBlockId)
    : null,
);
const selectedEdgeTarget = computed(() =>
  selectedEdge.value
    ? storyGraph.blockById.get(selectedEdge.value.targetBlockId)
    : null,
);
const selectedNodeReferences = computed(() =>
  selectedNode.value
    ? storyGraph.referencesByBlockId.get(selectedNode.value.id) ?? []
    : [],
);
const resultSummary = computed(
  () =>
    `${filteredGraph.value.blocks.length}件の話、${filteredGraph.value.edges.length}件の関係`,
);
const hasFilters = computed(
  () => query.value || category.value !== "all" || character.value !== "all",
);
const isPublishedEmpty = computed(
  () =>
    storyGraph.dataset.status === "published" &&
    storyGraph.blocks.length === 0,
);

function categoryLabel(categoryId) {
  return STORY_CATEGORY_META[categoryId]?.label ?? categoryId;
}

function relationLabel(edge) {
  return edge.label || STORY_RELATION_LABELS[edge.relationType] || edge.relationType;
}

function narrativeReferenceUrl(reference) {
  return createNarrativeEventUrl(window.location, reference.eventId);
}

function markerStart(edge) {
  return edge.direction === "bidirectional" ? "url(#story-arrow-start)" : null;
}

function markerEnd(edge) {
  return edge.direction === "forward" || edge.direction === "bidirectional"
    ? "url(#story-arrow-end)"
    : null;
}

function syncSelectionFromUrl() {
  const parsed = parseStoryGraphSelection(window.location.search);
  if (parsed?.type === "node" && storyGraph.blockById.has(parsed.id)) {
    selected.value = parsed;
    return;
  }
  if (parsed?.type === "edge" && storyGraph.edgeById.has(parsed.id)) {
    selected.value = parsed;
    return;
  }
  selected.value = null;
}

function updateSelection(nextSelection, { replace = false } = {}) {
  selected.value = nextSelection;
  const url = createStoryGraphSelectionUrl(window.location, nextSelection);
  window.history[replace ? "replaceState" : "pushState"](null, "", url);
}

function selectNode(block) {
  updateSelection({ type: "node", id: block.id });
}

function selectEdge(edge) {
  updateSelection({ type: "edge", id: edge.id });
}

function clearSelection() {
  if (!selected.value) return;
  updateSelection(null);
}

function clearFilters() {
  query.value = "";
  category.value = "all";
  character.value = "all";
}

function clampScale(value) {
  return Math.min(1.65, Math.max(0.48, value));
}

function setScale(nextScale, anchor = null) {
  const viewport = viewportRef.value;
  const oldScale = scale.value;
  const normalized = clampScale(nextScale);
  if (!viewport || normalized === oldScale) return;
  const rect = viewport.getBoundingClientRect();
  const point = anchor ?? {
    x: rect.width / 2,
    y: rect.height / 2,
  };
  const stageX = (point.x - pan.x) / oldScale;
  const stageY = (point.y - pan.y) / oldScale;
  pan.x = point.x - stageX * normalized;
  pan.y = point.y - stageY * normalized;
  scale.value = normalized;
}

function zoomIn() {
  setScale(scale.value + 0.12);
}

function zoomOut() {
  setScale(scale.value - 0.12);
}

function resetView() {
  const viewport = viewportRef.value;
  if (!viewport) return;
  const rect = viewport.getBoundingClientRect();
  const fitScale = clampScale(
    Math.min(
      (rect.width - 64) / layout.value.width,
      (rect.height - 64) / layout.value.height,
      1,
    ),
  );
  scale.value = fitScale;
  pan.x = Math.max(24, (rect.width - layout.value.width * fitScale) / 2);
  pan.y = 28;
}

function handleWheel(event) {
  const rect = viewportRef.value.getBoundingClientRect();
  const factor = event.deltaY < 0 ? 0.1 : -0.1;
  setScale(scale.value + factor, {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  });
}

function handlePointerDown(event) {
  if (
    event.button !== 0 ||
    event.target.closest(
      "button, input, select, a, [role='button'], [data-graph-interactive]",
    )
  ) {
    return;
  }
  drag.active = true;
  drag.pointerId = event.pointerId;
  drag.startX = event.clientX;
  drag.startY = event.clientY;
  drag.panX = pan.x;
  drag.panY = pan.y;
  viewportRef.value.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!drag.active || event.pointerId !== drag.pointerId) return;
  pan.x = drag.panX + event.clientX - drag.startX;
  pan.y = drag.panY + event.clientY - drag.startY;
}

function handlePointerUp(event) {
  if (event.pointerId !== drag.pointerId) return;
  drag.active = false;
  drag.pointerId = null;
  if (viewportRef.value?.hasPointerCapture(event.pointerId)) {
    viewportRef.value.releasePointerCapture(event.pointerId);
  }
}

function registerNodeElement(blockId, element) {
  if (element) nodeElements.set(blockId, element);
  else nodeElements.delete(blockId);
}

function focusBlock(blockId) {
  const block = storyGraph.blockById.get(blockId);
  if (!block || !nodeElements.has(blockId)) return;
  selectNode(block);
  nextTick(() => nodeElements.get(blockId)?.focus());
}

function handleNodeKeydown(event, block) {
  const sequenceEdges = filteredGraph.value.edges.filter(
    (edge) => edge.kind === "sequence",
  );
  let targetId = null;
  if (event.key === "ArrowUp") {
    targetId = sequenceEdges.find(
      (edge) => edge.targetBlockId === block.id,
    )?.sourceBlockId;
  } else if (event.key === "ArrowDown") {
    targetId = sequenceEdges.find(
      (edge) => edge.sourceBlockId === block.id,
    )?.targetBlockId;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const blocks = filteredGraph.value.blocks;
    const index = blocks.findIndex((item) => item.id === block.id);
    const offset = event.key === "ArrowLeft" ? -1 : 1;
    targetId = blocks[index + offset]?.id;
  }
  if (!targetId) return;
  event.preventDefault();
  focusBlock(targetId);
}

function handleViewportKeydown(event) {
  if (event.target.closest("input, select, button, [role='button']")) return;
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    zoomIn();
  } else if (event.key === "-") {
    event.preventDefault();
    zoomOut();
  } else if (event.key === "0") {
    event.preventDefault();
    resetView();
  } else if (event.key === "Escape") {
    clearSelection();
  }
}

watch(
  () => [filteredGraph.value.blocks.length, filteredGraph.value.edges.length],
  () => nextTick(resetView),
);

onMounted(() => {
  syncSelectionFromUrl();
  window.addEventListener("popstate", syncSelectionFromUrl);
  nextTick(resetView);
});

onUnmounted(() => {
  window.removeEventListener("popstate", syncSelectionFromUrl);
});
</script>

<template>
  <section
    class="story-page"
    role="main"
    aria-labelledby="story-graph-page-title"
  >
    <ApplicationHeader
      title="物語イベント"
      title-id="story-graph-page-title"
    />

    <div class="story-toolbar" aria-label="物語イベントの絞り込み">
      <div class="story-toolbar__intro">
        <span class="dataset-badge">{{ storyGraph.dataset.label }}</span>
        <strong>{{ resultSummary }}</strong>
        <span>線の長さやノード間距離は時間差を表しません。</span>
      </div>
      <div class="story-filters">
        <label>
          <span>検索</span>
          <input v-model="query" type="search" placeholder="話、シリーズ、人物" />
        </label>
        <label>
          <span>カテゴリ</span>
          <select v-model="category">
            <option value="all">すべて</option>
            <option
              v-for="(meta, categoryId) in STORY_CATEGORY_META"
              :key="categoryId"
              :value="categoryId"
            >
              {{ meta.label }}
            </option>
          </select>
        </label>
        <label>
          <span>人物</span>
          <select v-model="character">
            <option value="all">すべて</option>
            <option
              v-for="characterItem in characterOptions"
              :key="characterItem.id"
              :value="characterItem.id"
            >
              {{ characterItem.name }}
            </option>
          </select>
        </label>
        <button v-if="hasFilters" type="button" @click="clearFilters">
          条件を解除
        </button>
      </div>
      <div class="story-legend" aria-label="グラフの凡例">
        <span><i class="legend-line legend-line--sequence"></i>前後関係</span>
        <span><i class="legend-line legend-line--semantic"></i>意味的関係</span>
        <span><i class="legend-node"></i>時期不明</span>
      </div>
    </div>

    <div class="story-workspace">
      <div
        ref="viewportRef"
        class="story-viewport"
        :class="{ 'story-viewport--dragging': drag.active }"
        tabindex="0"
        aria-label="物語イベントグラフ。ドラッグで移動、ホイールで拡大縮小できます。"
        @wheel.prevent="handleWheel"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @keydown="handleViewportKeydown"
      >
        <div v-if="filteredGraph.blocks.length === 0" class="story-empty">
          <strong>
            {{
              isPublishedEmpty
                ? "公開済みの物語イベントはまだありません"
                : "該当する話がありません"
            }}
          </strong>
          <p v-if="isPublishedEmpty">
            出典レビューと公開判断を完了したデータから順次追加します。
          </p>
          <button v-if="hasFilters" type="button" @click="clearFilters">
            条件を解除
          </button>
        </div>

        <div v-else class="story-stage" :style="stageStyle">
          <div
            v-if="layout.isolatedCount"
            class="isolated-region"
            :style="{
              left: `${Math.min(
                ...filteredGraph.blocks
                  .filter((block) => layout.positions.get(block.id)?.isolated)
                  .map((block) => layout.positions.get(block.id).x),
              ) - 28}px`,
            }"
          >
            <strong>前後関係が未確定</strong>
            <span>{{ layout.isolatedCount }}件</span>
          </div>

          <svg
            class="story-edges"
            :width="layout.width"
            :height="layout.height"
            aria-label="話を結ぶ関係"
          >
            <defs>
              <marker
                id="story-arrow-end"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" />
              </marker>
              <marker
                id="story-arrow-start"
                markerWidth="8"
                markerHeight="8"
                refX="1"
                refY="4"
                orient="auto-start-reverse"
                markerUnits="strokeWidth"
              >
                <path d="M 8 0 L 0 4 L 8 8 z" />
              </marker>
            </defs>
            <g
              v-for="edge in layout.edges"
              :key="edge.id"
              class="story-edge"
              :class="[
                `story-edge--${edge.kind}`,
                { 'story-edge--selected': selected?.type === 'edge' && selected.id === edge.id },
              ]"
            >
              <path
                class="story-edge__line"
                :d="edge.path"
                :marker-start="markerStart(edge)"
                :marker-end="markerEnd(edge)"
              />
              <path
                class="story-edge__hit"
                :d="edge.path"
                fill="none"
                tabindex="0"
                role="button"
                data-graph-interactive
                :aria-label="`${relationLabel(edge)}、${STORY_DIRECTION_LABELS[edge.direction]}`"
                @click.stop="selectEdge(edge)"
                @keydown.enter.prevent="selectEdge(edge)"
                @keydown.space.prevent="selectEdge(edge)"
              />
            </g>
          </svg>

          <button
            v-for="block in filteredGraph.blocks"
            :key="block.id"
            :ref="(element) => registerNodeElement(block.id, element)"
            class="story-node"
            :class="[
              `story-node--${block.category}`,
              {
                'story-node--selected': selected?.type === 'node' && selected.id === block.id,
                'story-node--isolated': layout.positions.get(block.id)?.isolated,
              },
            ]"
            type="button"
            data-graph-interactive
            :style="{
              left: `${layout.positions.get(block.id)?.x ?? 0}px`,
              top: `${layout.positions.get(block.id)?.y ?? 0}px`,
              width: `${layout.nodeWidth}px`,
              height: `${layout.nodeHeight}px`,
              '--category-color': STORY_CATEGORY_META[block.category]?.color,
            }"
            :aria-label="`${block.title}。${categoryLabel(block.category)}`"
            @click="selectNode(block)"
            @keydown="handleNodeKeydown($event, block)"
          >
            <span class="story-node__category">{{ categoryLabel(block.category) }}</span>
            <strong>{{ block.title }}</strong>
            <span v-if="block.characters.length" class="story-node__people">
              {{ block.characters.map((item) => item.name).join("、") }}
            </span>
            <span v-else class="story-node__people">人物タグなし</span>
          </button>
        </div>

        <div
          v-if="filteredGraph.blocks.length"
          class="graph-controls"
          aria-label="グラフの拡大縮小"
        >
          <button type="button" aria-label="拡大" @click="zoomIn">＋</button>
          <output aria-label="拡大率">{{ Math.round(scale * 100) }}%</output>
          <button type="button" aria-label="縮小" @click="zoomOut">−</button>
          <button type="button" @click="resetView">全体</button>
        </div>
      </div>

      <aside
        v-if="selectedNode || selectedEdge"
        class="story-detail"
        aria-label="選択した物語イベントの詳細"
      >
        <button
          class="story-detail__close"
          type="button"
          aria-label="詳細を閉じる"
          @click="clearSelection"
        >×</button>

        <template v-if="selectedNode">
          <span class="detail-kicker">STORY BLOCK</span>
          <h2>{{ selectedNode.title }}</h2>
          <dl>
            <div>
              <dt>カテゴリ</dt>
              <dd>{{ categoryLabel(selectedNode.category) }}</dd>
            </div>
            <div>
              <dt>階層</dt>
              <dd>{{ selectedNode.seriesPath.map((series) => series.label).join(" › ") }}</dd>
            </div>
            <div>
              <dt>人物</dt>
              <dd>
                <span v-if="!selectedNode.characters.length">未登録</span>
                <span
                  v-for="characterItem in selectedNode.characters"
                  :key="characterItem.id"
                  class="detail-chip"
                >
                  {{ characterItem.name }}：{{ characterItem.roles.join("/") }}
                </span>
              </dd>
            </div>
            <div>
              <dt>物語上の位置</dt>
              <dd>
                {{
                  layout.positions.get(selectedNode.id)?.isolated
                    ? "前後関係が未確定"
                    : "エッジによる前後関係あり"
                }}
              </dd>
            </div>
          </dl>
          <p v-if="selectedNode.sourceNotes" class="detail-note">
            {{ selectedNode.sourceNotes }}
          </p>
          <section
            v-if="selectedNodeReferences.length"
            class="node-references"
            aria-labelledby="story-node-references-title"
          >
            <h3 id="story-node-references-title">物語時系列からの参照</h3>
            <a
              v-for="reference in selectedNodeReferences"
              :key="reference.referenceId"
              :href="narrativeReferenceUrl(reference)"
            >
              <strong>{{ reference.eventTitle }}</strong>
              <span>{{ reference.laneName }}</span>
            </a>
          </section>
          <code>{{ selectedNode.id }}</code>
        </template>

        <template v-else-if="selectedEdge">
          <span class="detail-kicker">STORY EDGE</span>
          <h2>{{ relationLabel(selectedEdge) }}</h2>
          <div class="edge-endpoints">
            <button type="button" @click="selectNode(selectedEdgeSource)">
              <span>接続元</span>
              {{ selectedEdgeSource.title }}
            </button>
            <span aria-hidden="true">↓</span>
            <button type="button" @click="selectNode(selectedEdgeTarget)">
              <span>接続先</span>
              {{ selectedEdgeTarget.title }}
            </button>
          </div>
          <dl>
            <div>
              <dt>種別</dt>
              <dd>{{ selectedEdge.kind === "sequence" ? "前後関係" : "意味的関係" }}</dd>
            </div>
            <div>
              <dt>方向</dt>
              <dd>{{ STORY_DIRECTION_LABELS[selectedEdge.direction] }}</dd>
            </div>
            <div>
              <dt>関係</dt>
              <dd>{{ STORY_RELATION_LABELS[selectedEdge.relationType] }}</dd>
            </div>
            <div>
              <dt>確度</dt>
              <dd>{{ STORY_CONFIDENCE_LABELS[selectedEdge.confidence] || "自動生成" }}</dd>
            </div>
          </dl>
          <p class="detail-note">{{ selectedEdge.rationale }}</p>
          <code>{{ selectedEdge.id }}</code>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.story-page {
  display: flex;
  min-height: calc(100vh - var(--app-header-height));
  height: calc(100vh - var(--app-header-height));
  flex-direction: column;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 12%, rgba(208, 94, 111, 0.09), transparent 30rem),
    radial-gradient(circle at 84% 84%, rgba(43, 143, 138, 0.08), transparent 34rem),
    var(--app-bg);
}

.story-toolbar {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 10px 22px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-elevated);
}

.story-toolbar__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.story-toolbar__intro strong {
  color: var(--text-primary);
}

.dataset-badge {
  padding: 3px 7px;
  border: 1px solid color-mix(in srgb, #d44c63 45%, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, #d44c63 10%, var(--surface));
  color: color-mix(in srgb, #d44c63 80%, var(--text-primary));
  font-size: 10px;
  font-weight: 800;
}

.story-filters {
  grid-row: 1 / span 2;
  grid-column: 2;
  display: flex;
  align-items: end;
  gap: 8px;
}

.story-filters label {
  display: grid;
  gap: 3px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
}

.story-filters input,
.story-filters select,
.story-filters button {
  box-sizing: border-box;
  min-height: var(--app-control-height);
  border: 1px solid var(--border-strong);
  border-radius: var(--app-control-radius);
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-size: 12px;
}

.story-filters input {
  width: 190px;
  padding: 0 9px;
}

.story-filters select {
  max-width: 150px;
  padding: 0 25px 0 8px;
}

.story-filters button {
  padding: 0 10px;
  cursor: pointer;
}

.story-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 11px;
}

.story-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend-line {
  width: 23px;
  border-top: 2px solid var(--text-secondary);
}

.legend-line--semantic {
  border-top-style: dashed;
  border-top-color: #aa6684;
}

.legend-node {
  width: 13px;
  height: 9px;
  border: 1px dashed var(--text-muted);
  border-radius: 3px;
}

.story-workspace {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.story-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 32px 32px;
}

.story-viewport--dragging {
  cursor: grabbing;
}

.story-stage {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.isolated-region {
  position: absolute;
  top: 28px;
  display: flex;
  gap: 8px;
  align-items: baseline;
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.isolated-region span {
  color: var(--text-muted);
  font-size: 11px;
}

.story-edges {
  position: absolute;
  inset: 0;
  overflow: visible;
}

.story-edge__line {
  fill: none;
  stroke: #66788a;
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}

.story-edge--semantic .story-edge__line {
  stroke: #a75e82;
  stroke-width: 1.8;
  stroke-dasharray: 7 5;
}

.story-edge--selected .story-edge__line {
  stroke: var(--timeline-focus-stroke);
  stroke-width: 4;
  stroke-dasharray: none;
}

.story-edge__hit {
  stroke: transparent;
  stroke-width: 16;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
  pointer-events: stroke;
}

.story-edge__hit:focus {
  outline: none;
}

.story-edge:has(.story-edge__hit:focus-visible) .story-edge__line {
  stroke: var(--timeline-focus-stroke);
  stroke-width: 4;
}

.story-edges marker path {
  fill: #66788a;
}

.story-node {
  position: absolute;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 4px;
  padding: 10px 12px 9px 15px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--category-color) 58%, var(--border));
  border-left: 5px solid var(--category-color);
  border-radius: 11px;
  background: color-mix(in srgb, var(--category-color) 7%, var(--surface));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--shadow) 72%, transparent);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.story-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 11px 24px var(--shadow);
}

.story-node--isolated {
  border-style: dashed;
  background: color-mix(in srgb, var(--category-color) 4%, var(--surface));
}

.story-node--selected {
  outline: 3px solid var(--timeline-focus-stroke);
  outline-offset: 3px;
}

.story-node__category {
  color: color-mix(in srgb, var(--category-color) 82%, var(--text-primary));
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.story-node strong {
  align-self: center;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.story-node__people {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.graph-controls {
  position: absolute;
  z-index: 4;
  bottom: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface-elevated);
  box-shadow: 0 6px 18px var(--shadow);
}

.graph-controls button,
.graph-controls output {
  display: grid;
  min-width: 36px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--button-text);
  font: inherit;
  font-size: 12px;
}

.graph-controls button {
  cursor: pointer;
}

.graph-controls button:hover {
  background: var(--surface-soft);
}

.graph-controls output {
  min-width: 48px;
  color: var(--text-muted);
  font-size: 10px;
}

.story-detail {
  position: absolute;
  z-index: 5;
  top: 12px;
  right: 12px;
  width: min(350px, calc(100% - 24px));
  max-height: calc(100% - 24px);
  box-sizing: border-box;
  overflow: auto;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-elevated);
  box-shadow: 0 18px 44px var(--shadow);
  color: var(--text-primary);
}

.story-detail__close {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--button-bg);
  color: var(--button-text);
  font-size: 18px;
  cursor: pointer;
}

.detail-kicker {
  color: #aa334a;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.story-detail h2 {
  margin: 6px 34px 18px 0;
  font-size: 18px;
  line-height: 1.45;
}

.story-detail dl {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
}

.story-detail dl > div {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 10px;
  font-size: 12px;
}

.story-detail dt {
  color: var(--text-muted);
  font-weight: 800;
}

.story-detail dd {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0;
  overflow-wrap: anywhere;
}

.detail-chip {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--surface-soft);
}

.detail-note {
  margin: 0 0 16px;
  padding: 10px;
  border-left: 3px solid #c35e74;
  background: var(--surface-soft);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.65;
}

.story-detail code {
  display: block;
  overflow-wrap: anywhere;
  color: var(--text-faint);
  font-size: 9px;
}

.node-references {
  display: grid;
  gap: 7px;
  margin: 0 0 16px;
}

.node-references h3 {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.node-references a {
  display: grid;
  gap: 2px;
  padding: 8px 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--text-primary);
  font-size: 11px;
  text-decoration: none;
}

.node-references a:hover {
  border-color: var(--border-strong);
}

.node-references span {
  color: var(--text-muted);
  font-size: 9px;
}

.edge-endpoints {
  display: grid;
  gap: 6px;
  margin-bottom: 18px;
  justify-items: stretch;
}

.edge-endpoints > span {
  color: var(--text-muted);
  text-align: center;
}

.edge-endpoints button {
  display: grid;
  gap: 4px;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.edge-endpoints button span {
  color: var(--text-muted);
  font-size: 9px;
}

.story-empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.story-empty p {
  max-width: 32rem;
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.story-empty button {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--button-bg);
  color: var(--button-text);
  cursor: pointer;
}

@media (max-width: 940px) {
  .story-toolbar {
    grid-template-columns: 1fr;
  }

  .story-filters {
    grid-row: auto;
    grid-column: auto;
    flex-wrap: wrap;
  }

  .story-filters label:first-child {
    flex: 1 1 190px;
  }

  .story-filters input {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .story-page {
    height: calc(100dvh - var(--app-header-height));
  }

  .story-toolbar {
    gap: 8px;
    max-height: 178px;
    overflow-y: auto;
    padding: 10px;
  }

  .story-toolbar__intro > span:last-child,
  .story-legend {
    display: none;
  }

  .story-filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .story-filters label:first-child {
    grid-column: 1 / -1;
  }

  .story-filters select {
    width: 100%;
    max-width: none;
  }

  .story-filters button {
    grid-column: 1 / -1;
  }

  .story-detail {
    top: auto;
    right: 8px;
    bottom: 8px;
    left: 8px;
    width: auto;
    max-height: min(60%, 440px);
    padding: 18px;
  }

  .graph-controls {
    bottom: 10px;
    left: 10px;
  }
}
</style>
