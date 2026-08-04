<script setup>
import { TIMELINE_MODE_OPTIONS } from "../utils/timelineModeUrl";
import { useTimelineMode } from "../composables/useTimelineMode";

const { mode, navigateToMode } = useTimelineMode();
let interactionMethod = "unknown";

function handleChange(event) {
  navigateToMode(event.target.value, {
    focusPage: interactionMethod === "keyboard",
  });
  interactionMethod = "unknown";
}
</script>

<template>
  <label class="mode-switcher">
    <span class="mode-switcher__label">表示</span>
    <select
      class="mode-switcher__select"
      :value="mode"
      aria-label="表示するタイムライン"
      @keydown="interactionMethod = 'keyboard'"
      @pointerdown="interactionMethod = 'pointer'"
      @change="handleChange"
    >
      <option
        v-for="option in TIMELINE_MODE_OPTIONS"
        :key="option.id"
        :value="option.id"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.mode-switcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.mode-switcher__label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
}

.mode-switcher__select {
  height: var(--header-control-size);
  box-sizing: border-box;
  max-width: 148px;
  padding: 0 28px 0 9px;
  border: 1px solid var(--border-strong);
  border-radius: var(--header-control-radius);
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 520px) {
  .mode-switcher__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  .mode-switcher__select {
    max-width: 124px;
    font-size: 12px;
  }
}
</style>
