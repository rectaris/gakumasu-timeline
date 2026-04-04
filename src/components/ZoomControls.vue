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
  <div class="zoom-panel" role="region" aria-label="ズーム操作エリア">
    <div class="zoom-controls" role="group" aria-label="タイムラインの表示調整">
      <div class="zoom-group" role="group" aria-labelledby="horizontal-zoom-label">
        <span id="horizontal-zoom-label" class="zoom-group-label">表示期間（横軸）</span>
        <button
          class="zoom-button zoom-button--out"
          type="button"
          :disabled="!canZoomOutHorizontal"
          aria-label="横軸の表示期間を広げる"
          title="横軸の表示期間を広げる"
          @click="zoomOutHorizontal"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          aria-label="横軸の表示期間を全体表示に戻す"
          title="横軸の表示期間を全体表示に戻す"
          @click="resetHorizontalZoom"
        >
          全体
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInHorizontal"
          aria-label="横軸の表示期間を絞る"
          title="横軸の表示期間を絞る"
          @click="zoomInHorizontal"
        >
          +
        </button>
        <span class="zoom-status">{{ horizontalZoomLabel }}</span>
      </div>

      <div class="zoom-group" role="group" aria-labelledby="vertical-zoom-label">
        <span id="vertical-zoom-label" class="zoom-group-label">レーン密度（縦軸）</span>
        <button
          class="zoom-button zoom-button--out"
          type="button"
          :disabled="!canZoomOutVertical"
          aria-label="縦軸のレーン密度を下げる"
          title="縦軸のレーン密度を下げる"
          @click="zoomOutVertical"
        >
          -
        </button>
        <button
          class="zoom-button zoom-button--reset"
          type="button"
          aria-label="縦軸のレーン密度を標準に戻す"
          title="縦軸のレーン密度を標準に戻す"
          @click="resetVerticalZoom"
        >
          100%
        </button>
        <button
          class="zoom-button zoom-button--in"
          type="button"
          :disabled="!canZoomInVertical"
          aria-label="縦軸のレーン密度を上げる"
          title="縦軸のレーン密度を上げる"
          @click="zoomInVertical"
        >
          +
        </button>
        <span class="zoom-status">{{ verticalZoomLabel }}</span>
      </div>
    </div>

    <div v-if="showHints" class="zoom-hints" role="list" aria-label="操作ヒント">
      <p class="zoom-hint" role="listitem">ドラッグ: 上下左右に移動</p>
      <p class="zoom-hint" role="listitem">ホイール: 横軸の表示期間を拡大・縮小</p>
      <p class="zoom-hint" role="listitem">Ctrl + ホイール: 縦軸のレーン密度を調整</p>
      <p class="zoom-hint" role="listitem">横方向ホイール: 左右に移動</p>
      <p class="timeline-scale-note" role="listitem">日付は実カレンダーの日数差ではなく、前後関係を見やすくするために各月を31日換算で並べた抽象時系列です。</p>
    </div>
  </div>
</template>
