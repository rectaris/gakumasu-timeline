import { inject } from "vue";

export const APPLICATION_APPEARANCE_CONTEXT = Symbol("application-appearance");

export function useApplicationAppearance() {
  const context = inject(APPLICATION_APPEARANCE_CONTEXT, null);
  if (!context) {
    throw new Error("Application appearance context is not available.");
  }
  return context;
}
