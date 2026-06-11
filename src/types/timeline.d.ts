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

export interface TimelineLane {
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  color?: string;
  textColor?: string;
  labelBgColor?: string;
  events: TimelineEvent[];
}

export interface TimelineEventInstance extends Required<Pick<TimelineEvent, "id" | "title" | "detail">> {
  canonicalId: string;
  instanceId: string;
  character: string;
  color: string;
  laneIndex: number;
  displayStartDay: number;
  displayEndDay: number;
  isCommon: boolean;
  renderStartDay?: number;
  renderEndDay?: number;
}
