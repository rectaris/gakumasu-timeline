import { onMounted, ref, watch } from "vue";

export function useSelection(allEvents, options = {}) {
  const selectedEvent = ref(null);
  const pendingCanonicalId = ref(null);

  function updateUrl(eventId) {
    const params = new URLSearchParams(window.location.search);

    if (eventId) {
      params.set("event", eventId);
    } else {
      params.delete("event");
    }

    const query = params.toString();
    const newUrl = window.location.pathname + (query ? `?${query}` : "");

    history.replaceState(null, "", newUrl);
  }

  function selectEvent(event) {
    selectedEvent.value = event;
    updateUrl(event.canonicalId ?? event.id);
  }

  function closePanel() {
    selectedEvent.value = null;
    updateUrl(null);
  }

  function restoreSelectionByCanonicalId(eventId) {
    if (!eventId) return false;

    const found = allEvents.value.find(
      (event) => (event.canonicalId ?? event.id) === eventId,
    );

    if (!found) return false;

    selectedEvent.value = found;
    pendingCanonicalId.value = null;
    return true;
  }

  onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    pendingCanonicalId.value = params.get("event");
    restoreSelectionByCanonicalId(pendingCanonicalId.value);
  });

  watch(
    allEvents,
    (events) => {
      if (selectedEvent.value) {
        const selectedInstanceId =
          selectedEvent.value.instanceId ?? selectedEvent.value.id;
        const stillVisible = events.some(
          (event) => (event.instanceId ?? event.id) === selectedInstanceId,
        );

        if (!stillVisible) {
          if (options.shouldPreserveMissingSelection?.(selectedEvent.value)) {
            return;
          }

          closePanel();
          return;
        }
      }

      if (!selectedEvent.value && pendingCanonicalId.value) {
        restoreSelectionByCanonicalId(pendingCanonicalId.value);
      }
    },
    { immediate: true },
  );

  return {
    selectedEvent,
    selectEvent,
    closePanel,
  };
}
