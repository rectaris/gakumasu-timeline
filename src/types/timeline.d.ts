export type OccurrenceType = "continuous" | "singleWithinRange";

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
  worldlineId?: string[];
  participants?: string[];
  source?: string[];
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
