import { computed, reactive, ref, watch } from "vue";
import { normalizeHexColor } from "../utils/colors";
import { resolveColorDesign } from "../utils/colorTokens";

const CATEGORY_OPTIONS = [
  { id: "idol", label: "アイドルコミュ" },
  { id: "hatsuboshi", label: "初星コミュ" },
  { id: "event", label: "イベントコミュ" },
  { id: "support", label: "サポートカードコミュ" },
];

const SORT_OPTIONS = [
  { id: "default", label: "デフォルト順" },
  { id: "nameAsc", label: "名前順" },
  { id: "nameDesc", label: "名前逆順" },
  { id: "eventsDesc", label: "イベント数順" },
];

const FALLBACK_COLORS = ["#7a7a7a", "#4d7ea8", "#a26ea1", "#c2854b"];

function normalizeLaneColor(lane, index) {
  const normalized = normalizeHexColor(lane.color);
  return normalized || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function normalizeLaneLabel(lane) {
  return lane.name || lane.title || lane.label || lane.id || "(名称未設定)";
}

function normalizeSearchQuery(query) {
  return query.trim().toLocaleLowerCase("ja-JP");
}

function sortLanes(lanes, sortMode) {
  const sorted = lanes.slice();

  switch (sortMode) {
    case "nameAsc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    case "nameDesc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "ja"));
    case "eventsDesc":
      return sorted.sort(
        (a, b) =>
          b.events.length - a.events.length ||
          a.name.localeCompare(b.name, "ja"),
      );
    default:
      return sorted;
  }
}

function hasValidEventRange(event, laneId, laneLabel, category) {
  if (!event?.start?.year || !event?.start?.month) {
    console.warn("Invalid event start date", {
      event,
      laneId,
      laneLabel,
      category,
    });
    return false;
  }
  if (!event?.end?.year || !event?.end?.month) {
    console.warn("Invalid event end date", {
      event,
      laneId,
      laneLabel,
      category,
    });
    return false;
  }

  return true;
}

function normalizeLanes(category, lanes) {
  return lanes.map((lane, index) => {
    const laneId = lane.id || `${category}_${index}`;
    const laneLabel = normalizeLaneLabel(lane);
    const fallbackColor = normalizeLaneColor(lane, index);
    const { colorSource, colorRoles } = resolveColorDesign(lane, {
      category,
      fallbackColor,
      fallbackIndex: index
    });
    const laneColor = colorSource.sourceColor ?? fallbackColor;
    const events = Array.isArray(lane.events)
      ? lane.events.filter((event) =>
          hasValidEventRange(event, laneId, laneLabel, category),
        )
      : [];

    return {
      ...lane,
      id: laneId,
      name: laneLabel,
      color: laneColor,
      colorSource,
      colorRoles,
      textColor: colorRoles.labelText,
      labelBgColor: colorRoles.labelBg,
      events,
    };
  });
}

export function useCategoryFilter({
  idolCommu,
  hatsuboshiCommus,
  eventCommus,
  supportCardCommus,
}) {
  const selectedCategory = ref("idol");
  const initializedCategories = reactive({
    idol: false,
    hatsuboshi: false,
    event: false,
    support: false,
  });
  const selectedLaneKeys = reactive({
    idol: [],
    hatsuboshi: [],
    event: [],
    support: [],
  });
  const laneSearchQueries = reactive({
    idol: "",
    hatsuboshi: "",
    event: "",
    support: "",
  });
  const laneSortModes = reactive({
    idol: "default",
    hatsuboshi: "default",
    event: "default",
    support: "default",
  });

  const lanesByCategory = computed(() => ({
    idol: normalizeLanes("idol", idolCommu.value || []),
    hatsuboshi: normalizeLanes("hatsuboshi", hatsuboshiCommus.value || []),
    event: normalizeLanes("event", eventCommus.value || []),
    support: normalizeLanes("support", supportCardCommus.value || []),
  }));

  const sortedLanesByCategory = computed(() => ({
    idol: sortLanes(lanesByCategory.value.idol, laneSortModes.idol),
    hatsuboshi: sortLanes(
      lanesByCategory.value.hatsuboshi,
      laneSortModes.hatsuboshi,
    ),
    event: sortLanes(lanesByCategory.value.event, laneSortModes.event),
    support: sortLanes(lanesByCategory.value.support, laneSortModes.support),
  }));

  function getVisibleLanes(category) {
    const lanes = sortedLanesByCategory.value[category] || [];
    const query = normalizeSearchQuery(laneSearchQueries[category]);

    if (!query) return lanes;

    return lanes.filter((lane) =>
      lane.name.toLocaleLowerCase("ja-JP").includes(query),
    );
  }

  watch(
    lanesByCategory,
    (value) => {
      CATEGORY_OPTIONS.forEach((option) => {
        const lanes = value[option.id] || [];
        if (lanes.length === 0) {
          selectedLaneKeys[option.id] = [];
          initializedCategories[option.id] = false;
          return;
        }

        if (!initializedCategories[option.id]) {
          selectedLaneKeys[option.id] = lanes.map((lane) => lane.id);
          initializedCategories[option.id] = true;
          return;
        }

        const laneIds = new Set(lanes.map((lane) => lane.id));
        selectedLaneKeys[option.id] = selectedLaneKeys[option.id].filter(
          (key) => laneIds.has(key),
        );
      });
    },
    { immediate: true },
  );

  const laneOptions = computed(() => {
    const lanes = getVisibleLanes(selectedCategory.value);
    return lanes.map((lane) => ({
      key: lane.id,
      label: lane.name,
      eventCount: lane.events.length,
    }));
  });

  const laneSearchQuery = computed({
    get: () => laneSearchQueries[selectedCategory.value],
    set: (value) => {
      laneSearchQueries[selectedCategory.value] = value;
    },
  });

  const laneSortMode = computed({
    get: () => laneSortModes[selectedCategory.value],
    set: (value) => {
      laneSortModes[selectedCategory.value] = value;
    },
  });

  const visibleLaneCount = computed(() => laneOptions.value.length);

  const totalLaneCount = computed(
    () => sortedLanesByCategory.value[selectedCategory.value]?.length ?? 0,
  );

  const allSelected = computed(() => {
    const category = selectedCategory.value;
    const lanes = laneOptions.value;
    if (lanes.length === 0) return false;
    const selectedSet = new Set(selectedLaneKeys[category]);
    return lanes.every((lane) => selectedSet.has(lane.key));
  });

  const isIndeterminate = computed(() => {
    const category = selectedCategory.value;
    const lanes = laneOptions.value;
    const selectedSet = new Set(selectedLaneKeys[category]);
    const selectedCount = lanes.filter((lane) =>
      selectedSet.has(lane.key),
    ).length;
    return selectedCount > 0 && selectedCount < lanes.length;
  });

  function isLaneSelected(category, laneKey) {
    return selectedLaneKeys[category].includes(laneKey);
  }

  function toggleLane(category, laneKey) {
    const selection = selectedLaneKeys[category];
    if (selection.includes(laneKey)) {
      selectedLaneKeys[category] = selection.filter((key) => key !== laneKey);
    } else {
      selectedLaneKeys[category] = [...selection, laneKey];
    }
  }

  function toggleAll(category, enabled) {
    const visibleLaneIds = getVisibleLanes(category).map((lane) => lane.id);
    const visibleLaneIdSet = new Set(visibleLaneIds);
    const selection = selectedLaneKeys[category];

    if (enabled) {
      selectedLaneKeys[category] = Array.from(
        new Set([...selection, ...visibleLaneIds]),
      );
      return;
    }

    selectedLaneKeys[category] = selection.filter(
      (key) => !visibleLaneIdSet.has(key),
    );
  }

  const activeLanes = computed(() => {
    const category = selectedCategory.value;
    const lanes = sortedLanesByCategory.value[category] || [];
    const selection = selectedLaneKeys[category];
    if (selection.length === 0) return [];
    const selectedSet = new Set(selection);
    return lanes.filter((lane) => selectedSet.has(lane.id));
  });

  return {
    categoryOptions: CATEGORY_OPTIONS,
    laneSortOptions: SORT_OPTIONS,
    selectedCategory,
    laneSearchQuery,
    laneSortMode,
    laneOptions,
    visibleLaneCount,
    totalLaneCount,
    activeLanes,
    allSelected,
    isIndeterminate,
    isLaneSelected,
    toggleLane,
    toggleAll,
  };
}
