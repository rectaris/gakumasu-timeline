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
          @click="zoomOutHorizontal"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          @click="resetHorizontalZoom"
        >
          全体
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInHorizontal"
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
          @click="zoomOutVertical"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          @click="resetVerticalZoom"
        >
          100%
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInVertical"
          @click="zoomInVertical"
        >
          +
        </button>
        <span class="zoom-status">{{ verticalZoomLabel }}</span>
      </div>
    </div>

    <p class="zoom-panel-note">
      表示期間とレーン密度は、右上の操作ボタンから調整できます。
    </p>

    <div v-if="showHints" class="zoom-hints">
      <p class="zoom-hint">ドラッグ: 上下左右に移動</p>
      <p class="zoom-hint">ホイール: 表示期間を拡大・縮小</p>
      <p class="zoom-hint">Ctrl + ホイール: レーン密度を調整</p>
      <p class="zoom-hint">横方向ホイール: 左右に移動</p>
      <p class="timeline-scale-note">日付は各月31日換算の抽象時系列です。</p>
    </div>
  </div>
</template>
