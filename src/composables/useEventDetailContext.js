import { computed } from "vue";

const RELATED_LIMIT = 3;

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function lookupMap(items = []) {
  return new Map(items.map((item) => [item.id, item]));
}

function canonicalIdFor(event) {
  return event?.canonicalId ?? event?.id ?? "";
}

function instanceIdFor(event) {
  return event?.instanceId ?? event?.id ?? canonicalIdFor(event);
}

function eventTitle(event) {
  return String(event?.title ?? "(無題)").trim() || "(無題)";
}

function intervalDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  if (a.displayEndDay < b.displayStartDay) {
    return b.displayStartDay - a.displayEndDay;
  }
  if (b.displayEndDay < a.displayStartDay) {
    return a.displayStartDay - b.displayEndDay;
  }
  return 0;
}

function compareRelatedEvents(selectedEvent) {
  return (a, b) =>
    intervalDistance(a, selectedEvent) - intervalDistance(b, selectedEvent) ||
    Math.abs((a.displayStartDay ?? 0) - (selectedEvent.displayStartDay ?? 0)) -
      Math.abs((b.displayStartDay ?? 0) - (selectedEvent.displayStartDay ?? 0)) ||
    (a.laneIndex ?? 0) - (b.laneIndex ?? 0) ||
    eventTitle(a).localeCompare(eventTitle(b), "ja");
}

function isSameInstance(a, b) {
  return instanceIdFor(a) === instanceIdFor(b);
}

function isSameCanonical(a, b) {
  return Boolean(canonicalIdFor(a)) && canonicalIdFor(a) === canonicalIdFor(b);
}

function sharesParticipant(a, b) {
  const participants = new Set(asArray(a?.participants));
  if (!participants.size) return false;
  return asArray(b?.participants).some((id) => participants.has(id));
}

function preferSelectedLaneInstance(events, selectedEvent) {
  const selectedLaneIndex = selectedEvent?.laneIndex;
  const byCanonical = new Map();

  events.forEach((event) => {
    const key = canonicalIdFor(event);
    if (!key || isSameInstance(event, selectedEvent)) return;

    const existing = byCanonical.get(key);
    if (!existing) {
      byCanonical.set(key, event);
      return;
    }

    const eventIsSelectedLane = event.laneIndex === selectedLaneIndex;
    const existingIsSelectedLane = existing.laneIndex === selectedLaneIndex;
    if (eventIsSelectedLane && !existingIsSelectedLane) {
      byCanonical.set(key, event);
    }
  });

  return Array.from(byCanonical.values());
}

function relatedSection({ id, title, description, events, selectedEvent }) {
  const items = preferSelectedLaneInstance(events, selectedEvent)
    .filter((event) => !isSameCanonical(event, selectedEvent))
    .sort(compareRelatedEvents(selectedEvent));

  return {
    id,
    title,
    description,
    items: items.slice(0, RELATED_LIMIT),
    overflowCount: Math.max(0, items.length - RELATED_LIMIT),
  };
}

export function createEventShareUrl(event, locationLike = globalThis.location) {
  const eventId = canonicalIdFor(event);
  if (!eventId || !locationLike) return "";

  const url = new URL(
    `${locationLike.pathname || "/"}${locationLike.search || ""}`,
    locationLike.href || "http://localhost/",
  );
  url.searchParams.set("event", eventId);
  return url.toString();
}

export function resolveEventDetailContext({
  selectedEvent,
  allEvents = [],
  visibleEvents = [],
  characterCatalog = [],
  worldlines = [],
  locationLike = globalThis.location,
} = {}) {
  if (!selectedEvent) {
    return {
      shareUrl: "",
      participantLabels: [],
      worldlineLabels: [],
      sources: [],
      notes: [],
      isUncertain: false,
      relatedSections: [],
    };
  }

  const characterById = lookupMap(characterCatalog);
  const worldlineById = lookupMap(worldlines);
  const participantLabels = asArray(selectedEvent.participants).map(
    (id) => characterById.get(id)?.name ?? id,
  );
  const worldlineLabels = asArray(selectedEvent.worldlineId).map(
    (id) => worldlineById.get(id)?.name ?? id,
  );

  const sameVisiblePeriod = visibleEvents.filter(
    (event) => intervalDistance(event, selectedEvent) === 0,
  );
  const sameLane = allEvents.filter(
    (event) => event.laneIndex === selectedEvent.laneIndex,
  );
  const commonEvents = allEvents.filter(
    (event) => event.isCommon && intervalDistance(event, selectedEvent) === 0,
  );
  const sameParticipant = allEvents.filter((event) =>
    sharesParticipant(selectedEvent, event),
  );

  return {
    shareUrl: createEventShareUrl(selectedEvent, locationLike),
    participantLabels,
    worldlineLabels,
    sources: asArray(selectedEvent.source),
    notes: asArray(selectedEvent.note),
    isUncertain: selectedEvent.occurrenceType === "singleWithinRange",
    relatedSections: [
      relatedSection({
        id: "nearby-visible",
        title: "表示中の同時期",
        description: "現在の表示範囲で時期が重なるイベントです。",
        events: sameVisiblePeriod,
        selectedEvent,
      }),
      relatedSection({
        id: "same-lane",
        title: "同じレーン",
        description: "同じコミュ/レーン上で時期が近いイベントです。",
        events: sameLane,
        selectedEvent,
      }),
      relatedSection({
        id: "common",
        title: "同時期の共通イベント",
        description: "共通イベントとして登録され、時期が重なるイベントです。",
        events: commonEvents,
        selectedEvent,
      }),
      relatedSection({
        id: "same-participant",
        title: "同じ参加者",
        description: "参加者IDが共通するイベントです。",
        events: sameParticipant,
        selectedEvent,
      }),
    ].filter((section) => section.items.length > 0),
  };
}

export function useEventDetailContext({
  selectedEvent,
  allEvents,
  visibleEvents,
  characterCatalog,
  worldlines,
}) {
  return computed(() =>
    resolveEventDetailContext({
      selectedEvent: selectedEvent.value,
      allEvents: allEvents.value,
      visibleEvents: visibleEvents.value,
      characterCatalog,
      worldlines,
    }),
  );
}
