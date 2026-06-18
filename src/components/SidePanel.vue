<script setup>
const props = defineProps({
  selectedEvent: { type: Object, default: null },
  yearLabel: { type: Function, required: true },
  closePanel: { type: Function, required: true }
});

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

function panelAccentStyle(event) {
  const accent = event?.colorRoles?.panelAccent;
  return accent ? { "--panel-accent": accent } : {};
}
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

      <p id="side-panel-meta" class="meta">
        <span class="event-accent" aria-hidden="true"></span>
        {{ selectedEvent.character }}<br />
        {{ formatEventOccurrence(selectedEvent) }}
      </p>

      <p id="side-panel-detail" class="detail">
        {{ selectedEvent.detail }}
      </p>
    </div>

    <div v-else class="panel-placeholder">
      イベントを選択してください
    </div>
  </aside>
</template>
