<script setup>
import { nextTick, ref, watch } from "vue";
import {
  SOURCE_CLAIM_TARGET_LABELS,
  SOURCE_STATUS_LABELS,
  eventUncertaintySummary,
  sourceKeyForSourceDetail,
  sourceKeyForSourceLabel,
} from "../utils/events.js";

const props = defineProps({
  selectedEvent: { type: Object, default: null },
  detailContext: { type: Object, default: () => ({}) },
  selectedEventHidden: { type: Boolean, default: false },
  yearLabel: { type: Function, required: true },
  closePanel: { type: Function, required: true },
  focusEventLane: { type: Function, required: true },
  compareEventLane: { type: Function, required: true },
  selectSourceFilter: { type: Function, required: true },
  selectRelatedEvent: { type: Function, required: true }
});

const shareStatus = ref("");
const showShareFallback = ref(false);
const showAllSourceDetails = ref(false);
const panelBodyRef = ref(null);
const SOURCE_DETAIL_PREVIEW_LIMIT = 3;

function hasExplicitDay(date) {
  return Number.isInteger(date?.day);
}

function formatDate(date) {
  const prefix = `${props.yearLabel(date.year)}${date.month}月`;
  return hasExplicitDay(date) ? `${prefix}${date.day}日` : prefix;
}

function isSamePoint(start, end) {
  return (
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day
  );
}

function formatContinuousRange(event) {
  if (isSamePoint(event.start, event.end)) {
    return formatDate(event.start);
  }

  return `${formatDate(event.start)}〜${formatDate(event.end)}`;
}

function formatSingleWithinRange(event) {
  const { start, end } = event;
  const startHasDay = hasExplicitDay(start);
  const endHasDay = hasExplicitDay(end);

  if (startHasDay && endHasDay && isSamePoint(start, end)) {
    return formatDate(start);
  }

  if (start.year === end.year && start.month === end.month) {
    if (!startHasDay && !endHasDay) {
      return `${props.yearLabel(start.year)}${start.month}月中のいずれか1日`;
    }

    return `${formatDate(start)}〜${formatDate(end)}のいずれか1日`;
  }

  return `${formatDate(start)}〜${formatDate(end)}の間のいずれか1日`;
}

function formatEventOccurrence(event) {
  if (!event) return "";

  return event.occurrenceType === "singleWithinRange"
    ? formatSingleWithinRange(event)
    : formatContinuousRange(event);
}

function formatOccurrenceType(event) {
  return event?.occurrenceType === "singleWithinRange"
    ? "期間内の1日"
    : "継続期間";
}

function panelAccentStyle(event) {
  const accent = event?.colorRoles?.panelAccent;
  return accent ? { "--panel-accent": accent } : {};
}

function hasListItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function sourceDetailMeta(sourceDetail) {
  const statusLabel = SOURCE_STATUS_LABELS[sourceDetail.status] ?? "";
  const supports = Array.isArray(sourceDetail.supports)
    ? sourceDetail.supports
        .map((target) => SOURCE_CLAIM_TARGET_LABELS[target] ?? target)
        .filter(Boolean)
        .join(" / ")
    : "";

  return [
    sourceDetail.id ? `ID: ${sourceDetail.id}` : "",
    statusLabel,
    supports ? `対象: ${supports}` : "",
    sourceDetail.claim,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
}

function conflictMeta(conflict) {
  return [
    hasListItems(conflict.sources) ? `出典: ${conflict.sources.join(" / ")}` : "",
    conflict.resolution ? `扱い: ${conflict.resolution}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
}

function visibleSourceDetails(sourceDetails) {
  if (showAllSourceDetails.value) {
    return Array.isArray(sourceDetails) ? sourceDetails : [];
  }

  return Array.isArray(sourceDetails)
    ? sourceDetails.slice(0, SOURCE_DETAIL_PREVIEW_LIMIT)
    : [];
}

function sourceDetailsOverflowCount(sourceDetails) {
  return Array.isArray(sourceDetails)
    ? Math.max(0, sourceDetails.length - SOURCE_DETAIL_PREVIEW_LIMIT)
    : 0;
}

function relatedMeta(event) {
  const uncertainty = eventUncertaintySummary(event);
  const uncertaintyLabel = uncertainty.isUncertain ? uncertainty.stateLabel : "";

  return [event.character, formatEventOccurrence(event), uncertaintyLabel]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
}

function selectSourceLabel(source) {
  const key = sourceKeyForSourceLabel(source);
  if (key) props.selectSourceFilter(key);
}

function selectSourceDetail(sourceDetail) {
  const key = sourceKeyForSourceDetail(sourceDetail);
  if (key) props.selectSourceFilter(key);
}

async function copyShareUrl() {
  const url = props.detailContext.shareUrl;
  if (!url) return;

  try {
    if (!globalThis.navigator?.clipboard?.writeText) {
      throw new Error("Clipboard API is unavailable.");
    }
    await globalThis.navigator.clipboard.writeText(url);
    shareStatus.value = "コピーしました";
    showShareFallback.value = false;
  } catch {
    shareStatus.value = "コピーできませんでした。URLを選択して共有してください。";
    showShareFallback.value = true;
  }
}

function selectFallbackUrl(event) {
  event.target?.select?.();
}

watch(
  () => props.selectedEvent?.canonicalId ?? props.selectedEvent?.id,
  () => {
    shareStatus.value = "";
    showShareFallback.value = false;
    showAllSourceDetails.value = false;
    nextTick(() => {
      if (panelBodyRef.value) {
        panelBodyRef.value.scrollTop = 0;
      }
    });
  },
);
</script>

<template>
  <aside
    class="side-panel"
    :class="{ open: selectedEvent }"
    role="dialog"
    aria-modal="false"
    :aria-label="selectedEvent ? 'イベント詳細' : 'イベント詳細パネル'"
    :aria-labelledby="selectedEvent ? 'side-panel-title' : undefined"
    :aria-describedby="selectedEvent ? 'side-panel-meta side-panel-detail' : undefined"
  >
    <div
      v-if="selectedEvent"
      class="panel-content"
      :style="panelAccentStyle(selectedEvent)"
    >
      <div class="panel-header">
        <button
          class="close-btn"
          type="button"
          aria-label="詳細パネルを閉じる"
          title="詳細パネルを閉じる"
          @click="closePanel"
        >×</button>

        <h2 id="side-panel-title">{{ selectedEvent.title }}</h2>

        <div class="panel-actions" aria-label="選択中イベントの操作">
          <button
            class="panel-action"
            type="button"
            @click.stop="focusEventLane(selectedEvent)"
          >
            このレーンに集中
          </button>
          <button
            class="panel-action"
            type="button"
            @click.stop="compareEventLane(selectedEvent)"
          >
            比較に追加
          </button>
          <button
            class="panel-action"
            type="button"
            :disabled="!detailContext.shareUrl"
            @click.stop="copyShareUrl"
          >
            URLをコピー
          </button>
        </div>

        <p v-if="shareStatus" class="share-status">
          {{ shareStatus }}
        </p>

        <input
          v-if="showShareFallback"
          class="share-url-fallback"
          type="text"
          readonly
          :value="detailContext.shareUrl"
          aria-label="共有URL"
          @focus="selectFallbackUrl"
        />
      </div>

      <div ref="panelBodyRef" class="panel-body">
        <dl id="side-panel-meta" class="detail-fields">
        <div class="detail-field">
          <dt>レーン</dt>
          <dd>
            <span class="event-accent" aria-hidden="true"></span>
            {{ selectedEvent.character }}
          </dd>
        </div>
        <div class="detail-field">
          <dt>期間</dt>
          <dd>{{ formatEventOccurrence(selectedEvent) }}</dd>
        </div>
        <div class="detail-field">
          <dt>発生形式</dt>
          <dd>{{ formatOccurrenceType(selectedEvent) }}</dd>
        </div>
        <div class="detail-field">
          <dt>日付確度</dt>
          <dd>
            <span
              class="detail-chip"
              :class="{ 'detail-chip--warning': detailContext.uncertainty?.isUncertain }"
            >{{ detailContext.uncertainty?.stateLabel }}</span>
          </dd>
        </div>
        <div class="detail-field">
          <dt>根拠</dt>
          <dd>
            <span class="detail-chip">
              {{ detailContext.uncertainty?.sourceBasisLabel }}
            </span>
          </dd>
        </div>
        <div class="detail-field">
          <dt>出典状態</dt>
          <dd>
            <span
              class="detail-chip"
              :class="{ 'detail-chip--warning': detailContext.uncertainty?.sourceStatus === 'conflicting' }"
            >{{ detailContext.uncertainty?.sourceStatusLabel }}</span>
          </dd>
        </div>
        <div
          v-if="detailContext.uncertainty?.rangeReasonLabel"
          class="detail-field"
        >
          <dt>範囲理由</dt>
          <dd>
            <span class="detail-chip">
              {{ detailContext.uncertainty.rangeReasonLabel }}
            </span>
          </dd>
        </div>
        <div class="detail-field">
          <dt>世界線</dt>
          <dd>
            <template v-if="hasListItems(detailContext.worldlineLabels)">
              <span
                v-for="worldline in detailContext.worldlineLabels"
                :key="worldline"
                class="detail-chip"
              >{{ worldline }}</span>
            </template>
            <span v-else class="detail-empty">未設定</span>
          </dd>
        </div>
        <div
          v-if="hasListItems(detailContext.participantLabels)"
          class="detail-field"
        >
          <dt>参加者</dt>
          <dd>
            <span
              v-for="participant in detailContext.participantLabels"
              :key="participant"
              class="detail-chip"
            >{{ participant }}</span>
          </dd>
        </div>
        <div class="detail-field">
          <dt>出典</dt>
          <dd>
            <template v-if="hasListItems(detailContext.sources)">
              <button
                v-for="source in detailContext.sources"
                :key="source"
                class="detail-chip detail-chip--source detail-chip--button"
                type="button"
                title="同じ出典で絞り込む"
                @click.stop="selectSourceLabel(source)"
              >{{ source }}</button>
            </template>
            <span v-else class="detail-empty">未設定</span>
          </dd>
        </div>
        </dl>

      <section
        v-if="hasListItems(detailContext.sourceDetails)"
        class="detail-section"
        aria-labelledby="side-panel-source-details-title"
      >
        <h3 id="side-panel-source-details-title">出典詳細</h3>
        <ul class="detail-list">
          <li
            v-for="sourceDetail in visibleSourceDetails(detailContext.sourceDetails)"
            :key="sourceDetail.id ?? sourceDetail.label"
          >
            <button
              class="detail-source-action"
              type="button"
              title="同じ出典で絞り込む"
              @click.stop="selectSourceDetail(sourceDetail)"
            >{{ sourceDetail.label }}</button>
            <span
              v-if="sourceDetailMeta(sourceDetail)"
              class="detail-list__meta"
            >{{ sourceDetailMeta(sourceDetail) }}</span>
          </li>
          <li
            v-if="sourceDetailsOverflowCount(detailContext.sourceDetails)"
            class="related-overflow"
          >
            <button
              class="detail-source-action"
              type="button"
              @click="showAllSourceDetails = !showAllSourceDetails"
            >
              {{ showAllSourceDetails ? "先頭のみ表示" : `ほか ${sourceDetailsOverflowCount(detailContext.sourceDetails)} 件を表示` }}
            </button>
          </li>
        </ul>
      </section>

      <section
        v-if="hasListItems(detailContext.conflicts)"
        class="detail-section detail-section--warning"
        aria-labelledby="side-panel-conflicts-title"
      >
        <h3 id="side-panel-conflicts-title">出典矛盾</h3>
        <ul class="detail-list">
          <li
            v-for="conflict in detailContext.conflicts"
            :key="conflict.summary"
          >
            <span>{{ conflict.summary }}</span>
            <span
              v-if="conflictMeta(conflict)"
              class="detail-list__meta"
            >{{ conflictMeta(conflict) }}</span>
          </li>
        </ul>
      </section>

      <p v-if="selectedEventHidden" class="panel-status">
        現在の表示条件では非表示です。
      </p>

      <p id="side-panel-detail" class="detail">
        {{ selectedEvent.detail }}
      </p>

      <section
        v-if="hasListItems(detailContext.notes)"
        class="detail-section"
        aria-labelledby="side-panel-notes-title"
      >
        <h3 id="side-panel-notes-title">注記</h3>
        <ul class="detail-list">
          <li v-for="note in detailContext.notes" :key="note">{{ note }}</li>
        </ul>
      </section>

      <section
        v-if="hasListItems(detailContext.relatedSections)"
        class="detail-section"
        aria-labelledby="side-panel-related-title"
      >
        <h3 id="side-panel-related-title">関連コンテキスト</h3>
        <div
          v-for="section in detailContext.relatedSections"
          :key="section.id"
          class="related-section"
        >
          <h4>{{ section.title }}</h4>
          <p>{{ section.description }}</p>
          <ul class="related-list">
            <li
              v-for="event in section.items"
              :key="event.instanceId ?? event.id"
            >
              <button
                class="related-event"
                type="button"
                @click.stop="selectRelatedEvent(event)"
              >
                <span class="related-event__title">{{ event.title }}</span>
                <span class="related-event__meta">{{ relatedMeta(event) }}</span>
              </button>
            </li>
          </ul>
          <p v-if="section.overflowCount" class="related-overflow">
            ほか {{ section.overflowCount }} 件
          </p>
        </div>
      </section>
      </div>
    </div>

    <div v-else class="panel-placeholder">
      イベントを選択してください
    </div>
  </aside>
</template>
