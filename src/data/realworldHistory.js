import publishedData from "./generated/realworld_events/published";
import unreviewedData from "./generated/realworld_events/unreviewed/examples";
import {
  normalizeRealworldHistoryData,
} from "./realworldHistoryModel";

export const publishedRealworldHistory =
  normalizeRealworldHistoryData(publishedData);

export const realworldHistory =
  import.meta.env?.PROD === true
    ? publishedRealworldHistory
    : normalizeRealworldHistoryData({
        dataset: {
          ...unreviewedData.dataset,
          label: "学マス情報史 開発表示",
        },
        events: [...publishedData.events, ...unreviewedData.events],
      });
