import { onMounted, ref } from "vue";

export function useSelection(allEvents) {
  const selectedEvent = ref(null);

  function updateUrl(eventId) {
    const params = new URLSearchParams(window.location.search);

    if (eventId) {
      params.set("event", eventId);
    } else {
      params.delete("event");
    }

    const query = params.toString();
    const newUrl =
      window.location.pathname + (query ? `?${query}` : "");

    history.replaceState(null, "", newUrl);
  }

  function selectEvent(event) {
    selectedEvent.value = event;
    updateUrl(event.id);
  }

  function closePanel() {
    selectedEvent.value = null;
    updateUrl(null);
  }

  onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event");

    if (eventId) {
      const found = allEvents.value.find(e => e.id === eventId);
      if (found) {
        selectedEvent.value = found;
      }
    }
  });

  return {
    selectedEvent,
    selectEvent,
    closePanel
  };
}
