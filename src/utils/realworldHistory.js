import {
  temporalEnd,
  temporalStart,
} from "../data/realworldHistoryModel";

export const INFO_CATEGORY_META = {
  game: { label: "ゲーム", color: "#3178c6" },
  story: { label: "ストーリー", color: "#8756b3" },
  music: { label: "楽曲", color: "#d06b35" },
  live: { label: "ライブ", color: "#c64664" },
  stream: { label: "公式配信", color: "#318878" },
};

export const INFO_STATUS_LABELS = {
  scheduled: "予定",
  active: "開催中",
  completed: "完了",
  postponed: "延期",
  cancelled: "中止",
};

export function formatTemporal(value) {
  if (!value) return "—";
  if (value.precision === "month") {
    const [year, month] = value.value.split("-");
    return `${year}年${Number(month)}月`;
  }
  if (value.precision === "date") {
    const [year, month, day] = value.value.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  }
  return `${value.value.replace("T", " ")} ${value.timezone}`;
}

export function filterInfoEvents(events, { query = "", category = "all", status = "all" } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja");
  return events.filter((event) => {
    if (category !== "all" && event.category !== category) return false;
    if (status !== "all" && event.status !== status) return false;
    if (!normalizedQuery) return true;
    return [event.title, event.summary, ...(event.tags ?? [])]
      .join(" ")
      .toLocaleLowerCase("ja")
      .includes(normalizedQuery);
  });
}

export function layoutInfoEvents(
  events,
  { width = 1600, laneHeight = 116, bounds = null } = {},
) {
  if (!events.length) {
    return { width, height: laneHeight * 5, start: 0, end: 1, items: [] };
  }
  const eventStart = Math.min(...events.map((event) => temporalStart(event.startsAt)));
  const eventEnd = Math.max(
    ...events.map((event) => temporalEnd(event.endsAt ?? event.startsAt)),
  );
  const padding = Math.max((eventEnd - eventStart) * 0.06, 86_400_000 * 12);
  const start = bounds ? Math.min(eventStart - padding, bounds.start) : eventStart - padding;
  const end = bounds ? Math.max(eventEnd + padding, bounds.end) : eventEnd + padding;
  const span = end - start;
  const categories = Object.keys(INFO_CATEGORY_META);
  const items = events.map((event) => {
    const itemStart = temporalStart(event.startsAt);
    const itemEnd = temporalEnd(event.endsAt ?? event.startsAt);
    const x = ((itemStart - start) / span) * width;
    const naturalWidth = ((itemEnd - itemStart) / span) * width;
    return {
      event,
      x,
      y: categories.indexOf(event.category) * laneHeight + 24,
      width: Math.max(event.startsAt.precision === "month" ? 48 : 12, naturalWidth),
    };
  });
  return { width, height: laneHeight * categories.length, start, end, items };
}

export function createYearTicks(start, end, width) {
  const startYear = new Date(start).getUTCFullYear();
  const endYear = new Date(end).getUTCFullYear();
  const ticks = [];
  for (let year = startYear; year <= endYear; year += 1) {
    const value = Date.UTC(year, 0, 1);
    if (value >= start && value <= end) {
      ticks.push({ year, x: ((value - start) / (end - start)) * width });
    }
  }
  return ticks;
}
