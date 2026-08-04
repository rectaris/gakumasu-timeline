<script setup>
import { computed } from "vue";

const props = defineProps({
  horizontalZoomLabel: { type: String, required: true },
  verticalZoomLabel: { type: String, required: true },
  viewportRatio: { type: Object, required: true },
  selectedEventRatio: { type: Object, default: null },
  horizontalPresetOptions: { type: Array, required: true },
  canZoomInHorizontal: { type: Boolean, required: true },
  canZoomOutHorizontal: { type: Boolean, required: true },
  canZoomInVertical: { type: Boolean, required: true },
  canZoomOutVertical: { type: Boolean, required: true },
  canReturnToSelectedEvent: { type: Boolean, required: true },
  zoomInHorizontal: { type: Function, required: true },
  zoomOutHorizontal: { type: Function, required: true },
  resetHorizontalZoom: { type: Function, required: true },
  setViewportCenterByRatio: { type: Function, required: true },
  zoomToPreset: { type: Function, required: true },
  returnToSelectedEvent: { type: Function, required: true },
  zoomInVertical: { type: Function, required: true },
  zoomOutVertical: { type: Function, required: true },
  resetVerticalZoom: { type: Function, required: true },
  showHints: { type: Boolean, required: true }
});

function percent(value) {
  return `${Math.round(value * 1000) / 10}%`;
}

function rangeStyle(range, minimumWidth = "2px") {
  const width = Math.max(0, range.end - range.start);

  return {
    left: percent(range.start),
    width: `max(${minimumWidth}, ${percent(width)})`,
  };
}

const currentRangeStyle = computed(() => rangeStyle(props.viewportRatio, "6px"));

const selectedRangeStyle = computed(() =>
  props.selectedEventRatio ? rangeStyle(props.selectedEventRatio) : null,
);

const presetButtons = computed(() =>
  props.horizontalPresetOptions.filter((option) => option.id !== "overview"),
);

const rangeOverviewLabel = computed(
  () =>
    `全体期間内の現在位置 ${percent(props.viewportRatio.start)} から ${percent(
      props.viewportRatio.end,
    )}`,
);

function rangeRatioFromPointer(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width) return props.viewportRatio.center;

  return (event.clientX - rect.left) / rect.width;
}

function setRangeOverviewCenter(event) {
  props.setViewportCenterByRatio(rangeRatioFromPointer(event));
}

function nudgeRangeOverview(delta) {
  props.setViewportCenterByRatio(props.viewportRatio.center + delta);
}

function moveRangeOverviewToStart() {
  props.setViewportCenterByRatio(0);
}

function moveRangeOverviewToEnd() {
  props.setViewportCenterByRatio(1);
}
</script>

<template>
  <div class="zoom-panel" role="region" aria-label="ズーム操作エリア">
    <div class="zoom-controls" role="group" aria-label="タイムラインの表示調整">
      <div class="zoom-group" role="group" aria-labelledby="horizontal-zoom-label">
        <span id="horizontal-zoom-label" class="zoom-group-label">期間</span>
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

      <div class="zoom-range-group" role="group" aria-label="表示位置">
        <button
          class="range-overview"
          type="button"
          :aria-label="rangeOverviewLabel"
          title="全体期間の位置へ移動"
          @click="setRangeOverviewCenter"
          @keydown.left.prevent="nudgeRangeOverview(-0.05)"
          @keydown.right.prevent="nudgeRangeOverview(0.05)"
          @keydown.home.prevent="moveRangeOverviewToStart"
          @keydown.end.prevent="moveRangeOverviewToEnd"
        >
          <span class="range-overview__track" aria-hidden="true">
            <span
              v-if="selectedRangeStyle"
              class="range-overview__selected"
              :style="selectedRangeStyle"
            ></span>
            <span
              class="range-overview__current"
              :style="currentRangeStyle"
            ></span>
          </span>
        </button>
      </div>

      <div class="zoom-group zoom-group--presets" role="group" aria-label="期間プリセット">
        <span class="zoom-group-label">表示</span>
        <button
          v-for="preset in presetButtons"
          :key="preset.id"
          class="zoom-button zoom-button--preset"
          type="button"
          :aria-label="`${preset.label}表示に切り替える`"
          :title="`${preset.label}表示に切り替える`"
          @click="zoomToPreset(preset.id)"
        >
          {{ preset.label }}
        </button>
        <button
          class="zoom-button zoom-button--return"
          type="button"
          :disabled="!canReturnToSelectedEvent"
          aria-label="選択中イベントへ戻る"
          title="選択中イベントへ戻る"
          @click="returnToSelectedEvent"
        >
          戻る
        </button>
      </div>

      <div class="zoom-group" role="group" aria-labelledby="vertical-zoom-label">
        <span id="vertical-zoom-label" class="zoom-group-label">密度</span>
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
      <p class="zoom-hint" role="listitem">ドラッグ: 移動</p>
      <p class="zoom-hint" role="listitem">ホイール: 期間 / Ctrl + ホイール: 密度</p>
    </div>
  </div>
</template>
