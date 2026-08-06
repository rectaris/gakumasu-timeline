import { describe, expect, it, vi } from "vitest";
import {
  LOGOUT_FAILURE_MESSAGE,
  createToolSessionState,
  isToolSessionOrigin,
  parseToolSessionResponse,
  requestToolLogout,
  requestToolSession,
  transitionToolSessionState,
} from "../src/auth/toolSession";

describe("tool session boundary", () => {
  it("accepts only valid anonymous and authenticated responses", () => {
    expect(parseToolSessionResponse({ authenticated: false })).toEqual({
      authenticated: false,
    });
    expect(
      parseToolSessionResponse({
        authenticated: true,
        user: { id: "user-1", displayName: "利用者" },
      }),
    ).toEqual({ authenticated: true });
    expect(parseToolSessionResponse({ authenticated: true })).toEqual({
      authenticated: true,
    });

    expect(() => parseToolSessionResponse(null)).toThrow();
    expect(() =>
      parseToolSessionResponse({ authenticated: "true" }),
    ).toThrow();
  });

  it("enables only the canonical and loopback HTTP origins", () => {
    expect(isToolSessionOrigin("https://curiretas.com/path")).toBe(true);
    expect(isToolSessionOrigin("https://curiretas.com.evil.test/")).toBe(false);
    expect(isToolSessionOrigin("http://localhost:5173/timeline/")).toBe(true);
    expect(isToolSessionOrigin("https://127.0.0.1:4173/")).toBe(true);
    expect(isToolSessionOrigin("http://[::1]:5173/")).toBe(true);
    expect(isToolSessionOrigin("https://rectaris.github.io/timeline/")).toBe(
      false,
    );
    expect(isToolSessionOrigin("file:///tmp/index.html")).toBe(false);
    expect(isToolSessionOrigin("not a URL")).toBe(false);
  });

  it("deduplicates concurrent session checks and uses the exact request contract", async () => {
    let resolveResponse;
    const fetchImpl = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    const firstRequest = requestToolSession(fetchImpl);
    const secondRequest = requestToolSession(fetchImpl);
    expect(firstRequest).toBe(secondRequest);
    expect(fetchImpl).toHaveBeenCalledTimes(0);

    await Promise.resolve();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith("/auth/session", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    resolveResponse(
      new Response(
        JSON.stringify({
          authenticated: true,
          user: { id: "user-1", displayName: "利用者" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    await expect(firstRequest).resolves.toEqual({ authenticated: true });
    await expect(secondRequest).resolves.toEqual({ authenticated: true });
  });

  it("uses one same-origin POST for logout and reports failure", async () => {
    const successfulFetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ loggedOut: true }))),
    );
    await expect(requestToolLogout(successfulFetch)).resolves.toBeUndefined();
    expect(successfulFetch).toHaveBeenCalledTimes(1);
    expect(successfulFetch).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const failedFetch = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 503 })),
    );
    await expect(requestToolLogout(failedFetch)).rejects.toThrow(
      LOGOUT_FAILURE_MESSAGE,
    );
  });

  it("keeps logout transitions explicit and retryable", () => {
    const authenticated = transitionToolSessionState(
      createToolSessionState(),
      { type: "session-authenticated" },
    );
    expect(authenticated).toEqual({
      status: "authenticated",
      logoutError: "",
    });

    const loggingOut = transitionToolSessionState(authenticated, {
      type: "logout-started",
    });
    expect(loggingOut.status).toBe("logging-out");

    const failed = transitionToolSessionState(loggingOut, {
      type: "logout-failed",
    });
    expect(failed).toEqual({
      status: "authenticated",
      logoutError: LOGOUT_FAILURE_MESSAGE,
    });
    expect(
      transitionToolSessionState(failed, { type: "logout-started" }).status,
    ).toBe("logging-out");
    expect(
      transitionToolSessionState(loggingOut, { type: "logout-succeeded" }),
    ).toEqual({ status: "anonymous", logoutError: "" });
  });
});
