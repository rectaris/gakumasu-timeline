<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  selectedEvent: { type: Object, default: null },
  detailContext: { type: Object, default: () => ({}) },
  selectedEventHidden: { type: Boolean, default: false },
  yearLabel: { type: Function, required: true },
  closePanel: { type: Function, required: true },
  focusEventLane: { type: Function, required: true },
  selectRelatedEvent: { type: Function, required: true }
});

const shareStatus = ref("");
const showShareFallback = ref(false);

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
    ? "不確定（期間内のいずれか1日）"
    : "継続期間";
}

function panelAccentStyle(event) {
  const accent = event?.colorRoles?.panelAccent;
  return accent ? { "--panel-accent": accent } : {};
}

function hasListItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function relatedMeta(event) {
  return [event.character, formatEventOccurrence(event)]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
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
      <button
        class="close-btn"
        type="button"
        aria-label="詳細パネルを閉じる"
        title="詳細パネルを閉じる"
        @click="closePanel"
      >×</button>

      <h2 id="side-panel-title">{{ selectedEvent.title }}</h2>

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
              <span
                v-for="source in detailContext.sources"
                :key="source"
                class="detail-chip detail-chip--source"
              >{{ source }}</span>
            </template>
            <span v-else class="detail-empty">未設定</span>
          </dd>
        </div>
      </dl>

      <p v-if="selectedEventHidden" class="panel-status">
        現在の検索・絞り込み条件では非表示です。
      </p>

      <div class="panel-actions">
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

    <div v-else class="panel-placeholder">
      イベントを選択してください
    </div>
  </aside>
</template>
