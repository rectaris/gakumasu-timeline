import { computed, reactive, ref, watch } from "vue";
import {
  backgroundFromTextColor,
  normalizeHexColor
} from "../utils/colors";
import { timeValue } from "../utils/time";

const CATEGORY_OPTIONS = [
  { id: "idol", label: "アイドルコミュ" },
  { id: "hatsuboshi", label: "初星コミュ" },
  { id: "event", label: "イベントコミュ" },
  { id: "support", label: "サポートカードコミュ" }
];

const FALLBACK_COLORS = ["#7a7a7a", "#4d7ea8", "#a26ea1", "#c2854b"];

function normalizeLaneColor(lane, index) {
  const normalized = normalizeHexColor(lane.color);
  return normalized || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function normalizeLaneLabel(lane) {
  return lane.name || lane.title || lane.label || lane.id || "(名称未設定)";
}

function normalizeEvent(event, laneMeta, category) {
  if (!event?.start?.year || !event?.start?.month) {
    console.warn("Invalid event start date", { event, laneMeta, category });
    return null;
  }
  if (!event?.end?.year || !event?.end?.month) {
    console.warn("Invalid event end date", { event, laneMeta, category });
    return null;
  }

  return {
    ...event,
    id: event.id || `${laneMeta.key}_event_${event.title || "unknown"}`,
    category,
    laneKey: laneMeta.key,
    laneLabel: laneMeta.label,
    time: timeValue(event.start.year, event.start.month),
    title: event.title || "(無題)",
    detail: event.detail
  };
}

function normalizeLanes(category, lanes) {
  return lanes.map((lane, index) => {
    const laneId = lane.id || `${category}_${index}`;
    const laneLabel = normalizeLaneLabel(lane);
    const laneColor = normalizeLaneColor(lane, index);
    const events = Array.isArray(lane.events)
      ? lane.events
          .map(event =>
            normalizeEvent(event, { key: laneId, label: laneLabel }, category)
          )
          .filter(Boolean)
      : [];

    return {
      ...lane,
      id: laneId,
      name: laneLabel,
      color: laneColor,
      textColor: laneColor,
      labelBgColor: backgroundFromTextColor(laneColor),
      events
    };
  });
}

export function useCategoryFilter({
  idolCommu,
  hatsuboshiCommus,
  eventCommus,
  supportCardCommus
}) {
  const selectedCategory = ref("idol");
  const selectedLaneKeys = reactive({
    idol: [],
    hatsuboshi: [],
    event: [],
    support: []
  });

  const lanesByCategory = computed(() => ({
    idol: normalizeLanes("idol", idolCommu.value || []),
    hatsuboshi: normalizeLanes("hatsuboshi", hatsuboshiCommus.value || []),
    event: normalizeLanes("event", eventCommus.value || []),
    support: normalizeLanes("support", supportCardCommus.value || [])
  }));

  watch(
    lanesByCategory,
    value => {
      CATEGORY_OPTIONS.forEach(option => {
        const lanes = value[option.id] || [];
        if (lanes.length === 0) {
          selectedLaneKeys[option.id] = [];
          return;
        }
        if (selectedLaneKeys[option.id].length === 0) {
          selectedLaneKeys[option.id] = [];
        }
      });
    },
    { immediate: true }
  );

  const laneOptions = computed(() => {
    const lanes = lanesByCategory.value[selectedCategory.value] || [];
    return lanes.map(lane => ({
      key: lane.id,
      label: lane.name
    }));
  });

  const allSelected = computed(() => {
    const category = selectedCategory.value;
    const lanes = lanesByCategory.value[category] || [];
    if (lanes.length === 0) return false;
    return selectedLaneKeys[category].length === lanes.length;
  });

  const isIndeterminate = computed(() => {
    const category = selectedCategory.value;
    const lanes = lanesByCategory.value[category] || [];
    const selectedCount = selectedLaneKeys[category].length;
    return selectedCount > 0 && selectedCount < lanes.length;
  });

  function isLaneSelected(category, laneKey) {
    return selectedLaneKeys[category].includes(laneKey);
  }

  function toggleLane(category, laneKey) {
    const selection = selectedLaneKeys[category];
    if (selection.includes(laneKey)) {
      selectedLaneKeys[category] = selection.filter(key => key !== laneKey);
    } else {
      selectedLaneKeys[category] = [...selection, laneKey];
    }
  }

  function toggleAll(category, enabled) {
    const lanes = lanesByCategory.value[category] || [];
    selectedLaneKeys[category] = enabled ? lanes.map(lane => lane.id) : [];
  }

  const activeLanes = computed(() => {
    const category = selectedCategory.value;
    const lanes = lanesByCategory.value[category] || [];
    const selection = selectedLaneKeys[category];
    if (selection.length === 0) return [];
    const selectedSet = new Set(selection);
    return lanes.filter(lane => selectedSet.has(lane.id));
  });

  const normalizedEvents = computed(() =>
    activeLanes.value.flatMap(lane => lane.events)
  );

  // TODO: カテゴリ別の一括選択・検索・並び替えを追加する

  return {
    categoryOptions: CATEGORY_OPTIONS,
    selectedCategory,
    laneOptions,
    activeLanes,
    normalizedEvents,
    allSelected,
    isIndeterminate,
    isLaneSelected,
    toggleLane,
    toggleAll
  };
}
