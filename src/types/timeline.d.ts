export type OccurrenceType = "continuous" | "singleWithinRange";
export type DateConfidence = "confirmed" | "inferred" | "rangeOnly";
export type SourceBasis = "explicit" | "inferred" | "mixed" | "unknown";
export type SourceStatus =
  | "confirmed"
  | "inferred"
  | "conflicting"
  | "unreviewed"
  | "unsourced"
  | "unknown";
export type SourceClaimTarget =
  | "event"
  | "date"
  | "detail"
  | "worldline"
  | "participants";
export type RangeReason =
  | "monthOnly"
  | "sourceRange"
  | "chapterOrder"
  | "relativeOrder"
  | "unknown";

export interface SourceDetail {
  id?: string;
  label: string;
  url?: string;
  status?: SourceStatus;
  claim?: string;
  supports?: SourceClaimTarget[];
}

export interface SourceConflict {
  summary: string;
  sources?: string[];
  resolution?: string;
}

export interface DateLike {
  year: number;
  month: number;
  day?: number;
}

export interface TimelineEvent {
  id?: string;
  start: DateLike;
  end: DateLike;
  title?: string;
  detail?: string;
  occurrenceType?: OccurrenceType;
  dateConfidence?: DateConfidence;
  sourceBasis?: SourceBasis;
  sourceStatus?: SourceStatus;
  rangeReason?: RangeReason;
  worldlineId?: string[];
  participants?: string[];
  source?: string[];
  sourceDetails?: SourceDetail[];
  conflicts?: SourceConflict[];
  note?: string[];
}

export interface ColorSourceMetadata {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  sourceColor: string;
  legacyColor?: string | null;
  provenance?: string;
  sourceUrl?: string | null;
  sourceSelector?: string | null;
  sampleRegion?: string | null;
  confidence?: string;
  note?: string | null;
}

export interface ColorRoles {
  accent: string;
  accentSoft: string;
  accentStrong: string;
  accentText: string;
  labelText: string;
  labelBg: string;
  eventFill: string;
  eventStroke: string;
  markerFill: string;
  selectedStroke: string;
  uncertainMarker: string;
  panelAccent: string;
  laneAccent: string;
  provenance?: string;
}

export interface TimelineLane {
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  color?: string;
  colorSource?: ColorSourceMetadata;
  colorRoles?: ColorRoles;
  textColor?: string;
  labelBgColor?: string;
  events: TimelineEvent[];
}

export interface TimelineEventInstance extends Required<Pick<TimelineEvent, "id" | "title" | "detail">> {
  canonicalId: string;
  instanceId: string;
  character: string;
  color: string;
  colorSource?: ColorSourceMetadata;
  colorRoles?: ColorRoles;
  laneIndex: number;
  displayStartDay: number;
  displayEndDay: number;
  isCommon: boolean;
  renderStartDay?: number;
  renderEndDay?: number;
}
