<script setup>
defineProps({
  horizontalZoomLabel: { type: String, required: true },
  verticalZoomLabel: { type: String, required: true },
  canZoomInHorizontal: { type: Boolean, required: true },
  canZoomOutHorizontal: { type: Boolean, required: true },
  canZoomInVertical: { type: Boolean, required: true },
  canZoomOutVertical: { type: Boolean, required: true },
  zoomInHorizontal: { type: Function, required: true },
  zoomOutHorizontal: { type: Function, required: true },
  resetHorizontalZoom: { type: Function, required: true },
  zoomInVertical: { type: Function, required: true },
  zoomOutVertical: { type: Function, required: true },
  resetVerticalZoom: { type: Function, required: true },
  showHints: { type: Boolean, required: true }
});
</script>

<template>
  <div class="zoom-panel">
    <div class="zoom-controls">
      <div class="zoom-group">
        <span class="zoom-group-label">表示期間</span>
        <button
          class="zoom-button zoom-button--out"
          type="button"
          :disabled="!canZoomOutHorizontal"
          aria-label="表示期間を広げる"
          title="表示期間を広げる"
          @click="zoomOutHorizontal"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          aria-label="表示期間を全体表示に戻す"
          title="表示期間を全体表示に戻す"
          @click="resetHorizontalZoom"
        >
          全体
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInHorizontal"
          aria-label="表示期間を絞る"
          title="表示期間を絞る"
          @click="zoomInHorizontal"
        >
          +
        </button>
        <span class="zoom-status">{{ horizontalZoomLabel }}</span>
      </div>

      <div class="zoom-group">
        <span class="zoom-group-label">レーン密度</span>
        <button
          class="zoom-button zoom-button--out"
          type="button"
          :disabled="!canZoomOutVertical"
          aria-label="レーン密度を下げる"
          title="レーン密度を下げる"
          @click="zoomOutVertical"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          aria-label="レーン密度を標準に戻す"
          title="レーン密度を標準に戻す"
          @click="resetVerticalZoom"
        >
          100%
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInVertical"
          aria-label="レーン密度を上げる"
          title="レーン密度を上げる"
          @click="zoomInVertical"
        >
          +
        </button>
        <span class="zoom-status">{{ verticalZoomLabel }}</span>
      </div>
    </div>

    <div v-if="showHints" class="zoom-hints">
      <p class="zoom-hint">ドラッグ: 上下左右に移動</p>
      <p class="zoom-hint">ホイール: 表示期間を拡大・縮小</p>
      <p class="zoom-hint">Ctrl + ホイール: レーン密度を調整</p>
      <p class="zoom-hint">横方向ホイール: 左右に移動</p>
      <p class="timeline-scale-note">日付は各月31日換算の抽象時系列です。</p>
    </div>
  </div>
</template>
