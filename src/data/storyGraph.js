import storyGraphData from "./generated/story_events/pilot";
import storyReferenceIndex from "./generated/story_events/referenceIndex";
import { normalizeStoryGraphData } from "./storyGraphModel";
import { storyReferenceMap } from "./storyReferences";

export const storyGraph = {
  ...normalizeStoryGraphData(storyGraphData),
  referencesByBlockId: storyReferenceMap(storyReferenceIndex),
};
