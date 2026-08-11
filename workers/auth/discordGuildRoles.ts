import type { TimelineRole, ToolSessionCookie } from "../types";

const DISCORD_SNOWFLAKE_PATTERN = /^[1-9]\d{0,19}$/u;
const ACCOUNT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/u;
const MAXIMUM_DISCORD_ROLE_IDS = 100;
const MAXIMUM_MAPPED_ROLE_IDS = 32;

type DiscordRoleMappings = Readonly<{
  contributor: ReadonlySet<string>;
  reviewer: ReadonlySet<string>;
}>;

type MembershipResult =
  | { accountId: null; outcome: "invalid-session" }
  | { accountId: string | null; outcome: "unavailable" }
  | { accountId: string; outcome: "discord-not-linked" }
  | { accountId: string; outcome: "not-guild-member" }
  | {
      accountId: string;
      outcome: "guild-member";
      roleIds: string[];
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasExactKeys = (
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean => {
  const keys = Object.keys(value).sort();
  return (
    keys.length === expected.length &&
    expected.every((key, index) => keys[index] === key)
  );
};

const readMappedRoleIds = (value: string): ReadonlySet<string> => {
  const trimmed = value.trim();
  if (trimmed === "") return new Set();

  const values = trimmed.split(",").map((roleId) => roleId.trim());
  if (values.length > MAXIMUM_MAPPED_ROLE_IDS) {
    throw new Error("Discord role mapping exceeds the configured limit.");
  }

  const roleIds = new Set<string>();
  for (const roleId of values) {
    if (!DISCORD_SNOWFLAKE_PATTERN.test(roleId) || roleIds.has(roleId)) {
      throw new Error("Discord role mapping is invalid.");
    }
    roleIds.add(roleId);
  }
  return roleIds;
};

export const getDiscordRoleMappings = (
  contributorRoleIds: string,
  reviewerRoleIds: string,
): DiscordRoleMappings => ({
  contributor: readMappedRoleIds(contributorRoleIds),
  reviewer: readMappedRoleIds(reviewerRoleIds),
});

const parseMembershipResult = (
  value: unknown,
  expectedAccountId: string,
): MembershipResult | null => {
  if (!isRecord(value) || typeof value.outcome !== "string") return null;

  if (value.outcome === "invalid-session") {
    return hasExactKeys(value, ["accountId", "outcome"]) &&
      value.accountId === null
      ? { accountId: null, outcome: "invalid-session" }
      : null;
  }

  if (value.outcome === "unavailable") {
    if (
      !hasExactKeys(value, ["accountId", "outcome"]) ||
      (value.accountId !== null &&
        (typeof value.accountId !== "string" ||
          !ACCOUNT_ID_PATTERN.test(value.accountId) ||
          value.accountId !== expectedAccountId))
    ) {
      return null;
    }
    return { accountId: value.accountId, outcome: "unavailable" };
  }

  if (
    value.outcome === "discord-not-linked" ||
    value.outcome === "not-guild-member"
  ) {
    if (
      !hasExactKeys(value, ["accountId", "outcome"]) ||
      value.accountId !== expectedAccountId
    ) {
      return null;
    }
    return { accountId: expectedAccountId, outcome: value.outcome };
  }

  if (
    value.outcome !== "guild-member" ||
    !hasExactKeys(value, ["accountId", "outcome", "roleIds"]) ||
    value.accountId !== expectedAccountId ||
    !Array.isArray(value.roleIds) ||
    value.roleIds.length > MAXIMUM_DISCORD_ROLE_IDS
  ) {
    return null;
  }

  const roleIds: string[] = [];
  const seenRoleIds = new Set<string>();
  for (const roleId of value.roleIds) {
    if (
      typeof roleId !== "string" ||
      !DISCORD_SNOWFLAKE_PATTERN.test(roleId) ||
      seenRoleIds.has(roleId)
    ) {
      return null;
    }
    seenRoleIds.add(roleId);
    roleIds.push(roleId);
  }
  return { accountId: expectedAccountId, outcome: "guild-member", roleIds };
};

const logDiscordAuthorizationUnavailable = (
  reason: "configuration" | "rpc" | "rpc-result",
): void => {
  console.error(
    JSON.stringify({
      message: "discord timeline role lookup unavailable",
      reason,
    }),
  );
};

const callMembershipRpc = async (
  service: object,
  credential: ToolSessionCookie,
): Promise<unknown> => {
  const method: unknown = Reflect.get(
    service,
    "resolveDiscordGuildMembership",
  );
  if (typeof method !== "function") {
    throw new Error("Discord membership RPC is not available.");
  }
  return Reflect.apply(method, service, [credential]);
};

export const getDiscordTimelineRoles = async (
  service: object,
  credential: ToolSessionCookie,
  accountId: string,
  contributorRoleIds: string,
  reviewerRoleIds: string,
): Promise<TimelineRole[]> => {
  let mappings: DiscordRoleMappings;
  try {
    mappings = getDiscordRoleMappings(contributorRoleIds, reviewerRoleIds);
  } catch {
    logDiscordAuthorizationUnavailable("configuration");
    return [];
  }

  if (mappings.contributor.size === 0 && mappings.reviewer.size === 0) {
    return [];
  }

  let rawResult: unknown;
  try {
    rawResult = await callMembershipRpc(service, credential);
  } catch {
    logDiscordAuthorizationUnavailable("rpc");
    return [];
  }

  const result = parseMembershipResult(rawResult, accountId);
  if (!result) {
    logDiscordAuthorizationUnavailable("rpc-result");
    return [];
  }
  if (result.outcome !== "guild-member") return [];

  const memberRoleIds = new Set(result.roleIds);
  const roles: TimelineRole[] = [];
  if ([...mappings.contributor].some((roleId) => memberRoleIds.has(roleId))) {
    roles.push("contributor");
  }
  if ([...mappings.reviewer].some((roleId) => memberRoleIds.has(roleId))) {
    roles.push("reviewer");
  }
  return roles;
};
