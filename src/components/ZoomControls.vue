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
  resetVerticalZoom: { type: Function, required: true }
});
</script>

<template>
  <div class="zoom-controls">
    <div class="zoom-group">
      <span class="zoom-group-label">H</span>
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
        Fit
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
      <span class="zoom-group-label">V</span>
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

  <div class="zoom-hints">
    <p class="zoom-hint">Wheel: pan horizontally</p>
    <p class="zoom-hint">Ctrl / Cmd / Alt + Wheel: zoom horizontally</p>
    <p class="timeline-scale-note">Dates use an abstract 31-day month scale.</p>
  </div>
</template>
