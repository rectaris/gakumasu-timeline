<script setup>
const props = defineProps({
  selectedEvent: { type: Object, default: null },
  yearLabel: { type: Function, required: true },
  closePanel: { type: Function, required: true }
});
</script>

<template>
  <aside class="side-panel" :class="{ open: selectedEvent }">
    <div v-if="selectedEvent" class="panel-content">
      <button class="close-btn" @click="closePanel">×</button>

      <h2>{{ selectedEvent.title }}</h2>

      <p class="meta">
        {{ selectedEvent.character }}<br />
        {{ yearLabel(selectedEvent.start.year) }}
        {{ selectedEvent.start.month }}月
        {{ selectedEvent.start.day ?? 1 }}日
        <template
          v-if="
            selectedEvent.start.year !== selectedEvent.end.year ||
            selectedEvent.start.month !== selectedEvent.end.month ||
            (selectedEvent.start.day ?? 1) !== (selectedEvent.end.day ?? 1)
          "
        >
          〜
          {{ yearLabel(selectedEvent.end.year) }}
          {{ selectedEvent.end.month }}月
          {{ selectedEvent.end.day ?? 1 }}日
        </template>
      </p>

      <p class="detail">
        {{ selectedEvent.detail }}
      </p>
    </div>

    <div v-else class="panel-placeholder">
      イベントを選択してください
    </div>
  </aside>
</template>
