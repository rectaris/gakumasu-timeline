import publishedStoryGraphData from "./generated/story_events/published";
import unreviewedStoryGraphData from "./generated/story_events/unreviewed/pilot";
import storyReferenceIndex from "./generated/story_events/referenceIndex";
import { normalizeStoryGraphData } from "./storyGraphModel";
import { storyReferenceMap } from "./storyReferences";

export const publishedStoryGraph = {
  ...normalizeStoryGraphData(publishedStoryGraphData),
  referencesByBlockId: storyReferenceMap(storyReferenceIndex),
};

export const storyGraph =
  import.meta.env?.PROD === true
    ? publishedStoryGraph
    : {
        ...normalizeStoryGraphData(unreviewedStoryGraphData),
        referencesByBlockId: storyReferenceMap(storyReferenceIndex),
      };
