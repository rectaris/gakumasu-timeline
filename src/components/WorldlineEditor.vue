<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import {
  buildLaneLayout,
  visibleEventLayouts,
} from "../utils/timelineLayout.js";

const API_ROOT = "/__worldline-editor/api";
const PREVIEW_EVENT_HEIGHT = 26;
const PREVIEW_SUB_LANE_SPACING = 36;
const PREVIEW_LANE_PADDING = 8;

const state = ref(null);
const loading = ref(true);
const loadError = ref("");
const searchQuery = ref("");
const selectedSourceFile = ref("");
const selectedEventId = ref("");
const previewResult = ref(null);
const saveResult = ref(null);
const busy = ref(false);
const editorMode = ref("edit");
const selectedCommuType = ref("commonTimeline");
const previewTrackRef = ref(null);
const previewRangeState = ref({ center: null, span: null });
const previewVerticalOffset = ref(0);
const previewDragState = ref({
  active: false,
  dragging: false,
  pointerId: null,
  lastClientX: 0,
  lastClientY: 0,
});

const COMMU_TYPES = [
  { id: "commonTimeline", label: "共通コミュ", fileBacked: false },
  { id: "eventCommus", label: "イベントコミュ", fileBacked: true },
  { id: "supportCardCommus", label: "サポカコミュ", fileBacked: true },
  { id: "hatsuboshiCommus", label: "初星コミュ", fileBacked: true },
  { id: "idolCommu", label: "アイドルコミュ", fileBacked: true },
];

const form = reactive(createEmptyForm());

function createEmptyDate() {
  return { year: 1, month: 4, day: 1 };
}

function createEmptyForm() {
  return {
    sourceFile: "",
    originalSourceFile: "",
    originalEventId: "",
    id: "",
    title: "",
    detail: "",
    occurrenceType: "singleWithinRange",
    start: createEmptyDate(),
    end: createEmptyDate(),
    dateConfidence: "",
    sourceBasis: "",
    sourceStatus: "",
    rangeReason: "",
    participants: [],
    worldlineId: [],
    sourceText: "",
    noteText: "",
    sourceDetails: [],
    conflicts: [],
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function linesToArray(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function normalizeDate(date) {
  return {
    year: Number(date?.year ?? 1),
    month: Number(date?.month ?? 1),
    day: Number(date?.day ?? 1),
  };
}

function sourceDetailToForm(sourceDetail = {}) {
  return {
    id: sourceDetail.id ?? "",
    label: sourceDetail.label ?? "",
    url: sourceDetail.url ?? "",
    status: sourceDetail.status ?? "",
    claim: sourceDetail.claim ?? "",
    supports: Array.isArray(sourceDetail.supports) ? [...sourceDetail.supports] : [],
  };
}

function conflictToForm(conflict = {}) {
  return {
    summary: conflict.summary ?? "",
    sourcesText: arrayToLines(conflict.sources),
    resolution: conflict.resolution ?? "",
  };
}

function assignForm(nextForm) {
  Object.assign(form, createEmptyForm(), nextForm);
}

function loadEventIntoForm(entry, event) {
  assignForm({
    sourceFile: entry.sourceFile,
    originalSourceFile: entry.sourceFile,
    originalEventId: event.id,
    id: event.id ?? "",
    title: event.title ?? "",
    detail: event.detail ?? "",
    occurrenceType: event.occurrenceType ?? "singleWithinRange",
    start: normalizeDate(event.start),
    end: normalizeDate(event.end),
    dateConfidence: event.dateConfidence ?? "",
    sourceBasis: event.sourceBasis ?? "",
    sourceStatus: event.sourceStatus ?? "",
    rangeReason: event.rangeReason ?? "",
    participants: Array.isArray(event.participants) ? [...event.participants] : [],
    worldlineId: Array.isArray(event.worldlineId) ? [...event.worldlineId] : [],
    sourceText: arrayToLines(event.source),
    noteText: arrayToLines(event.note),
    sourceDetails: Array.isArray(event.sourceDetails)
      ? event.sourceDetails.map(sourceDetailToForm)
      : [],
    conflicts: Array.isArray(event.conflicts)
      ? event.conflicts.map(conflictToForm)
      : [],
  });
}

function createDraftForLane(entry) {
  const lanePrefix = entry?.lane?.id
    ? entry.lane.id.replace(/[^a-zA-Z0-9]+/g, "_")
    : "event";

  assignForm({
    sourceFile: entry?.sourceFile ?? "",
    originalSourceFile: entry?.sourceFile ?? "",
    originalEventId: "",
    id: `${lanePrefix}_new_event`,
    title: "",
    detail: "",
    occurrenceType: "singleWithinRange",
    start: createEmptyDate(),
    end: createEmptyDate(),
    participants: entry?.category === "idolCommu" ? [entry.lane.id] : [],
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) =>
      Array.isArray(item) ? item.length > 0 : item !== "",
    ),
  );
}

function formSourceDetailsToEvent() {
  return form.sourceDetails
    .map((sourceDetail) =>
      compactObject({
        id: sourceDetail.id.trim(),
        label: sourceDetail.label.trim(),
        url: sourceDetail.url.trim(),
        status: sourceDetail.status,
        claim: sourceDetail.claim.trim(),
        supports: sourceDetail.supports,
      }),
    )
    .filter((sourceDetail) => sourceDetail.label);
}

function formConflictsToEvent() {
  return form.conflicts
    .map((conflict) =>
      compactObject({
        summary: conflict.summary.trim(),
        sources: linesToArray(conflict.sourcesText),
        resolution: conflict.resolution.trim(),
      }),
    )
    .filter((conflict) => conflict.summary);
}

function formToEvent() {
  return {
    id: form.id.trim(),
    start: normalizeDate(form.start),
    end: normalizeDate(form.end),
    title: form.title.trim(),
    detail: form.detail.trim(),
    occurrenceType: form.occurrenceType,
    dateConfidence: form.dateConfidence,
    sourceBasis: form.sourceBasis,
    sourceStatus: form.sourceStatus,
    rangeReason: form.rangeReason,
    worldlineId: [...form.worldlineId],
    participants: [...form.participants],
    source: linesToArray(form.sourceText),
    sourceDetails: formSourceDetailsToEvent(),
    conflicts: formConflictsToEvent(),
    note: linesToArray(form.noteText),
  };
}

function mutationRequest(action) {
  return {
    action,
    sourceFile: form.originalSourceFile || form.sourceFile,
    targetSourceFile: form.sourceFile,
    eventId: form.originalEventId || form.id,
    event: action === "delete" ? undefined : formToEvent(),
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(
      payload.message || payload.validation?.message || "Request failed.",
    );
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function loadState() {
  loading.value = true;
  loadError.value = "";

  try {
    state.value = await fetchJson(`${API_ROOT}/state`);
    selectedCommuType.value = "commonTimeline";
    selectedSourceFile.value = firstSourceFileForCommu("commonTimeline");
    const firstEvent = selectedLane.value?.lane.events[0];
    selectedEventId.value = firstEvent?.id ?? "";
    if (selectedLane.value && firstEvent) {
      loadEventIntoForm(selectedLane.value, firstEvent);
    } else if (selectedLane.value) {
      editorMode.value = "add";
      createDraftForLane(selectedLane.value);
    }
  } catch (error) {
    loadError.value = error.message;
  } finally {
    loading.value = false;
  }
}

const laneEntries = computed(() => state.value?.lanes ?? []);
const options = computed(() => state.value?.options ?? {});
const commuTypeOptions = computed(() =>
  COMMU_TYPES.map((type) => ({
    ...type,
    count: laneEntries.value.filter((entry) => entry.category === type.id).length,
  })),
);
const selectedCommuConfig = computed(() =>
  COMMU_TYPES.find((type) => type.id === selectedCommuType.value) ??
  COMMU_TYPES[0],
);
const selectedCommuEntries = computed(() =>
  laneEntries.value.filter((entry) => entry.category === selectedCommuType.value),
);
const selectedLane = computed(() =>
  laneEntries.value.find((entry) => entry.sourceFile === selectedSourceFile.value),
);
const destinationLane = computed(() =>
  laneEntries.value.find((entry) => entry.sourceFile === form.sourceFile),
);
const eventOptions = computed(() => selectedLane.value?.lane.events ?? []);
const selectedEvent = computed(() =>
  eventOptions.value.find((event) => event.id === selectedEventId.value),
);
const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase("ja-JP");
  const rows = selectedCommuEntries.value.flatMap((entry) =>
    entry.lane.events.map((event) => ({ entry, event })),
  );

  if (!query) return rows;

  return rows.filter(({ entry, event }) =>
    [
      entry.categoryLabel,
      entry.lane.name,
      entry.sourceFile,
      event.id,
      event.title,
      event.detail,
      ...(Array.isArray(event.source) ? event.source : []),
    ]
      .join("\n")
      .toLocaleLowerCase("ja-JP")
      .includes(query),
  );
});

function firstSourceFileForCommu(commuType) {
  return (
    laneEntries.value.find((entry) => entry.category === commuType)?.sourceFile ?? ""
  );
}

function eventDayValue(date, fallbackDay) {
  return (
    (Number(date?.year ?? 0) * 12 + (Number(date?.month ?? 1) - 1)) * 31 +
    (Number(date?.day ?? fallbackDay) - 1)
  );
}

const previewLaneEvents = computed(() => {
  const entry = destinationLane.value;
  if (!entry) return [];

  const events = entry.lane.events.map((event) => clone(event));
  const nextEvent = formToEvent();
  if (!nextEvent.id) return events;

  const sameLaneEdit =
    editorMode.value === "edit" &&
    form.originalSourceFile === form.sourceFile &&
    form.originalEventId;

  if (sameLaneEdit) {
    const index = events.findIndex((event) => event.id === form.originalEventId);
    if (index !== -1) {
      events.splice(index, 1, nextEvent);
      return events;
    }
  }

  if (
    editorMode.value === "add" ||
    form.originalSourceFile !== form.sourceFile ||
    !events.some((event) => event.id === nextEvent.id)
  ) {
    events.push(nextEvent);
  }

  return events;
});

const previewLaneBounds = computed(() => {
  const dayValues = previewLaneEvents.value.flatMap((event) => [
    eventDayValue(event.start, 1),
    eventDayValue(event.end, 31),
  ]);
  if (dayValues.length === 0) {
    return { min: 0, max: 1, span: 1 };
  }

  const min = Math.min(...dayValues);
  const max = Math.max(...dayValues);
  return { min, max, span: Math.max(1, max - min) };
});

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const previewVisibleRange = computed(() => {
  const bounds = previewLaneBounds.value;
  const minSpan = Math.max(1, bounds.span * 0.04);
  const span = clampNumber(
    Number(previewRangeState.value.span ?? bounds.span),
    minSpan,
    bounds.span,
  );
  const defaultCenter = bounds.min + bounds.span / 2;
  const halfSpan = span / 2;
  const center = clampNumber(
    Number(previewRangeState.value.center ?? defaultCenter),
    bounds.min + halfSpan,
    bounds.max - halfSpan,
  );

  return {
    min: center - halfSpan,
    max: center + halfSpan,
    center,
    span,
  };
});

const previewLaneLayout = computed(() => {
  const layoutEvents = previewLaneEvents.value.map((event) => {
    const displayStartDay = eventDayValue(event.start, 1);
    const displayEndDay = eventDayValue(event.end, 31);

    return {
      ...event,
      laneIndex: 0,
      displayStartDay: Math.min(displayStartDay, displayEndDay),
      displayEndDay: Math.max(displayStartDay, displayEndDay),
    };
  });

  return {
    laneIndex: 0,
    ...buildLaneLayout(layoutEvents),
  };
});

const previewVisibleLaneEvents = computed(() =>
  visibleEventLayouts([previewLaneLayout.value], previewVisibleRange.value),
);

const previewRenderedSubLaneCount = computed(() =>
  Math.max(
    1,
    ...previewVisibleLaneEvents.value.map((event) => (event.subLaneIndex ?? 0) + 1),
  ),
);

const previewContentHeight = computed(() =>
  PREVIEW_LANE_PADDING * 2 +
  PREVIEW_EVENT_HEIGHT +
  (previewRenderedSubLaneCount.value - 1) * PREVIEW_SUB_LANE_SPACING,
);

const previewContentStyle = computed(() => ({
  height: `${previewContentHeight.value}px`,
  transform: `translateY(${-previewVerticalOffset.value}px)`,
}));

function previewEventLayout(event) {
  const bounds = previewVisibleRange.value;
  const visibleStart = clampNumber(event.renderStartDay, bounds.min, bounds.max);
  const visibleEnd = clampNumber(event.renderEndDay, bounds.min, bounds.max);
  const visibleSpan = Math.max(0, visibleEnd - visibleStart + 1);
  const rawWidth = (visibleSpan / bounds.span) * 100;

  if (rawWidth < 3 && !isPreviewFocusEvent(event)) {
    return null;
  }

  const left = clampNumber(((visibleStart - bounds.min) / bounds.span) * 100, 0, 98.5);
  const width = Math.min(
    100 - left,
    Math.max(3, rawWidth),
  );
  const subLaneIndex = event.subLaneIndex ?? 0;
  const labelVisible = width >= 12;

  return {
    event,
    labelVisible,
    style: {
      left: `${left}%`,
      top: `${PREVIEW_LANE_PADDING + subLaneIndex * PREVIEW_SUB_LANE_SPACING}px`,
      height: `${PREVIEW_EVENT_HEIGHT}px`,
      width: `${width}%`,
    },
  };
}

const previewLaneItems = computed(() =>
  previewVisibleLaneEvents.value.map((event) =>
    previewEventLayout(event),
  ).filter(Boolean),
);

function isPreviewFocusEvent(event) {
  return event.id === form.id;
}

function setPreviewRange(center, span) {
  const bounds = previewLaneBounds.value;
  const nextSpan = clampNumber(span, Math.max(1, bounds.span * 0.04), bounds.span);
  const halfSpan = nextSpan / 2;
  previewRangeState.value = {
    center: clampNumber(center, bounds.min + halfSpan, bounds.max - halfSpan),
    span: nextSpan,
  };
  setPreviewVerticalOffset(previewVerticalOffset.value);
}

function zoomLanePreview(scale, anchorRatio = 0.5) {
  const range = previewVisibleRange.value;
  const clampedAnchorRatio = clampNumber(anchorRatio, 0, 1);
  const nextSpan = range.span * scale;
  const anchorDay = range.min + range.span * clampedAnchorRatio;
  const nextMin = anchorDay - nextSpan * clampedAnchorRatio;
  setPreviewRange(nextMin + nextSpan / 2, nextSpan);
}

function panLanePreview(direction) {
  const range = previewVisibleRange.value;
  setPreviewRange(range.center + range.span * 0.35 * direction, range.span);
}

function panLanePreviewByPixels(deltaPixels, width) {
  if (!width) return;
  const range = previewVisibleRange.value;
  setPreviewRange(
    range.center + (deltaPixels / width) * range.span,
    range.span,
  );
}

function previewViewportHeight() {
  return previewTrackRef.value?.clientHeight ?? 180;
}

function setPreviewVerticalOffset(offset, viewportHeight = previewViewportHeight()) {
  const maxOffset = Math.max(0, previewContentHeight.value - viewportHeight);
  previewVerticalOffset.value = clampNumber(offset, 0, maxOffset);
}

function panLanePreviewVerticallyByPixels(deltaPixels, viewportHeight) {
  setPreviewVerticalOffset(previewVerticalOffset.value + deltaPixels, viewportHeight);
}

function handlePreviewPointerDown(event) {
  if (event.button !== 0 || !destinationLane.value) return;

  event.preventDefault();
  previewDragState.value = {
    active: true,
    dragging: false,
    pointerId: event.pointerId,
    lastClientX: event.clientX,
    lastClientY: event.clientY,
  };
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function handlePreviewPointerMove(event) {
  const drag = previewDragState.value;
  if (!drag.active || drag.pointerId !== event.pointerId) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const diffX = event.clientX - drag.lastClientX;
  const diffY = event.clientY - drag.lastClientY;
  if (Math.abs(diffX) < 1 && Math.abs(diffY) < 1) return;

  event.preventDefault();
  if (Math.abs(diffX) >= 1) {
    panLanePreviewByPixels(-diffX, rect.width);
  }
  if (Math.abs(diffY) >= 1) {
    panLanePreviewVerticallyByPixels(-diffY, rect.height);
  }
  previewDragState.value = {
    ...drag,
    dragging: true,
    lastClientX: event.clientX,
    lastClientY: event.clientY,
  };
}

function handlePreviewPointerEnd(event) {
  const drag = previewDragState.value;
  if (!drag.active || drag.pointerId !== event.pointerId) return;

  event.currentTarget.releasePointerCapture?.(event.pointerId);
  previewDragState.value = {
    active: false,
    dragging: false,
    pointerId: null,
    lastClientX: 0,
    lastClientY: 0,
  };
}

function handlePreviewWheel(event) {
  if (!destinationLane.value) return;

  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width) return;

  const anchorRatio = (event.clientX - rect.left) / rect.width;
  zoomLanePreview(Math.exp(event.deltaY * 0.0015), anchorRatio);
}

function resetLanePreviewRange() {
  previewRangeState.value = { center: null, span: null };
  previewVerticalOffset.value = 0;
}

const changedFields = computed(() => {
  if (editorMode.value === "add" || !selectedEvent.value) {
    return form.id ? ["new event"] : [];
  }

  const next = formToEvent();
  const current = clone(selectedEvent.value);
  return Object.keys(next).filter(
    (field) =>
      JSON.stringify(next[field] ?? null) !==
      JSON.stringify(current[field] ?? null),
  );
});

const canSave = computed(
  () =>
    !busy.value &&
    form.sourceFile &&
    form.id.trim() &&
    form.title.trim() &&
    form.detail.trim(),
);

watch(selectedEvent, (event) => {
  if (!event || !selectedLane.value || editorMode.value !== "edit") return;
  previewResult.value = null;
  saveResult.value = null;
  loadEventIntoForm(selectedLane.value, event);
});

watch(selectedSourceFile, () => {
  if (editorMode.value === "add") {
    createDraftForLane(selectedLane.value);
    return;
  }

  selectedEventId.value = selectedLane.value?.lane.events[0]?.id ?? "";
});

watch(selectedCommuType, (commuType) => {
  selectedSourceFile.value = firstSourceFileForCommu(commuType);
  if (!selectedSourceFile.value) {
    selectedEventId.value = "";
    assignForm({ sourceFile: "", originalSourceFile: "", originalEventId: "" });
    return;
  }

  if (editorMode.value === "add") {
    createDraftForLane(selectedLane.value);
  }
});

watch(
  () => [form.sourceFile, form.id, form.start.year, form.start.month, form.start.day, form.end.year, form.end.month, form.end.day],
  () => {
    resetLanePreviewRange();
  },
);

function selectRow(row) {
  editorMode.value = "edit";
  selectedCommuType.value = row.entry.category;
  selectedSourceFile.value = row.entry.sourceFile;
  selectedEventId.value = row.event.id;
}

function startAdd() {
  if (!selectedLane.value) return;
  editorMode.value = "add";
  previewResult.value = null;
  saveResult.value = null;
  createDraftForLane(selectedLane.value);
}

function duplicateSelected() {
  if (!selectedLane.value || !selectedEvent.value) return;
  editorMode.value = "add";
  const copy = clone(selectedEvent.value);
  copy.id = `${copy.id}_copy`;
  copy.title = `${copy.title} コピー`;
  loadEventIntoForm(selectedLane.value, copy);
  form.originalEventId = "";
}

function addSourceDetail() {
  form.sourceDetails.push(sourceDetailToForm());
}

function removeSourceDetail(index) {
  form.sourceDetails.splice(index, 1);
}

function addConflict() {
  form.conflicts.push(conflictToForm());
}

function removeConflict(index) {
  form.conflicts.splice(index, 1);
}

function toggleListValue(list, id) {
  const index = list.indexOf(id);
  if (index === -1) {
    list.push(id);
    return;
  }
  list.splice(index, 1);
}

async function preview(action = editorMode.value === "add" ? "add" : "update") {
  busy.value = true;
  previewResult.value = null;
  saveResult.value = null;

  try {
    previewResult.value = await fetchJson(`${API_ROOT}/preview`, {
      method: "POST",
      body: JSON.stringify(mutationRequest(action)),
    });
  } catch (error) {
    previewResult.value = error.payload ?? {
      ok: false,
      validation: { message: error.message },
    };
  } finally {
    busy.value = false;
  }
}

async function save(action = editorMode.value === "add" ? "add" : "update") {
  busy.value = true;
  saveResult.value = null;

  try {
    const savedSourceFile = form.sourceFile;
    const savedEventId = form.id;
    saveResult.value = await fetchJson(`${API_ROOT}/save`, {
      method: "POST",
      body: JSON.stringify(mutationRequest(action)),
    });
    await loadState();
    editorMode.value = "edit";
    selectedSourceFile.value = savedSourceFile;
    selectedEventId.value = savedEventId;
  } catch (error) {
    saveResult.value = error.payload ?? {
      ok: false,
      validation: { message: error.message },
    };
  } finally {
    busy.value = false;
  }
}

async function deleteSelected() {
  if (!selectedEvent.value) return;
  const confirmed = window.confirm(`イベント「${selectedEvent.value.title}」を削除します。`);
  if (!confirmed) return;
  await save("delete");
}

onMounted(loadState);
</script>

<template>
  <main class="worldline-editor">
    <header class="worldline-editor__header">
      <div>
        <p class="worldline-editor__eyebrow">local editor</p>
        <h1>Worldline Data Editor</h1>
      </div>
      <a class="worldline-editor__link" href="./">タイムラインへ戻る</a>
    </header>

    <div v-if="loading" class="worldline-editor__notice">読み込み中</div>
    <div v-else-if="loadError" class="worldline-editor__notice worldline-editor__notice--error">
      {{ loadError }}
    </div>

    <section v-else class="worldline-editor__layout">
      <aside class="worldline-editor__sidebar" aria-label="イベント一覧">
        <div class="editor-sidebar-controls">
          <div class="editor-field editor-field--sidebar">
            <label for="editor-search">検索</label>
            <input id="editor-search" v-model="searchQuery" type="search" />
          </div>

          <div class="editor-field editor-field--sidebar">
            <label for="editor-commu-type">コミュ種別</label>
            <select id="editor-commu-type" v-model="selectedCommuType">
              <option
                v-for="type in commuTypeOptions"
                :key="type.id"
                :value="type.id"
              >
                {{ type.label }}{{ type.fileBacked ? ` (${type.count})` : "" }}
              </option>
            </select>
          </div>

          <div
            v-if="selectedCommuConfig.fileBacked"
            class="editor-field editor-field--sidebar"
          >
            <label for="editor-file">ファイル</label>
            <select
              id="editor-file"
              v-model="selectedSourceFile"
              :disabled="selectedCommuEntries.length === 0"
            >
              <option
                v-for="entry in selectedCommuEntries"
                :key="entry.sourceFile"
                :value="entry.sourceFile"
              >
                {{ entry.lane.name }}
              </option>
            </select>
          </div>

          <div v-else class="editor-current-file">
            <span>共通コミュ</span>
            <strong>{{ selectedLane?.lane.name }}</strong>
          </div>

          <p v-if="selectedCommuEntries.length === 0" class="editor-empty">
            このコミュ種別には編集できるファイルがありません。
          </p>

          <button
            class="editor-button editor-button--primary editor-button--sidebar"
            type="button"
            :disabled="!selectedLane"
            @click="startAdd"
          >
            新規イベント
          </button>
        </div>

        <div class="editor-event-pane">
          <h2>イベント</h2>
          <div class="event-list" role="list">
            <button
              v-for="row in filteredEvents"
              :key="`${row.entry.sourceFile}:${row.event.id}`"
              class="event-list__item"
              :class="{
                selected:
                  row.entry.sourceFile === form.originalSourceFile &&
                  row.event.id === form.originalEventId,
              }"
              type="button"
              @click="selectRow(row)"
            >
              <span>{{ row.event.title }}</span>
              <small>{{ row.entry.lane.name }} / {{ row.event.id }}</small>
            </button>
          </div>
        </div>
      </aside>

      <form class="worldline-editor__form" @submit.prevent="preview()">
        <div class="editor-toolbar">
          <div>
            <p class="worldline-editor__eyebrow">{{ editorMode === "add" ? "new" : "edit" }}</p>
            <h2>{{ form.title || "未入力イベント" }}</h2>
          </div>
          <div class="editor-toolbar__actions">
            <button class="editor-button" type="button" @click="duplicateSelected">
              複製
            </button>
            <button class="editor-button" type="submit" :disabled="!canSave">
              差分確認
            </button>
            <button
              class="editor-button editor-button--primary"
              type="button"
              :disabled="!canSave"
              @click="save()"
            >
              保存
            </button>
          </div>
        </div>

        <section class="editor-section">
          <h3>基本情報</h3>
          <div class="editor-grid">
            <div class="editor-field">
              <label for="event-id">ID</label>
              <input id="event-id" v-model="form.id" type="text" />
            </div>
            <div class="editor-field">
              <label for="event-target-lane">保存先</label>
              <select id="event-target-lane" v-model="form.sourceFile">
                <option
                  v-for="entry in laneEntries"
                  :key="entry.sourceFile"
                  :value="entry.sourceFile"
                >
                  {{ entry.categoryLabel }} / {{ entry.lane.name }}
                </option>
              </select>
            </div>
            <div class="editor-field editor-field--wide">
              <label for="event-title">タイトル</label>
              <input id="event-title" v-model="form.title" type="text" />
            </div>
            <div class="editor-field editor-field--wide">
              <label for="event-detail">詳細</label>
              <textarea id="event-detail" v-model="form.detail" rows="4"></textarea>
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h3>時期</h3>
          <div class="editor-grid editor-grid--dates">
            <div class="editor-field">
              <label for="event-occurrence">発生形式</label>
              <select id="event-occurrence" v-model="form.occurrenceType">
                <option v-for="option in options.occurrenceTypes" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="editor-date-group">
              <span>開始</span>
              <div class="editor-date-inputs">
                <input v-model.number="form.start.year" type="number" aria-label="開始年" />
                <input v-model.number="form.start.month" type="number" min="1" max="12" aria-label="開始月" />
                <input v-model.number="form.start.day" type="number" min="1" max="31" aria-label="開始日" />
              </div>
            </div>
            <div class="editor-date-group">
              <span>終了</span>
              <div class="editor-date-inputs">
                <input v-model.number="form.end.year" type="number" aria-label="終了年" />
                <input v-model.number="form.end.month" type="number" min="1" max="12" aria-label="終了月" />
                <input v-model.number="form.end.day" type="number" min="1" max="31" aria-label="終了日" />
              </div>
            </div>
            <div class="editor-field">
              <label for="date-confidence">日付確度</label>
              <select id="date-confidence" v-model="form.dateConfidence">
                <option v-for="option in options.dateConfidence" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="editor-field">
              <label for="range-reason">範囲理由</label>
              <select id="range-reason" v-model="form.rangeReason">
                <option v-for="option in options.rangeReason" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h3>分類</h3>
          <div class="editor-grid">
            <div class="editor-field">
              <label for="source-basis">根拠分類</label>
              <select id="source-basis" v-model="form.sourceBasis">
                <option v-for="option in options.sourceBasis" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="editor-field">
              <label for="source-status">出典状態</label>
              <select id="source-status" v-model="form.sourceStatus">
                <option v-for="option in options.sourceStatus" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <fieldset class="editor-checks">
              <legend>参加者</legend>
              <label v-for="option in options.participants" :key="option.id">
                <input
                  type="checkbox"
                  :checked="form.participants.includes(option.id)"
                  @change="toggleListValue(form.participants, option.id)"
                />
                {{ option.label }}
              </label>
            </fieldset>
            <fieldset class="editor-checks">
              <legend>世界線</legend>
              <label v-for="option in options.worldlines" :key="option.id">
                <input
                  type="checkbox"
                  :checked="form.worldlineId.includes(option.id)"
                  @change="toggleListValue(form.worldlineId, option.id)"
                />
                {{ option.label }}
              </label>
            </fieldset>
          </div>
        </section>

        <section class="editor-section">
          <h3>出典と補足</h3>
          <div class="editor-grid">
            <div class="editor-field">
              <label for="event-source">簡易出典</label>
              <textarea id="event-source" v-model="form.sourceText" rows="5"></textarea>
            </div>
            <div class="editor-field">
              <label for="event-note">補足</label>
              <textarea id="event-note" v-model="form.noteText" rows="5"></textarea>
            </div>
          </div>
        </section>

        <section class="editor-section">
          <div class="editor-section__header">
            <h3>構造化出典</h3>
            <button class="editor-button" type="button" @click="addSourceDetail">
              追加
            </button>
          </div>
          <div
            v-for="(sourceDetail, index) in form.sourceDetails"
            :key="index"
            class="editor-repeat"
          >
            <div class="editor-grid">
              <div class="editor-field">
                <label>ID</label>
                <input v-model="sourceDetail.id" type="text" />
              </div>
              <div class="editor-field">
                <label>ラベル</label>
                <input v-model="sourceDetail.label" type="text" />
              </div>
              <div class="editor-field editor-field--wide">
                <label>URL</label>
                <input v-model="sourceDetail.url" type="url" />
              </div>
              <div class="editor-field">
                <label>状態</label>
                <select v-model="sourceDetail.status">
                  <option v-for="option in options.sourceStatus" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="editor-field editor-field--wide">
                <label>主張</label>
                <textarea v-model="sourceDetail.claim" rows="3"></textarea>
              </div>
              <fieldset class="editor-checks editor-field--wide">
                <legend>支える対象</legend>
                <label v-for="option in options.sourceSupports" :key="option.id">
                  <input
                    type="checkbox"
                    :checked="sourceDetail.supports.includes(option.id)"
                    @change="toggleListValue(sourceDetail.supports, option.id)"
                  />
                  {{ option.label }}
                </label>
              </fieldset>
            </div>
            <button class="editor-button editor-button--danger" type="button" @click="removeSourceDetail(index)">
              削除
            </button>
          </div>
        </section>

        <section class="editor-section">
          <div class="editor-section__header">
            <h3>出典矛盾</h3>
            <button class="editor-button" type="button" @click="addConflict">
              追加
            </button>
          </div>
          <div v-for="(conflict, index) in form.conflicts" :key="index" class="editor-repeat">
            <div class="editor-grid">
              <div class="editor-field editor-field--wide">
                <label>概要</label>
                <input v-model="conflict.summary" type="text" />
              </div>
              <div class="editor-field">
                <label>出典</label>
                <textarea v-model="conflict.sourcesText" rows="4"></textarea>
              </div>
              <div class="editor-field">
                <label>解決状態</label>
                <textarea v-model="conflict.resolution" rows="4"></textarea>
              </div>
            </div>
            <button class="editor-button editor-button--danger" type="button" @click="removeConflict(index)">
              削除
            </button>
          </div>
        </section>
      </form>

      <aside class="worldline-editor__review" aria-label="保存前レビュー">
        <section class="editor-section">
          <h2>保存前レビュー</h2>
          <dl class="editor-summary">
            <div>
              <dt>対象</dt>
              <dd>{{ form.sourceFile }}</dd>
            </div>
            <div>
              <dt>変更項目</dt>
              <dd>{{ changedFields.length ? changedFields.join(", ") : "なし" }}</dd>
            </div>
          </dl>
          <div class="editor-preview">
            <h3>{{ form.title || "未入力イベント" }}</h3>
            <p>{{ form.detail || "詳細未入力" }}</p>
            <small>
              {{ form.start.year }}/{{ form.start.month }}/{{ form.start.day }}
              -
              {{ form.end.year }}/{{ form.end.month }}/{{ form.end.day }}
            </small>
          </div>
          <div class="editor-lane-preview" aria-label="保存先レーンプレビュー">
            <div class="editor-lane-preview__header">
              <div>
                <span>レーンプレビュー</span>
                <strong>{{ destinationLane?.lane.name || "未選択" }}</strong>
              </div>
            </div>
            <div v-if="destinationLane" class="editor-lane-preview__controls">
              <button class="editor-button editor-button--compact" type="button" @click="panLanePreview(-1)">
                左へ
              </button>
              <button class="editor-button editor-button--compact" type="button" @click="zoomLanePreview(0.65)">
                拡大
              </button>
              <button class="editor-button editor-button--compact" type="button" @click="zoomLanePreview(1.55)">
                縮小
              </button>
              <button class="editor-button editor-button--compact" type="button" @click="panLanePreview(1)">
                右へ
              </button>
              <button class="editor-button editor-button--compact" type="button" @click="resetLanePreviewRange">
                全体
              </button>
            </div>
            <div
              v-if="destinationLane"
              ref="previewTrackRef"
              class="editor-lane-preview__track"
              :class="{ 'editor-lane-preview__track--dragging': previewDragState.dragging }"
              role="application"
              aria-label="レーンプレビュー。ドラッグで移動、ホイールで拡大縮小できます。"
              @pointerdown="handlePreviewPointerDown"
              @pointermove="handlePreviewPointerMove"
              @pointerup="handlePreviewPointerEnd"
              @pointercancel="handlePreviewPointerEnd"
              @wheel="handlePreviewWheel"
            >
              <div class="editor-lane-preview__content" :style="previewContentStyle">
                <div
                  v-for="item in previewLaneItems"
                  :key="`${item.event.id}:${item.event.title}`"
                  class="editor-lane-preview__event"
                  :class="{ focus: isPreviewFocusEvent(item.event), compact: !item.labelVisible }"
                  :style="item.style"
                  :title="`${item.event.title} / ${item.event.id}`"
                >
                  <span v-if="item.labelVisible">{{ item.event.title }}</span>
                </div>
              </div>
            </div>
            <p v-else class="editor-empty">保存先を選択してください。</p>
          </div>
          <button class="editor-button" type="button" :disabled="!selectedEvent" @click="deleteSelected">
            削除
          </button>
        </section>

        <section v-if="previewResult" class="editor-section">
          <h2>検証結果</h2>
          <p :class="previewResult.ok ? 'editor-ok' : 'editor-error'">
            {{ previewResult.ok ? "保存可能" : "保存不可" }}
          </p>
          <p v-if="previewResult.changedSourceFiles?.length">
            {{ previewResult.changedSourceFiles.join(", ") }}
          </p>
          <pre v-if="previewResult.validation?.message">{{ previewResult.validation.message }}</pre>
          <pre v-if="previewResult.patch">{{ previewResult.patch }}</pre>
        </section>

        <section v-if="saveResult" class="editor-section">
          <h2>保存結果</h2>
          <p :class="saveResult.ok ? 'editor-ok' : 'editor-error'">
            {{ saveResult.ok ? "保存しました" : "保存できませんでした" }}
          </p>
          <pre v-if="saveResult.validation?.message">{{ saveResult.validation.message }}</pre>
          <pre v-if="saveResult.patch">{{ saveResult.patch }}</pre>
        </section>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.worldline-editor {
  height: 100vh;
  margin-top: -56px;
  padding: 12px 24px 24px;
  color: var(--text-primary);
  background: var(--app-bg);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.worldline-editor__header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  z-index: 2;
}

.worldline-editor__header h1,
.worldline-editor__form h2,
.worldline-editor__review h2,
.editor-section h3 {
  margin: 0;
  line-height: 1.25;
}

.worldline-editor__eyebrow {
  margin: 0 0 4px;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
}

.worldline-editor__link,
.editor-button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--button-text);
  background: var(--button-bg);
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.editor-button:disabled {
  cursor: not-allowed;
  opacity: 0.54;
}

.editor-button--primary {
  border-color: var(--button-bg-strong);
  color: var(--button-text-inverse);
  background: var(--button-bg-strong);
}

.editor-button--danger {
  border-color: #b91c1c;
  color: #b91c1c;
}

.editor-button--compact {
  min-height: 28px;
  padding: 0 8px;
  font-size: 12px;
}

.worldline-editor__layout {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(460px, 1fr) minmax(280px, 360px);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  overflow: hidden;
}

.worldline-editor__sidebar,
.worldline-editor__form,
.worldline-editor__review {
  min-width: 0;
}

.worldline-editor__sidebar,
.editor-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 2px 8px var(--shadow);
}

.worldline-editor__sidebar {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  overflow: clip;
}

.editor-sidebar-controls {
  flex: 0 0 auto;
}

.editor-sidebar-controls > * + * {
  margin-top: 16px;
}

.worldline-editor__form,
.worldline-editor__review {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.worldline-editor__form {
  overflow-y: auto;
  padding-right: 4px;
}

.worldline-editor__review {
  overflow: clip;
}

.editor-toolbar,
.editor-section {
  padding: 14px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.editor-toolbar__actions,
.editor-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-section__header {
  justify-content: space-between;
  margin-bottom: 12px;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.editor-grid--dates {
  grid-template-columns: minmax(160px, 1fr) repeat(2, minmax(0, 1.2fr));
}

.editor-field,
.editor-checks {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-field--wide {
  grid-column: 1 / -1;
}

.editor-field--sidebar {
  gap: 8px;
}

.editor-field label,
.editor-checks legend,
.editor-date-group span {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.editor-field input,
.editor-field select,
.editor-field textarea,
.editor-date-group input {
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  background: var(--surface-soft);
  font: inherit;
  box-sizing: border-box;
}

.editor-field textarea {
  resize: vertical;
}

.editor-date-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-date-inputs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.editor-checks {
  grid-column: 1 / -1;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
}

.editor-checks label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 3px 10px 3px 0;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-event-pane {
  flex: 1 1 auto;
  min-height: 0;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
}

.editor-event-pane h2 {
  flex: 0 0 auto;
  margin: 0 0 10px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.3;
}

.editor-event-pane .event-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.event-list__item {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  color: var(--text-primary);
  background: var(--surface-soft);
  text-align: left;
  cursor: pointer;
}

.event-list__item.selected {
  border-color: var(--timeline-focus-stroke);
}

.event-list__item span,
.event-list__item small {
  display: block;
  overflow-wrap: anywhere;
}

.event-list__item small {
  color: var(--text-muted);
  font-size: 12px;
}

.editor-repeat {
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface-soft);
}

.editor-repeat + .editor-repeat {
  margin-top: 10px;
}

.editor-summary {
  margin: 0;
}

.editor-summary div {
  margin-bottom: 10px;
}

.editor-summary dt {
  color: var(--text-muted);
  font-size: 12px;
}

.editor-summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.editor-preview {
  margin: 12px 0;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface-soft);
}

.editor-preview p {
  overflow-wrap: anywhere;
}

.editor-current-file {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface-soft);
}

.editor-current-file span,
.editor-empty {
  color: var(--text-muted);
  font-size: 12px;
}

.editor-current-file strong {
  overflow-wrap: anywhere;
}

.editor-empty {
  margin: 0;
}

.editor-button--sidebar {
  width: 100%;
}

.editor-lane-preview {
  margin: 12px 0;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: var(--surface-soft);
}

.editor-lane-preview__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.editor-lane-preview__header div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.editor-lane-preview__header span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}

.editor-lane-preview__header strong {
  overflow-wrap: anywhere;
}

.editor-lane-preview__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.editor-lane-preview__track {
  position: relative;
  height: 180px;
  border: 1px solid var(--timeline-viewport-stroke);
  border-radius: 6px;
  background:
    linear-gradient(
      to right,
      var(--timeline-day-line) 1px,
      transparent 1px
    )
    0 0 / 12.5% 100%,
    var(--timeline-viewport-fill);
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.editor-lane-preview__content {
  position: relative;
  min-height: 100%;
  pointer-events: none;
  will-change: transform;
}

.editor-lane-preview__track--dragging {
  cursor: grabbing;
}

.editor-lane-preview__event {
  position: absolute;
  padding: 2px 6px;
  border: 1px solid var(--timeline-event-stroke);
  border-radius: 4px;
  color: var(--button-text-inverse);
  background: var(--button-bg-strong);
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.editor-lane-preview__event.focus {
  border: 2px solid var(--timeline-focus-stroke);
  background: #047857;
}

.editor-lane-preview__event.compact {
  padding: 0;
}

.editor-lane-preview__event span {
  font-size: 12px;
}

.worldline-editor__notice {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.worldline-editor__notice--error,
.editor-error {
  color: #b91c1c;
}

.editor-ok {
  color: #047857;
}

pre {
  max-height: 340px;
  overflow: auto;
  padding: 10px;
  border-radius: 6px;
  color: var(--text-primary);
  background: var(--surface-code-block);
  white-space: pre-wrap;
}

@media (max-width: 1040px) {
  .worldline-editor__layout {
    grid-template-rows: minmax(0, 22vh) minmax(0, 1fr) minmax(0, 30vh);
    grid-template-columns: 1fr;
  }

  .worldline-editor__sidebar {
    height: 100%;
    max-height: none;
  }

  .worldline-editor__review {
    height: 100%;
    max-height: none;
  }

  .worldline-editor__review .editor-summary,
  .worldline-editor__review .editor-preview {
    display: none;
  }

  .worldline-editor__review .editor-section {
    padding: 10px;
  }

  .worldline-editor__review .editor-section > h2 {
    display: none;
  }

  .editor-lane-preview {
    margin: 8px 0;
    padding: 8px;
  }

  .editor-lane-preview__header {
    margin-bottom: 6px;
  }

  .editor-lane-preview__controls {
    margin-bottom: 6px;
  }

  .editor-lane-preview__track {
    height: 124px;
  }

  .editor-lane-preview__event {
    padding: 1px 4px;
  }

  .editor-lane-preview__event span {
    font-size: 10px;
  }
}

@media (max-width: 640px) {
  .worldline-editor {
    padding: 10px 12px 12px;
  }

  .worldline-editor__header,
  .editor-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .editor-grid,
  .editor-grid--dates {
    grid-template-columns: 1fr;
  }

  .editor-date-inputs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
