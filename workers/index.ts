import { authenticateAccount } from "./auth/accountSession";
import {
  handleGetChangeRequest,
  handleListChangeRequests,
  handleReviewDecision,
  handleSubmitChangeRequest,
} from "./api/changeRequests";
import {
  getActiveRoles,
  handleCurrentRoles,
  handleGrantRole,
  handleListRoleGrants,
  handleRevokeRole,
} from "./api/timelineRoles";
import {
  errorResponse,
  HttpError,
  requireSameOriginMutation,
} from "./responses";

const API_PREFIX = "/gakumastool/timeline/api/authoring";

const routeAuthoringRequest = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  const url = new URL(request.url);
  const auth = await authenticateAccount(request, env.ACCOUNT_SERVICE);
  if (auth.status === "anonymous") {
    return errorResponse(401, "authentication_required", "Authentication is required.");
  }
  if (auth.status === "unavailable") {
    return errorResponse(503, "authoring_unavailable", "Timeline authoring is unavailable.");
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    requireSameOriginMutation(request);
  }

  const actor = auth.actor;
  const roles = await getActiveRoles(env.TIMELINE_DB, actor.accountId);
  const relativePath = url.pathname.slice(API_PREFIX.length);
  const segments = relativePath.split("/").filter(Boolean);
  const now = Date.now();

  if (request.method === "GET" && segments.length === 1 && segments[0] === "me") {
    return handleCurrentRoles(actor, roles);
  }
  if (segments.length === 1 && segments[0] === "roles") {
    if (request.method === "GET") {
      return handleListRoleGrants(env.TIMELINE_DB, roles);
    }
    if (request.method === "POST") {
      return handleGrantRole(request, env.TIMELINE_DB, actor, roles, now);
    }
  }
  if (
    request.method === "DELETE" &&
    segments.length === 2 &&
    segments[0] === "roles"
  ) {
    return handleRevokeRole(
      env.TIMELINE_DB,
      actor,
      roles,
      segments[1],
      now,
    );
  }
  if (segments.length === 1 && segments[0] === "requests") {
    if (request.method === "GET") {
      return handleListChangeRequests(url, env.TIMELINE_DB, actor, roles);
    }
    if (request.method === "POST") {
      return handleSubmitChangeRequest(
        request,
        env.TIMELINE_DB,
        actor,
        roles,
        now,
      );
    }
  }
  if (
    request.method === "GET" &&
    segments.length === 2 &&
    segments[0] === "requests"
  ) {
    return handleGetChangeRequest(
      env.TIMELINE_DB,
      actor,
      roles,
      segments[1],
    );
  }
  if (
    request.method === "POST" &&
    segments.length === 3 &&
    segments[0] === "requests" &&
    segments[2] === "decision"
  ) {
    return handleReviewDecision(
      request,
      env.TIMELINE_DB,
      actor,
      roles,
      segments[1],
      now,
    );
  }
  return errorResponse(404, "not_found", "The endpoint was not found.");
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (!pathname.startsWith(`${API_PREFIX}/`)) {
      return env.ASSETS.fetch(request);
    }
    try {
      return await routeAuthoringRequest(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, error.code, error.message);
      }
      console.error(
        JSON.stringify({
          message: "timeline authoring request failed",
          error: error instanceof Error ? error.name : "unknown",
          path: pathname,
        }),
      );
      return errorResponse(500, "internal_error", "The request could not be completed.");
    }
  },
} satisfies ExportedHandler<Env>;
