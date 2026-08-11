# Integrate account Worker Discord guild membership RPC with timeline roles.

status: checked
task_types:
  - planning_docs
  - product_logic
  - environment_data_flow
  - security
  - japanese_prose
  - referent_first
  - decision_audit
review_class: C
human_design_required: yes
human_approval_status: approved
write_scope:
  - package.json
  - wrangler.timeline.jsonc
  - worker-configuration.d.ts
  - workers/auth/accountSession.ts
  - workers/auth/discordGuildRoles.ts
  - workers/api/timelineRoles.ts
  - workers/index.ts
  - tests/worker/authoringWorker.test.ts
  - tests/worker/discord-membership-service.mjs
  - vitest.worker.config.js
  - docs/deploy.md
  - docs/narrative-timeline/authoring.md
  - docs/plan/
context_files:
  - ../curiretas-account/src/worker/discord-guild-membership.ts
  - ../curiretas-account/src/worker/session.ts
  - ../curiretas-account/src/worker/config.ts
  - ../curiretas-account/wrangler.jsonc
  - ../curiretas-account/docs/agent/PROJECT_AUTHENTICATION.md
  - ../curiretas-account/docs/agent/PROJECT_ENVIRONMENT.md
target_json:
  - none
required_specs:
  - docs/agent/PROJECT_POLICY.md
  - .project-agent-workflow/docs/agent/SPEC_VALIDATION.md
  - .project-agent-workflow/docs/agent/SPEC_GIT_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_FILE_MANAGEMENT.md
  - .project-agent-workflow/docs/agent/SPEC_USER_COMMUNICATION.md
  - .project-agent-workflow/docs/agent/SPEC_HUMAN_REPORTING.md
  - .project-agent-workflow/docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_DECISION_AUDIT.md
  - .project-agent-workflow/docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/PROJECT_ENVIRONMENT.md
  - .project-agent-workflow/docs/agent/SPEC_SECURITY.md
  - .project-agent-workflow/docs/agent/SPEC_EXTERNAL_SERVICES.md
  - .project-agent-workflow/docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - .project-agent-workflow/docs/agent/SPEC_REFERENT_FIRST.md
validation:
  - git diff --check
  - npm run verify
  - python3 .project-agent-workflow/scripts/security-static-check.py --changed
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - python3 .project-agent-workflow/scripts/lint-plan-docs.py
acceptance:
  - The timeline Worker keeps its existing HTTP session Service Binding and adds a separate binding to the account Worker's named `DiscordGuildMembershipService` entrypoint.
  - The RPC receives only the allowlisted gakumastool cookie name and value, and the caller validates every returned branch, account identity, role count, and Discord snowflake before authorization.
  - Effective timeline roles are the duplicate-free union of active D1 grants and validated Discord-derived contributor or reviewer roles for the same authenticated account.
  - Discord cannot grant `admin`; role administration remains authorized only by an active D1 admin grant.
  - RPC errors, unavailable or negative outcomes, account mismatches, and malformed results grant no Discord-derived role while explicit D1 grants remain usable.
  - Empty bounded role-id mappings keep Discord authorization disabled until owner-selected ids and account-side membership are configured and deployed.
  - Worker tests cover positive mappings, D1 composition, admin exclusion, negative outcomes, malformed results, identity mismatch, and RPC failure without contacting Discord.
  - Operator documentation records both Service Bindings, mapping variables, activation order, rollback, and the boundary that deployment and secret changes remain separate.
acceptance_focus:
  - Preserve the private identity-safe account RPC contract.
  - Fail closed for Discord-derived authority without invalidating independent D1 grants.
  - Keep production values, deployment, and Discord mutations outside this implementation.
checked_summary_ja: Discordサーバーのロールをタイムラインの投稿者・審査者権限へ安全に対応付ける。

## Problem

The timeline Worker can authorize only application-owned D1 grants even though
the account Worker now exposes current Discord guild role ids through a private
named RPC. Replacing the existing account Service Binding would break HTTP
session validation, while trusting an unvalidated RPC result or allowing
Discord to grant administrator authority would weaken the current boundary.

## Goal

Consume the account Worker's named membership RPC and map current Discord role
ids to timeline contributor and reviewer roles. Preserve existing D1 grants,
the public authoring API shape, the Git publication boundary, and D1-only
administrator authority.

## Contract Definitions

- The allowlisted gakumastool session cookie name and opaque value selected from the incoming authoring request.
- The validated RPC result whose account id matches the authenticated actor and whose guild-member branch contains at most 100 unique Discord snowflake role ids.
- Effective timeline roles means the duplicate-free union of active D1 grants and validated Discord-derived contributor or reviewer roles for the authenticated account.
- The branch that adds no Discord-derived role when the RPC throws, returns unavailable, returns invalid-session, mismatches the authenticated account, or returns malformed data.

## Implementation Instructions

Keep `ACCOUNT_SERVICE` bound to the account Worker's default HTTP entrypoint and
add `DISCORD_MEMBERSHIP_SERVICE` bound to `DiscordGuildMembershipService`.
Represent the consumer-owned contributor and reviewer mappings as bounded,
comma-separated Worker variables that default to empty strings.

Change the cookie selector to return the exact `{ name, value }` credential
accepted by the account RPC while constructing the same filtered Cookie header
for `/auth/session`. After HTTP authentication and the D1 lookup, call the
named RPC with that credential, validate the discriminated result at the
repository boundary, require the returned account id to equal the authenticated
actor, and map only unique valid Discord snowflakes.

Define effective timeline roles as the duplicate-free union of active D1 grants
and validated Discord-derived `contributor` or `reviewer` roles. Never derive
`admin` from Discord. On unavailable, negative, mismatched, malformed, or thrown
RPC outcomes, add no Discord-derived role and continue with explicit D1 grants.

Use a local auxiliary WorkerEntrypoint in Worker tests so the integration suite
exercises actual named Service Binding RPC without importing the sibling
repository or contacting Discord. Document configuration, activation order,
rollback, and the intentionally separate production deployment steps.

## Decisions

- Keep the default HTTP and named RPC account entrypoints on separate Service Bindings.
- Keep application-role mapping in this repository and make empty mappings the committed default.
- Compose D1 and Discord-derived contributor or reviewer roles; keep administrator authority D1-only.
- Treat all non-positive or invalid RPC results as no Discord-derived authority, without removing independently active D1 grants.
- Do not cache or persist Discord membership and role snapshots.
- Do not deploy, install a Bot, upload secrets, enable account-side membership, or select production guild and role ids in this plan.

## Tasks

- [x] Add the named RPC binding and bounded role mapping configuration.
- [x] Implement cookie credential reuse, RPC result validation, role mapping, and D1 composition.
- [x] Add focused unit and Worker integration coverage for positive and fail-closed branches.
- [x] Document the configuration, activation, rollback, and ownership boundaries.
- [x] Run the complete local validation set, archive the plan, and commit the implementation.

## Validation Notes

- 2026-08-11: Inspected `curiretas-account` commit `604eead`, including its named `DiscordGuildMembershipService`, exact session-cookie credential, bounded discriminated result, disabled production configuration, and application-owned role-mapping boundary.
- 2026-08-11: `npm run check:worker` passed generated binding freshness and strict Worker TypeScript checking.
- 2026-08-11: `npm run verify` passed generated-data freshness, timeline and intake validation, 144 core tests, 20 Worker tests, authoring UI verification, the Vite build, and the production publication-boundary check.
- 2026-08-11: `npm run build:curiretas` passed and prepared the subpath assets.
- 2026-08-11: `npx wrangler deploy --dry-run --config wrangler.timeline.jsonc` resolved `ACCOUNT_SERVICE`, `DISCORD_MEMBERSHIP_SERVICE` with the `DiscordGuildMembershipService` entrypoint, both empty mapping variables, D1, and assets. It reported a 52.12 KiB upload and performed no deployment.
- 2026-08-11: `npm audit --audit-level=high` reported zero vulnerabilities.
- 2026-08-11: Changed-file static security, change-aware validation, plan lint, plan format, and `git diff --check` passed.
- Production Discord guild and role ids, Bot installation, secret upload, account-side activation, deployment, and live verification were intentionally not performed. Both committed mapping variables remain empty and grant no Discord-derived authority.
