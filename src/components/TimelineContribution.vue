<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import {
  TimelineAuthoringError,
  listOwnTimelineRequests,
  submitTimelineContribution,
} from "../auth/timelineAuthoring";

const props = defineProps({
  lanes: { type: Array, required: true },
});

const open = ref(false);
const panel = ref(null);
const loading = ref(true);
const submitting = ref(false);
const state = ref("loading");
const message = ref("投稿履歴を確認しています。 ");
const requests = ref([]);
const targetLaneId = ref(props.lanes[0]?.id ?? "");
const eventId = ref("");
const title = ref("");
const detail = ref("");
const occurrenceType = ref("singleWithinRange");
const startYear = ref(1);
const startMonth = ref(4);
const startDay = ref(1);
const endYear = ref(1);
const endMonth = ref(4);
const endDay = ref(1);
const sourceText = ref("");

const selectedLane = computed(() =>
  props.lanes.find((lane) => lane.id === targetLaneId.value),
);

function stateFromError(error) {
  if (!(error instanceof TimelineAuthoringError)) return "unavailable";
  if (error.status === 403) return "forbidden";
  if (error.status === 409) return "conflict";
  return error.status >= 500 ? "unavailable" : "invalid";
}

async function loadRequests() {
  loading.value = true;
  state.value = "loading";
  message.value = "投稿履歴を確認しています。";
  try {
    const payload = await listOwnTimelineRequests();
    requests.value = payload.requests;
    state.value = payload.requests[0]?.status ?? "ready";
    message.value = payload.requests.length
      ? "投稿履歴を更新しました。"
      : "まだ投稿はありません。";
  } catch (error) {
    state.value = stateFromError(error);
    message.value =
      state.value === "forbidden"
        ? "投稿権限がありません。"
        : "投稿履歴を取得できませんでした。";
  } finally {
    loading.value = false;
  }
}

async function showPanel() {
  open.value = true;
  await nextTick();
  panel.value?.focus();
}

function closePanel() {
  open.value = false;
}

function resetForm() {
  eventId.value = "";
  title.value = "";
  detail.value = "";
  sourceText.value = "";
}

async function submit() {
  submitting.value = true;
  state.value = "loading";
  message.value = "投稿を送信しています。";
  const participants =
    selectedLane.value?.category === "idolCommu" ? [targetLaneId.value] : [];
  const source = sourceText.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  try {
    await submitTimelineContribution({
      targetLaneId: targetLaneId.value,
      event: {
        id: eventId.value.trim(),
        start: {
          year: Number(startYear.value),
          month: Number(startMonth.value),
          day: Number(startDay.value),
        },
        end: {
          year: Number(endYear.value),
          month: Number(endMonth.value),
          day: Number(endDay.value),
        },
        title: title.value.trim(),
        detail: detail.value.trim(),
        occurrenceType: occurrenceType.value,
        ...(participants.length ? { participants } : {}),
        ...(source.length ? { source, sourceStatus: "unreviewed" } : {}),
      },
    });
    state.value = "submitted";
    message.value = "投稿を受け付けました。公開には審査とGitへの反映が必要です。";
    resetForm();
    await loadRequests();
    state.value = "submitted";
    message.value = "投稿を受け付けました。公開には審査とGitへの反映が必要です。";
  } catch (error) {
    state.value = stateFromError(error);
    message.value =
      state.value === "conflict"
        ? "投稿状態が更新されました。履歴を再読み込みしてください。"
        : state.value === "forbidden"
          ? "投稿権限がありません。"
          : error instanceof TimelineAuthoringError && error.status === 422
            ? "入力内容がタイムラインのデータ規則を満たしていません。"
            : "投稿を送信できませんでした。";
  } finally {
    submitting.value = false;
  }
}

onMounted(loadRequests);
</script>

<template>
  <button
    class="authoring-launcher"
    type="button"
    data-authoring-control="contribution"
    @click="showPanel"
  >イベントを投稿</button>

  <section
    v-if="open"
    ref="panel"
    class="authoring-panel"
    role="dialog"
    aria-modal="false"
    aria-labelledby="timeline-contribution-title"
    tabindex="-1"
    :data-authoring-state="state"
    @keydown.esc.prevent="closePanel"
  >
    <header class="authoring-panel__header">
      <div>
        <p class="authoring-panel__eyebrow">Git反映前の追加申請</p>
        <h2 id="timeline-contribution-title">タイムラインへ投稿</h2>
      </div>
      <button type="button" aria-label="投稿画面を閉じる" @click="closePanel">×</button>
    </header>

    <p class="authoring-panel__boundary">
      承認だけでは公開されません。確認済みの申請をリポジトリへ反映し、データ検証を通した後に公開します。
    </p>

    <form class="authoring-form" @submit.prevent="submit">
      <label>
        追加先
        <select v-model="targetLaneId" required>
          <option v-for="lane in lanes" :key="lane.id" :value="lane.id">
            {{ lane.name }}
          </option>
        </select>
      </label>
      <label>
        イベントID
        <input v-model="eventId" required maxlength="128" autocomplete="off">
      </label>
      <label>
        タイトル
        <input v-model="title" required maxlength="200" autocomplete="off">
      </label>
      <label class="authoring-form__wide">
        詳細
        <textarea v-model="detail" required maxlength="4000" rows="3"></textarea>
      </label>
      <label>
        日付の表現
        <select v-model="occurrenceType">
          <option value="singleWithinRange">期間内の1日</option>
          <option value="continuous">期間</option>
        </select>
      </label>
      <fieldset class="authoring-date">
        <legend>開始</legend>
        <input v-model.number="startYear" type="number" aria-label="開始年" required>
        <input v-model.number="startMonth" type="number" min="1" max="12" aria-label="開始月" required>
        <input v-model.number="startDay" type="number" min="1" max="31" aria-label="開始日" required>
      </fieldset>
      <fieldset class="authoring-date">
        <legend>終了</legend>
        <input v-model.number="endYear" type="number" aria-label="終了年" required>
        <input v-model.number="endMonth" type="number" min="1" max="12" aria-label="終了月" required>
        <input v-model.number="endDay" type="number" min="1" max="31" aria-label="終了日" required>
      </fieldset>
      <label class="authoring-form__wide">
        出典（1行に1件）
        <textarea v-model="sourceText" maxlength="4000" rows="3"></textarea>
      </label>
      <button class="authoring-primary" type="submit" :disabled="submitting">
        {{ submitting ? "送信中…" : "審査へ送る" }}
      </button>
    </form>

    <p class="authoring-message" aria-live="polite">{{ message }}</p>
    <div class="authoring-history" aria-label="自分の投稿履歴">
      <p v-if="loading">読み込み中…</p>
      <article v-for="item in requests" :key="item.id" :data-request-status="item.status">
        <strong>{{ item.event.title }}</strong>
        <span>{{ { submitted: "審査待ち", approved: "承認済み", rejected: "却下" }[item.status] }}</span>
      </article>
    </div>
  </section>
</template>

<style scoped>
.authoring-launcher {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 1270;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  cursor: pointer;
}
.authoring-panel {
  position: fixed;
  inset: max(72px, 8vh) 18px 18px auto;
  z-index: 1300;
  width: min(560px, calc(100vw - 36px));
  overflow: auto;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  background: var(--surface);
  color: var(--text-primary);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.28);
}
.authoring-panel:focus-visible,
.authoring-panel button:focus-visible,
.authoring-panel input:focus-visible,
.authoring-panel select:focus-visible,
.authoring-panel textarea:focus-visible {
  outline: 2px solid var(--timeline-focus-stroke);
  outline-offset: 2px;
}
.authoring-panel__header { display: flex; align-items: start; justify-content: space-between; gap: 16px; }
.authoring-panel__header h2 { margin: 2px 0 0; font-size: 20px; }
.authoring-panel__header button { border: 0; background: transparent; color: inherit; font-size: 28px; cursor: pointer; }
.authoring-panel__eyebrow { margin: 0; color: var(--text-secondary); font-size: 12px; }
.authoring-panel__boundary { padding: 10px 12px; border-radius: 8px; background: var(--surface-soft); font-size: 13px; line-height: 1.6; }
.authoring-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.authoring-form label { display: grid; gap: 5px; font-size: 13px; font-weight: 700; }
.authoring-form input,
.authoring-form select,
.authoring-form textarea { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid var(--border-strong); border-radius: 7px; background: var(--surface); color: var(--text-primary); font: inherit; }
.authoring-form__wide { grid-column: 1 / -1; }
.authoring-date { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 0; padding: 8px; border: 1px solid var(--border-strong); border-radius: 7px; }
.authoring-date legend { padding: 0 4px; font-size: 12px; font-weight: 700; }
.authoring-primary { min-height: 40px; border: 0; border-radius: 8px; background: var(--accent-color, #2563eb); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
.authoring-primary:disabled { opacity: 0.65; cursor: wait; }
.authoring-message { margin: 14px 0 8px; font-size: 13px; }
.authoring-history { display: grid; gap: 6px; }
.authoring-history article { display: flex; justify-content: space-between; gap: 12px; padding: 9px; border: 1px solid var(--border-soft); border-radius: 7px; font-size: 13px; }
@media (max-width: 600px) {
  .authoring-launcher { top: calc(var(--app-header-height) + 10px); right: 10px; bottom: auto; }
  .authoring-panel { inset: var(--app-header-height) 0 0; width: 100vw; border-radius: 0; border-width: 1px 0 0; }
  .authoring-form { grid-template-columns: 1fr; }
  .authoring-form__wide { grid-column: auto; }
}
</style>
