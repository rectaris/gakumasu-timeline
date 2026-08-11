import { readLimitedText } from "../responses";
import type { AuthResult, ToolSessionCookie } from "../types";

const SESSION_COOKIE_NAMES = [
  "__Host-curiretas_gakumastool_session",
  "curiretas_gakumastool_session",
] as const;
const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/u;
const MAXIMUM_SESSION_RESPONSE_BYTES = 4096;

export const selectToolSessionCookie = (
  request: Request,
): ToolSessionCookie | null => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const cookies = new Map<string, string>();
  for (const segment of cookieHeader.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 1) continue;
    cookies.set(
      segment.slice(0, separator).trim(),
      segment.slice(separator + 1).trim(),
    );
  }
  for (const name of SESSION_COOKIE_NAMES) {
    const value = cookies.get(name);
    if (value) return { name, value };
  }
  return null;
};

const serializeToolSessionCookie = (cookie: ToolSessionCookie): string =>
  `${cookie.name}=${cookie.value}`;

const parseAuthenticatedAccountId = (value: unknown): string | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const session = value as Record<string, unknown>;
  if (session.authenticated === false) return "";
  if (session.authenticated !== true) return null;
  const user = session.user;
  if (!user || typeof user !== "object" || Array.isArray(user)) return null;
  const accountId = (user as Record<string, unknown>).id;
  return typeof accountId === "string" && ACCOUNT_ID_PATTERN.test(accountId)
    ? accountId
    : null;
};

export const authenticateAccount = async (
  request: Request,
  accountService: Fetcher,
): Promise<AuthResult> => {
  const cookie = selectToolSessionCookie(request);
  if (!cookie) return { status: "anonymous" };

  try {
    const response = await accountService.fetch(
      new Request("https://curiretas.com/auth/session", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: serializeToolSessionCookie(cookie),
        },
      }),
    );
    const contentLength = response.headers.get("Content-Length");
    if (
      !response.ok ||
      !response.headers.get("Content-Type")?.toLowerCase().startsWith("application/json") ||
      (contentLength && Number(contentLength) > MAXIMUM_SESSION_RESPONSE_BYTES)
    ) {
      return { status: "unavailable" };
    }
    const text = await readLimitedText(
      response.body,
      MAXIMUM_SESSION_RESPONSE_BYTES,
    );
    const accountId = parseAuthenticatedAccountId(JSON.parse(text));
    if (accountId === "") return { status: "anonymous" };
    return accountId
      ? { status: "authenticated", actor: { accountId }, credential: cookie }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
};
