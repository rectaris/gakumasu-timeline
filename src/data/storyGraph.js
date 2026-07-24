import storyGraphData from "./generated/story_events/mvp";
import { normalizeStoryGraphData } from "./storyGraphModel";

export const storyGraph = normalizeStoryGraphData(storyGraphData);
