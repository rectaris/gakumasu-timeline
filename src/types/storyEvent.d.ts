export type StoryCategory = "idol" | "event" | "support" | "hatsuboshi";
export type StoryEdgeKind = "sequence" | "semantic";
export type StoryEdgeDirection = "undirected" | "forward" | "bidirectional";
export type StoryConfidence = "confirmed" | "inferred" | "speculative";

export interface StoryCharacter {
  id: string;
  name: string;
  roles: Array<"owner" | "focus" | "participant">;
}

export interface StorySeries {
  id: `series_${string}`;
  category: StoryCategory;
  kind: string;
  label: string;
  parentSeriesId?: `series_${string}`;
  sequencePolicy?: "authored" | "episode_order";
}

export interface StoryBlock {
  id: `block_${string}`;
  seriesId: `series_${string}`;
  label: string;
  episodeOrder?: number;
  episodeNumber?: number;
  characters: StoryCharacter[];
  sourceNotes?: string;
}

export interface StoryEdge {
  id: `edge_${string}`;
  sourceBlockId: `block_${string}`;
  targetBlockId: `block_${string}`;
  kind: StoryEdgeKind;
  direction: StoryEdgeDirection;
  relationType: string;
  label?: string;
  origin: "authored" | "generated";
  rationale?: string;
  evidence?: string[];
  confidence?: StoryConfidence;
}

export interface StoryReference {
  id: `ref_${string}`;
  storyBlockId: `block_${string}`;
  type: "evidence" | "source" | "subject" | "related";
  label?: string;
  note?: string;
  order?: number;
}

export interface StoryReferenceIndexRecord {
  referenceId: `ref_${string}`;
  type: StoryReference["type"];
  label?: string;
  note?: string;
  order?: number;
  sourceView: "narrative";
  eventId: string;
  eventTitle: string;
  laneId: string;
  laneName: string;
  sourceFile: string;
}
