const API_ROOT = "/gakumastool/timeline/api/authoring";

export class TimelineAuthoringError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "TimelineAuthoringError";
    this.status = status;
    this.code = code;
  }
}

function toUrl(locationOrUrl) {
  try {
    if (locationOrUrl instanceof URL) return locationOrUrl;
    if (typeof locationOrUrl === "string") return new URL(locationOrUrl);
    if (locationOrUrl && typeof locationOrUrl.origin === "string") {
      return new URL(locationOrUrl.origin);
    }
  } catch {
    return null;
  }
  return null;
}

export function isTimelineAuthoringOrigin(locationOrUrl) {
  const url = toUrl(locationOrUrl);
  if (!url) return false;
  if (url.origin === "https://curiretas.com") return true;
  return (
    ["http:", "https:"].includes(url.protocol) &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  );
}

async function requestJson(path, { method = "GET", body, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${API_ROOT}${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new TimelineAuthoringError(
      response.status || 503,
      "invalid_response",
      "投稿機能から正しい応答を受け取れませんでした。",
    );
  }
  if (!response.ok) {
    throw new TimelineAuthoringError(
      response.status,
      payload?.error?.code ?? "request_failed",
      payload?.error?.message ?? "投稿機能を利用できません。",
    );
  }
  return payload;
}

export async function requestTimelineAuthoringRoles(fetchImpl = fetch) {
  try {
    const payload = await requestJson("/me", { fetchImpl });
    if (!Array.isArray(payload?.roles) || !payload.roles.every((role) =>
      ["contributor", "reviewer", "admin"].includes(role))) {
      throw new TimelineAuthoringError(
        503,
        "invalid_response",
        "投稿権限を確認できませんでした。",
      );
    }
    return { status: "ready", roles: payload.roles };
  } catch (error) {
    if (error instanceof TimelineAuthoringError && error.status === 401) {
      return { status: "anonymous", roles: [] };
    }
    if (error instanceof TimelineAuthoringError && error.status === 403) {
      return { status: "forbidden", roles: [] };
    }
    return { status: "unavailable", roles: [] };
  }
}

export const listOwnTimelineRequests = (fetchImpl = fetch) =>
  requestJson("/requests?scope=mine", { fetchImpl });

export const listTimelineReviewQueue = (fetchImpl = fetch) =>
  requestJson("/requests?scope=review", { fetchImpl });

export const submitTimelineContribution = (payload, fetchImpl = fetch) =>
  requestJson("/requests", { method: "POST", body: payload, fetchImpl });

export const decideTimelineRequest = (
  requestId,
  decision,
  version,
  note,
  fetchImpl = fetch,
) =>
  requestJson(`/requests/${encodeURIComponent(requestId)}/decision`, {
    method: "POST",
    body: { decision, version, note },
    fetchImpl,
  });
