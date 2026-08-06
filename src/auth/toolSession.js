export const TOOL_LOGIN_URL =
  "https://curiretas.com/auth/login?return_to=%2Fgakumastool%2Ftimeline%2F";
export const ACCOUNT_PAGE_URL = "https://accounts.curiretas.com/";
export const LOGOUT_FAILURE_MESSAGE =
  "ログアウトできませんでした。もう一度お試しください。";

const INVALID_SESSION_RESPONSE_MESSAGE =
  "セッション応答の形式が正しくありません。";

let inFlightSessionRequest = null;

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

export function isToolSessionOrigin(locationOrUrl) {
  const url = toUrl(locationOrUrl);
  if (!url) return false;
  if (url.origin === "https://curiretas.com") return true;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

export function parseToolSessionResponse(value) {
  if (!value || typeof value !== "object") {
    throw new Error(INVALID_SESSION_RESPONSE_MESSAGE);
  }
  if (value.authenticated === false) return { authenticated: false };
  if (value.authenticated !== true) {
    throw new Error(INVALID_SESSION_RESPONSE_MESSAGE);
  }
  return { authenticated: true };
}

export function requestToolSession(fetchImpl = globalThis.fetch) {
  if (inFlightSessionRequest) return inFlightSessionRequest;

  inFlightSessionRequest = Promise.resolve()
    .then(() =>
      fetchImpl("/auth/session", {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }),
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error("ログイン状態を確認できませんでした。");
      }
      return response.json();
    })
    .then(parseToolSessionResponse)
    .finally(() => {
      inFlightSessionRequest = null;
    });

  return inFlightSessionRequest;
}

export async function requestToolLogout(fetchImpl = globalThis.fetch) {
  const response = await fetchImpl("/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(LOGOUT_FAILURE_MESSAGE);
}

export function createToolSessionState(status = "checking") {
  return { status, logoutError: "" };
}

export function transitionToolSessionState(currentState, event) {
  switch (event.type) {
    case "session-authenticated":
      return createToolSessionState("authenticated");
    case "session-anonymous":
      return createToolSessionState("anonymous");
    case "session-unavailable":
      return createToolSessionState("unavailable");
    case "logout-started":
      return currentState.status === "authenticated"
        ? createToolSessionState("logging-out")
        : currentState;
    case "logout-succeeded":
      return createToolSessionState("anonymous");
    case "logout-failed":
      return {
        status: "authenticated",
        logoutError: LOGOUT_FAILURE_MESSAGE,
      };
    default:
      return currentState;
  }
}
