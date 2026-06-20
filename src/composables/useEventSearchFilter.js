import { computed, ref } from "vue";
import {
  eventOccurrenceType,
  eventUncertaintyState,
  eventUncertaintySummary,
  isUncertainEvent,
} from "../utils/events.js";

const ALL_OPTION = "all";

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
    sourceDetail.label,
    sourceDetail.claim,
    sourceDetail.status,
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
  }

  return {
    eventSearchQuery,
    occurrenceTypeFilter,
    uncertaintyFilter,
    participantFilter,
    commuFilter,
    worldlineFilter,
    filteredEvents,
    navigationEvents,
    hasActiveEventFilters,
    participantOptions,
    commuOptions,
    worldlineOptions,
    resultSummary,
    isEventInFilteredSet,
    resetEventFilters,
  };
}
