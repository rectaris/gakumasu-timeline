import validationCatalog from "../generated/timeline-validation-catalog.js";
import { validateTimelineContribution } from "../../scripts/worldline-editor-validation.mjs";
import { HttpError, jsonResponse, readJsonBody } from "../responses";
import type {
  AccountActor,
  ChangeRequestStatus,
  ReviewDecision,
  TimelineRole,
} from "../types";
import { hasRole, requireRole } from "./timelineRoles";

type ChangeRequestRow = {
  id: string;
  submitter_account_id: string;
  target_lane_id: string;
  payload_json: string;
  status: ChangeRequestStatus;
  version: number;
  submitted_at: number;
  updated_at: number;
  decision: ReviewDecision | null;
  review_note: string | null;
  decided_at: number | null;
};

const REQUEST_SELECT = `
  SELECT change_requests.id, change_requests.submitter_account_id,
         change_requests.target_lane_id, change_requests.payload_json,
         change_requests.status, change_requests.version,
         change_requests.submitted_at, change_requests.updated_at,
         review_decisions.decision, review_decisions.note AS review_note,
         review_decisions.decided_at
  FROM change_requests
  LEFT JOIN review_decisions ON review_decisions.request_id = change_requests.id`;

const serializeRequest = (row: ChangeRequestRow) => ({
  id: row.id,
  targetLaneId: row.target_lane_id,
  event: JSON.parse(row.payload_json),
  status: row.status,
  version: row.version,
  submittedAt: row.submitted_at,
  updatedAt: row.updated_at,
  review: row.decision
    ? { decision: row.decision, note: row.review_note, decidedAt: row.decided_at }
    : null,
});

export const handleSubmitChangeRequest = async (
  request: Request,
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
  now: number,
): Promise<Response> => {
  requireRole(roles, "contributor");
  const value = await readJsonBody(request, 65536);
  const validation = validateTimelineContribution(value, validationCatalog);
  if (!validation.ok) {
    throw new HttpError(422, "invalid_timeline_change", validation.message);
  }
  const input = value as { targetLaneId: string; event: unknown };
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO change_requests
         (id, submitter_account_id, target_lane_id, payload_json,
          status, version, submitted_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, 'submitted', 1, ?5, ?5)`,
    )
    .bind(id, actor.accountId, input.targetLaneId, JSON.stringify(input.event), now)
    .run();
  return jsonResponse(
    { request: { id, status: "submitted", version: 1, submittedAt: now } },
    201,
  );
};

export const handleListChangeRequests = async (
  url: URL,
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
): Promise<Response> => {
  const scope = url.searchParams.get("scope") ?? "mine";
  let query: D1PreparedStatement;
  if (scope === "review") {
    requireRole(roles, "reviewer");
    query = db
      .prepare(
        `${REQUEST_SELECT}
         WHERE change_requests.status = 'submitted'
         ORDER BY change_requests.submitted_at ASC
         LIMIT 100`,
      );
  } else if (scope === "mine") {
    requireRole(roles, "contributor");
    query = db
      .prepare(
        `${REQUEST_SELECT}
         WHERE change_requests.submitter_account_id = ?1
         ORDER BY change_requests.submitted_at DESC
         LIMIT 100`,
      )
      .bind(actor.accountId);
  } else {
    throw new HttpError(400, "invalid_scope", "The request scope is invalid.");
  }
  const result = await query.all<ChangeRequestRow>();
  return jsonResponse({ requests: result.results.map(serializeRequest) });
};

export const handleGetChangeRequest = async (
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
  requestId: string,
): Promise<Response> => {
  const row = await db
    .prepare(`${REQUEST_SELECT} WHERE change_requests.id = ?1 LIMIT 1`)
    .bind(requestId)
    .first<ChangeRequestRow>();
  if (!row) throw new HttpError(404, "not_found", "The request was not found.");
  if (
    row.submitter_account_id !== actor.accountId &&
    !hasRole(roles, "reviewer")
  ) {
    throw new HttpError(404, "not_found", "The request was not found.");
  }
  return jsonResponse({ request: serializeRequest(row) });
};

export const handleReviewDecision = async (
  request: Request,
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
  requestId: string,
  now: number,
): Promise<Response> => {
  requireRole(roles, "reviewer");
  const value = await readJsonBody(request, 8192);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(422, "invalid_decision", "The review decision is invalid.");
  }
  const input = value as Record<string, unknown>;
  if (
    !["approved", "rejected"].includes(String(input.decision)) ||
    !Number.isInteger(input.version) ||
    (input.note !== undefined &&
      (typeof input.note !== "string" || input.note.length > 4000))
  ) {
    throw new HttpError(422, "invalid_decision", "The review decision is invalid.");
  }
  const decision = input.decision as ReviewDecision;
  const version = input.version as number;
  const note = typeof input.note === "string" && input.note.trim()
    ? input.note.trim()
    : null;
  try {
    const results = await db.batch([
      db
        .prepare(
          `UPDATE change_requests
           SET status = ?2, version = version + 1, updated_at = ?4
           WHERE id = ?1 AND status = 'submitted' AND version = ?3`,
        )
        .bind(requestId, decision, version, now),
      db
        .prepare(
          `INSERT INTO review_decisions
             (id, request_id, reviewer_account_id, decision, note, decided_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
        )
        .bind(crypto.randomUUID(), requestId, actor.accountId, decision, note, now),
    ]);
    if (results[0]?.meta.changes !== 1) {
      throw new Error("optimistic conflict");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("optimistic conflict") ||
      message.includes("constraint failed") ||
      message.includes("review decision must match request status")
    ) {
      throw new HttpError(
        409,
        "review_conflict",
        "The request was already changed. Refresh the review queue.",
      );
    }
    throw error;
  }
  return jsonResponse({ request: { id: requestId, status: decision, version: version + 1 } });
};
