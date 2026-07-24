import { inject } from "vue";

export const TIMELINE_MODE_CONTEXT = Symbol("timeline-mode");

export function useTimelineMode() {
  const context = inject(TIMELINE_MODE_CONTEXT, null);
  if (!context) {
    throw new Error("Timeline mode context is not available.");
  }
  return context;
}
