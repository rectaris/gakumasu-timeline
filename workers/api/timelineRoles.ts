import { HttpError, jsonResponse, readJsonBody } from "../responses";
import {
  TIMELINE_ROLES,
  type AccountActor,
  type TimelineRole,
} from "../types";

type RoleRow = {
  id: string;
  account_id: string;
  role: TimelineRole;
  granted_by_account_id: string;
  granted_at: number;
  revoked_by_account_id: string | null;
  revoked_at: number | null;
};

const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/u;

export const getActiveRoles = async (
  db: D1Database,
  accountId: string,
): Promise<TimelineRole[]> => {
  const result = await db
    .prepare(
      `SELECT role FROM role_grants
       WHERE account_id = ?1 AND revoked_at IS NULL
       ORDER BY role`,
    )
    .bind(accountId)
    .all<{ role: TimelineRole }>();
  return result.results.map((row) => row.role);
};

export const hasRole = (
  roles: readonly TimelineRole[],
  required: TimelineRole,
): boolean => roles.includes("admin") || roles.includes(required);

export const requireRole = (
  roles: readonly TimelineRole[],
  required: TimelineRole,
): void => {
  if (!hasRole(roles, required)) {
    throw new HttpError(403, "forbidden", "The account does not have permission.");
  }
};

export const handleCurrentRoles = (
  actor: AccountActor,
  roles: TimelineRole[],
): Response => jsonResponse({ authenticated: true, roles });

export const handleListRoleGrants = async (
  db: D1Database,
  roles: TimelineRole[],
): Promise<Response> => {
  requireRole(roles, "admin");
  const result = await db
    .prepare(
      `SELECT id, account_id, role, granted_by_account_id, granted_at,
              revoked_by_account_id, revoked_at
       FROM role_grants
       ORDER BY granted_at DESC
       LIMIT 200`,
    )
    .all<RoleRow>();
  return jsonResponse({ grants: result.results });
};

export const handleGrantRole = async (
  request: Request,
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
  now: number,
): Promise<Response> => {
  requireRole(roles, "admin");
  const value = await readJsonBody(request, 4096);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(422, "invalid_role_grant", "The role grant is invalid.");
  }
  const input = value as Record<string, unknown>;
  if (
    typeof input.accountId !== "string" ||
    !ACCOUNT_ID_PATTERN.test(input.accountId) ||
    typeof input.role !== "string" ||
    !TIMELINE_ROLES.includes(input.role as TimelineRole)
  ) {
    throw new HttpError(422, "invalid_role_grant", "The role grant is invalid.");
  }
  const id = crypto.randomUUID();
  try {
    await db
      .prepare(
        `INSERT INTO role_grants
           (id, account_id, role, granted_by_account_id, granted_at)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .bind(id, input.accountId, input.role, actor.accountId, now)
      .run();
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      throw new HttpError(409, "role_already_active", "That role is already active.");
    }
    throw error;
  }
  return jsonResponse({ grant: { id, accountId: input.accountId, role: input.role } }, 201);
};

export const handleRevokeRole = async (
  db: D1Database,
  actor: AccountActor,
  roles: TimelineRole[],
  grantId: string,
  now: number,
): Promise<Response> => {
  requireRole(roles, "admin");
  const result = await db
    .prepare(
      `UPDATE role_grants
       SET revoked_by_account_id = ?2, revoked_at = ?3
       WHERE id = ?1 AND revoked_at IS NULL`,
    )
    .bind(grantId, actor.accountId, now)
    .run();
  if (result.meta.changes !== 1) {
    throw new HttpError(409, "role_not_active", "The role grant is not active.");
  }
  return jsonResponse({ revoked: true });
};
