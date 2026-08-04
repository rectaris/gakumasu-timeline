import { computed, ref } from "vue";
import {
  EVENT_AUDIT_CATEGORY_LABELS,
  EVENT_AUDIT_CATEGORY_OPTIONS,
  SOURCE_CLAIM_TARGET_LABELS,
  eventAuditCategories,
  eventOccurrenceType,
  eventUncertaintyState,
  eventUncertaintySummary,
  isUncertainEvent,
  sourceKeysForEvent,
} from "../utils/events.js";

const ALL_OPTION = "all";
const OCCURRENCE_FILTER_OPTIONS = ["all", "continuous", "singleWithinRange"];
const UNCERTAINTY_FILTER_OPTIONS = [
  "all",
  "confirmed",
  "inferred",
  "rangeOnly",
  "conflicting",
  "certain",
  "uncertain",
];
const AUDIT_FILTER_OPTIONS = EVENT_AUDIT_CATEGORY_OPTIONS;

function normalizeValue(value) {
  return String(value ?? "").trim().toLocaleLowerCase("ja-JP");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function lookupMap(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function eventLane(event, lanes) {
  if (event?.laneId) {
    const lane = lanes.find((item) => item.id === event.laneId);
    if (lane) return lane;
  }

  return lanes[event.laneIndex] ?? null;
}

export function buildEventSearchText(event, { lanes = [], characters = [], worldlines = [] } = {}) {
  const characterById = lookupMap(characters);
  const worldlineById = lookupMap(worldlines);
  const lane = eventLane(event, lanes);
  const participants = asArray(event.participants).flatMap((id) => [
    id,
    characterById.get(id)?.name,
  ]);
  const eventWorldlines = asArray(event.worldlineId).flatMap((id) => [
    id,
    worldlineById.get(id)?.name,
  ]);
  const uncertainty = eventUncertaintySummary(event);
  const sourceDetails = asArray(event.sourceDetails).flatMap((sourceDetail) => [
    sourceDetail.id,
    sourceDetail.label,
    sourceDetail.claim,
    sourceDetail.status,
    ...asArray(sourceDetail.supports),
    ...asArray(sourceDetail.supports).map(
      (target) => SOURCE_CLAIM_TARGET_LABELS[target],
    ),
  ]);
  const conflicts = asArray(event.conflicts).flatMap((conflict) => [
    conflict.summary,
    conflict.resolution,
    ...asArray(conflict.sources),
  ]);

  return [
    event.title,
    event.detail,
    event.character,
    eventOccurrenceType(event),
    uncertainty.state,
    uncertainty.stateLabel,
    uncertainty.dateConfidence,
    uncertainty.dateConfidenceLabel,
    uncertainty.sourceBasis,
    uncertainty.sourceBasisLabel,
    uncertainty.sourceStatus,
    uncertainty.sourceStatusLabel,
    uncertainty.rangeReason,
    uncertainty.rangeReasonLabel,
    event.isCommon ? "common 共通" : "lane 個別",
    lane?.id,
    lane?.name,
    ...asArray(event.source),
    ...sourceDetails,
    ...conflicts,
    ...asArray(event.note),
    ...participants,
    ...eventWorldlines,
  ]
    .map(normalizeValue)
    .filter(Boolean)
    .join(" ");
}

export function eventMatchesQuery(event, query, context) {
  const terms = normalizeValue(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchText = buildEventSearchText(event, context);
  return terms.every((term) => searchText.includes(term));
}

export function compareEventsForNavigation(a, b) {
  return (
    a.displayStartDay - b.displayStartDay ||
    a.displayEndDay - b.displayEndDay ||
    a.laneIndex - b.laneIndex ||
    String(a.title ?? "").localeCompare(String(b.title ?? ""), "ja")
  );
}

export function collapseEventsByCanonicalId(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = event.canonicalId ?? event.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function optionLabel(id, lookup, fallbackPrefix = "") {
  return lookup.get(id)?.name ?? (fallbackPrefix ? `${fallbackPrefix}: ${id}` : id);
}

function makeOption(id, label, count) {
  return {
    id,
    label,
    count,
  };
}

function countedOptions(ids, labelForId) {
  const counts = new Map();
  ids.filter(Boolean).forEach((id) => {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([id, count]) => makeOption(id, labelForId(id), count))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));
}

function collectSourceOptions(events) {
  const sourceByKey = new Map();

  events.forEach((event) => {
    const seenInEvent = new Set();
    const addSource = (key, label) => {
      if (!key || seenInEvent.has(key)) return;

      const existing = sourceByKey.get(key);
      sourceByKey.set(key, {
        id: key,
        label: existing?.label ?? label,
        count: (existing?.count ?? 0) + 1,
      });
      seenInEvent.add(key);
    };

    asArray(event.sourceDetails).forEach((sourceDetail) => {
      const keys = sourceKeysForEvent({ sourceDetails: [sourceDetail] });
      const key = keys[0];
      addSource(key, sourceDetail.label || sourceDetail.id || sourceDetail.url || key);
    });

    asArray(event.source).forEach((source) => {
      const key = sourceKeysForEvent({ source: [source] })[0];
      addSource(key, source);
    });
  });

  return Array.from(sourceByKey.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ja"),
  );
}

export function filterEvents(events, filters, context) {
  return events.filter((event) => {
    if (!eventMatchesQuery(event, filters.query, context)) return false;

    if (
      filters.occurrenceType !== ALL_OPTION &&
      eventOccurrenceType(event) !== filters.occurrenceType
    ) {
      return false;
    }

    if (filters.uncertainty === "uncertain" && !isUncertainEvent(event)) {
      return false;
    }

    if (filters.uncertainty === "certain" && isUncertainEvent(event)) {
      return false;
    }

    if (
      !["all", "certain", "uncertain"].includes(filters.uncertainty) &&
      eventUncertaintyState(event) !== filters.uncertainty
    ) {
      return false;
    }

    const auditCategory = filters.auditCategory ?? ALL_OPTION;
    if (
      auditCategory !== ALL_OPTION &&
      !eventAuditCategories(event).includes(auditCategory)
    ) {
      return false;
    }

    const sourceKey = filters.sourceKey ?? ALL_OPTION;
    if (
      sourceKey !== ALL_OPTION &&
      !sourceKeysForEvent(event).includes(sourceKey)
    ) {
      return false;
    }

    if (
      filters.participant !== ALL_OPTION &&
      !asArray(event.participants).includes(filters.participant)
    ) {
      return false;
    }

    const lane = eventLane(event, context.lanes);
    if (filters.commu !== ALL_OPTION && lane?.id !== filters.commu) {
      return false;
    }

    if (
      filters.worldline !== ALL_OPTION &&
      !asArray(event.worldlineId).includes(filters.worldline)
    ) {
      return false;
    }

    return true;
  });
}

export function useEventSearchFilter({
  allEvents,
  lanes,
  characterCatalog,
  worldlines,
}) {
  const eventSearchQuery = ref("");
  const occurrenceTypeFilter = ref(ALL_OPTION);
  const uncertaintyFilter = ref(ALL_OPTION);
  const auditCategoryFilter = ref(ALL_OPTION);
  const sourceFilter = ref(ALL_OPTION);
  const participantFilter = ref(ALL_OPTION);
  const commuFilter = ref(ALL_OPTION);
  const worldlineFilter = ref(ALL_OPTION);

  const context = computed(() => ({
    lanes: lanes.value || [],
    characters: characterCatalog,
    worldlines,
  }));

  const filters = computed(() => ({
    query: eventSearchQuery.value,
    occurrenceType: occurrenceTypeFilter.value,
    uncertainty: uncertaintyFilter.value,
    auditCategory: auditCategoryFilter.value,
    sourceKey: sourceFilter.value,
    participant: participantFilter.value,
    commu: commuFilter.value,
    worldline: worldlineFilter.value,
  }));

  const filteredEvents = computed(() =>
    filterEvents(allEvents.value || [], filters.value, context.value),
  );

  const navigationEvents = computed(() =>
    collapseEventsByCanonicalId(
      filteredEvents.value.slice().sort(compareEventsForNavigation),
    ),
  );

  const hasActiveEventFilters = computed(
    () =>
      Boolean(normalizeValue(eventSearchQuery.value)) ||
      occurrenceTypeFilter.value !== ALL_OPTION ||
      uncertaintyFilter.value !== ALL_OPTION ||
      auditCategoryFilter.value !== ALL_OPTION ||
      sourceFilter.value !== ALL_OPTION ||
      participantFilter.value !== ALL_OPTION ||
      commuFilter.value !== ALL_OPTION ||
      worldlineFilter.value !== ALL_OPTION,
  );

  const characterById = computed(() => lookupMap(characterCatalog));
  const worldlineById = computed(() => lookupMap(worldlines));

  const participantOptions = computed(() =>
    countedOptions(
      allEvents.value.flatMap((event) => asArray(event.participants)),
      (id) => optionLabel(id, characterById.value, "ID"),
    ),
  );

  const commuOptions = computed(() =>
    uniqueById(lanes.value || [])
      .map((lane) => makeOption(lane.id, lane.name, 0))
      .map((option) => ({
        ...option,
        count: allEvents.value.filter(
          (event) => eventLane(event, lanes.value || [])?.id === option.id,
        ).length,
      }))
      .filter((option) => option.count > 0),
  );

  const worldlineOptions = computed(() =>
    countedOptions(
      allEvents.value.flatMap((event) => asArray(event.worldlineId)),
      (id) => optionLabel(id, worldlineById.value, "ID"),
    ),
  );

  const auditCategoryOptions = computed(() =>
    EVENT_AUDIT_CATEGORY_OPTIONS.filter((id) => id !== ALL_OPTION).map((id) => ({
      id,
      label: EVENT_AUDIT_CATEGORY_LABELS[id] ?? id,
      count: allEvents.value.filter((event) =>
        eventAuditCategories(event).includes(id),
      ).length,
    })).filter((option) => option.count > 0),
  );

  const sourceOptions = computed(() => collectSourceOptions(allEvents.value));

  const resultSummary = computed(() => ({
    visible: filteredEvents.value.length,
    canonical: navigationEvents.value.length,
    total: allEvents.value.length,
  }));

  function isEventInFilteredSet(event) {
    if (!event) return false;
    const instanceId = event.instanceId ?? event.id;
    return filteredEvents.value.some(
      (candidate) => (candidate.instanceId ?? candidate.id) === instanceId,
    );
  }

  function resetEventFilters() {
    eventSearchQuery.value = "";
    occurrenceTypeFilter.value = ALL_OPTION;
    uncertaintyFilter.value = ALL_OPTION;
    participantFilter.value = ALL_OPTION;
    commuFilter.value = ALL_OPTION;
    worldlineFilter.value = ALL_OPTION;
    auditCategoryFilter.value = ALL_OPTION;
    sourceFilter.value = ALL_OPTION;
  }

  function setEventFilters(nextFilters) {
    if (!nextFilters) return;

    if (typeof nextFilters.query === "string") {
      eventSearchQuery.value = nextFilters.query;
    }

    if (OCCURRENCE_FILTER_OPTIONS.includes(nextFilters.occurrenceType)) {
      occurrenceTypeFilter.value = nextFilters.occurrenceType;
    }

    if (UNCERTAINTY_FILTER_OPTIONS.includes(nextFilters.uncertainty)) {
      uncertaintyFilter.value = nextFilters.uncertainty;
    }

    if (AUDIT_FILTER_OPTIONS.includes(nextFilters.auditCategory)) {
      auditCategoryFilter.value = nextFilters.auditCategory;
    }

    if (
      nextFilters.sourceKey === ALL_OPTION ||
      sourceOptions.value.some((option) => option.id === nextFilters.sourceKey)
    ) {
      sourceFilter.value = nextFilters.sourceKey;
    }

    if (
      nextFilters.participant === ALL_OPTION ||
      participantOptions.value.some((option) => option.id === nextFilters.participant)
    ) {
      participantFilter.value = nextFilters.participant;
    }

    if (
      nextFilters.commu === ALL_OPTION ||
      commuOptions.value.some((option) => option.id === nextFilters.commu)
    ) {
      commuFilter.value = nextFilters.commu;
    }

    if (
      nextFilters.worldline === ALL_OPTION ||
      worldlineOptions.value.some((option) => option.id === nextFilters.worldline)
    ) {
      worldlineFilter.value = nextFilters.worldline;
    }
  }

  return {
    eventSearchQuery,
    occurrenceTypeFilter,
    uncertaintyFilter,
    auditCategoryFilter,
    sourceFilter,
    participantFilter,
    commuFilter,
    worldlineFilter,
    filteredEvents,
    navigationEvents,
    hasActiveEventFilters,
    participantOptions,
    commuOptions,
    worldlineOptions,
    auditCategoryOptions,
    sourceOptions,
    resultSummary,
    isEventInFilteredSet,
    resetEventFilters,
    setEventFilters,
  };
}
