import { WorkerEntrypoint } from "cloudflare:workers";

const CONTRIBUTOR_ROLE_ID = "111111111111111111";
const REVIEWER_ROLE_ID = "222222222222222222";
const UNMAPPED_ROLE_ID = "333333333333333333";

const readCredentialValue = (credential) =>
  credential &&
  typeof credential === "object" &&
  Object.keys(credential).length === 2 &&
  typeof credential.name === "string" &&
  typeof credential.value === "string"
    ? credential.value
    : null;

export class DiscordGuildMembershipService extends WorkerEntrypoint {
  async resolveDiscordGuildMembership(credential) {
    const accountId = readCredentialValue(credential);
    if (!accountId) return { accountId: null, outcome: "invalid-session" };

    switch (accountId) {
      case "discord-contributor":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: [CONTRIBUTOR_ROLE_ID],
        };
      case "discord-reviewer":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: [REVIEWER_ROLE_ID],
        };
      case "discord-both":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: [CONTRIBUTOR_ROLE_ID, REVIEWER_ROLE_ID],
        };
      case "discord-unmapped":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: [UNMAPPED_ROLE_ID],
        };
      case "discord-not-linked":
        return { accountId, outcome: "discord-not-linked" };
      case "discord-not-member":
        return { accountId, outcome: "not-guild-member" };
      case "discord-unavailable":
        return { accountId, outcome: "unavailable" };
      case "discord-invalid-session":
        return { accountId: null, outcome: "invalid-session" };
      case "discord-mismatch":
        return {
          accountId: "different-account",
          outcome: "guild-member",
          roleIds: [CONTRIBUTOR_ROLE_ID],
        };
      case "discord-malformed":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: [CONTRIBUTOR_ROLE_ID, CONTRIBUTOR_ROLE_ID],
        };
      case "discord-invalid-role":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: ["not-a-snowflake"],
        };
      case "discord-too-many-roles":
        return {
          accountId,
          outcome: "guild-member",
          roleIds: Array.from({ length: 101 }, (_, index) =>
            (500_000_000_000_000_000n + BigInt(index)).toString(),
          ),
        };
      default:
        return { accountId, outcome: "discord-not-linked" };
    }
  }
}
