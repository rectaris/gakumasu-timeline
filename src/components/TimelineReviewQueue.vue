<script setup>
import { nextTick, ref } from "vue";
import {
  TimelineAuthoringError,
  decideTimelineRequest,
  listTimelineReviewQueue,
} from "../auth/timelineAuthoring";

const open = ref(false);
const panel = ref(null);
const loading = ref(false);
const state = ref("ready");
const message = ref("");
const requests = ref([]);
const notes = ref({});

async function loadQueue() {
  loading.value = true;
  state.value = "loading";
  message.value = "審査待ちの投稿を読み込んでいます。";
  try {
    const payload = await listTimelineReviewQueue();
    requests.value = payload.requests;
    state.value = payload.requests.length ? "submitted" : "ready";
    message.value = payload.requests.length
      ? `${payload.requests.length}件の審査待ちがあります。`
      : "審査待ちの投稿はありません。";
  } catch (error) {
    state.value =
      error instanceof TimelineAuthoringError && error.status === 403
        ? "forbidden"
        : "unavailable";
    message.value =
      state.value === "forbidden"
        ? "審査権限がありません。"
        : "審査待ちを取得できませんでした。";
  } finally {
    loading.value = false;
  }
}

async function showPanel() {
  open.value = true;
  await nextTick();
  panel.value?.focus();
  await loadQueue();
}

function closePanel() {
  open.value = false;
}

async function decide(item, decision) {
  state.value = "loading";
  message.value = "審査結果を保存しています。";
  try {
    await decideTimelineRequest(
      item.id,
      decision,
      item.version,
      notes.value[item.id] ?? "",
    );
    item.status = decision;
    state.value = decision;
    message.value = decision === "approved"
      ? "承認しました。Gitへの反映後に公開されます。"
      : "却下しました。";
  } catch (error) {
    state.value =
      error instanceof TimelineAuthoringError && error.status === 409
        ? "conflict"
        : error instanceof TimelineAuthoringError && error.status === 403
          ? "forbidden"
          : "unavailable";
    message.value = state.value === "conflict"
      ? "別の審査で状態が更新されました。再読み込みしてください。"
      : "審査結果を保存できませんでした。";
  }
}
</script>

<template>
  <button
    class="review-launcher"
    type="button"
    data-authoring-control="review"
    @click="showPanel"
  >審査</button>
  <section
    v-if="open"
    ref="panel"
    class="review-panel"
    role="dialog"
    aria-modal="false"
    aria-labelledby="timeline-review-title"
    tabindex="-1"
    :data-authoring-state="state"
    @keydown.esc.prevent="closePanel"
  >
    <header>
      <div>
        <p>公開前の確認キュー</p>
        <h2 id="timeline-review-title">タイムライン投稿の審査</h2>
      </div>
      <button type="button" aria-label="審査画面を閉じる" @click="closePanel">×</button>
    </header>
    <p class="review-message" aria-live="polite">{{ message }}</p>
    <p v-if="loading">読み込み中…</p>
    <div class="review-list">
      <article v-for="item in requests" :key="item.id" :data-request-status="item.status">
        <div>
          <span>{{ item.targetLaneId }}</span>
          <h3>{{ item.event.title }}</h3>
          <p>{{ item.event.detail }}</p>
          <pre>{{ JSON.stringify(item.event, null, 2) }}</pre>
        </div>
        <template v-if="item.status === 'submitted'">
          <label>
            審査メモ
            <textarea v-model="notes[item.id]" rows="2" maxlength="4000"></textarea>
          </label>
          <div class="review-actions">
            <button type="button" @click="decide(item, 'rejected')">却下</button>
            <button class="review-approve" type="button" @click="decide(item, 'approved')">承認</button>
          </div>
        </template>
        <strong v-else>{{ item.status === "approved" ? "承認済み" : "却下済み" }}</strong>
      </article>
    </div>
  </section>
</template>

<style scoped>
.review-launcher { position: fixed; right: 158px; bottom: 18px; z-index: 1270; min-height: 40px; padding: 0 16px; border: 1px solid var(--border-strong); border-radius: 999px; background: var(--button-bg); color: var(--button-text); font: inherit; font-weight: 700; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18); cursor: pointer; }
.review-panel { position: fixed; inset: max(72px, 8vh) 18px 18px auto; z-index: 1300; width: min(620px, calc(100vw - 36px)); overflow: auto; box-sizing: border-box; padding: 18px; border: 1px solid var(--border-strong); border-radius: 14px; background: var(--surface); color: var(--text-primary); box-shadow: 0 18px 60px rgba(15, 23, 42, 0.28); }
.review-panel:focus-visible,
.review-panel button:focus-visible,
.review-panel textarea:focus-visible { outline: 2px solid var(--timeline-focus-stroke); outline-offset: 2px; }
.review-panel header { display: flex; justify-content: space-between; gap: 16px; }
.review-panel header p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.review-panel h2 { margin: 2px 0 0; font-size: 20px; }
.review-panel header button { border: 0; background: transparent; color: inherit; font-size: 28px; cursor: pointer; }
.review-message { padding: 10px; border-radius: 8px; background: var(--surface-soft); font-size: 13px; }
.review-list { display: grid; gap: 12px; }
.review-list article { padding: 12px; border: 1px solid var(--border-strong); border-radius: 10px; }
.review-list h3 { margin: 4px 0; }
.review-list p { line-height: 1.55; }
.review-list pre { max-height: 220px; overflow: auto; padding: 10px; border-radius: 7px; background: var(--surface-soft); font-size: 11px; white-space: pre-wrap; }
.review-list label { display: grid; gap: 5px; font-size: 13px; font-weight: 700; }
.review-list textarea { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid var(--border-strong); border-radius: 7px; background: var(--surface); color: var(--text-primary); font: inherit; }
.review-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.review-actions button { min-height: 36px; padding: 0 14px; border: 1px solid var(--border-strong); border-radius: 7px; background: var(--button-bg); color: var(--button-text); font: inherit; cursor: pointer; }
.review-actions .review-approve { border-color: transparent; background: var(--accent-color, #2563eb); color: #fff; }
@media (max-width: 600px) {
  .review-launcher { right: 150px; bottom: 10px; }
  .review-panel { inset: var(--app-header-height) 0 0; width: 100vw; border-radius: 0; border-width: 1px 0 0; }
}
</style>
