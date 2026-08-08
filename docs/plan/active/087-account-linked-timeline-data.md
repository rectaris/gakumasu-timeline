# Add account-linked timeline roles and change requests with an application-owned D1 database.

status: active
task_type: tooling
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - package.json
  - wrangler.timeline.jsonc
  - worker-configuration.d.ts
  - workers/index.ts
  - workers/types.ts
  - workers/auth/accountSession.ts
  - workers/api/timelineRoles.ts
  - workers/api/changeRequests.ts
  - workers/migrations/0001_timeline_authoring.sql
  - src/ApplicationRoot.vue
  - src/auth/timelineAuthoring.js
  - src/components/TimelineContribution.vue
  - src/components/TimelineReviewQueue.vue
  - scripts/worldline-editor-api.mjs
  - scripts/worldline-editor-validation.mjs
  - tests/
  - docs/deploy.md
  - docs/narrative-timeline/authoring.md
  - docs/manual/worldline-data-editor.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_DECISION_AUDIT.md
validation:
  - git diff --check
  - npm run validate:data
  - npm run test
  - npm run check:worker
  - npm run build:curiretas
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
acceptance:
  - A dedicated remote D1 database is created for timeline authorization and change requests, and its binding and migrations are owned by this repository.
  - The timeline Worker obtains the stable account id through a Cloudflare Service Binding to the account Worker and never accepts a client-supplied user id as identity.
  - Contributor, reviewer, and administrator permissions are enforced by the Worker, and grants, revocations, submissions, and review decisions retain actor and timestamp audit fields.
  - Authorized users can submit schema-valid timeline additions and reviewers can approve or reject them without allowing D1 to mutate published timeline data directly.
  - Git-managed raw JSON and its generated assets remain the publication source of truth, and the existing development editor keeps its local repository-write behavior.
  - Anonymous timeline reading, legacy hosting, shared URLs, canonical ids, and all existing timeline modes remain unchanged.
acceptance_focus:
  - account-derived authorization and IDOR prevention
  - audited role and review-state transitions
  - Git remains the publication boundary
expected_output: full-implementation
checked_summary_ja: タイムライン用D1にアカウント別ロール、追加申請、審査履歴を保存する。

## Problem

The production timeline deployment currently serves static assets and has no
application-owned database or authenticated write API.
The development-only worldline editor rewrites repository JSON through a local
Vite endpoint, so adding an account role alone cannot safely enable production
contributions.

## Goal

Provision a timeline-owned D1 database and Worker API that associate role grants
and proposed additions with the stable Curiretas account id.
Allow authenticated submission and review while preserving Git-managed source
data as the only publication path.

## Implementation Instructions

1. Before remote mutation, run the current Wrangler identity and D1-listing
   commands to confirm the intended Cloudflare account and that the selected
   database name is unused.
   Create `gakumasu-timeline-prod` with the Asia-Pacific location hint, record
   the returned database id in `wrangler.timeline.jsonc`, and record the actual
   placement reported by Cloudflare without claiming that the hint guarantees
   storage in Japan.
2. Convert the Curiretas deployment from assets-only configuration to a Worker
   with an assets binding.
   Keep the existing `/gakumastool/timeline/` route and static asset behavior,
   and run Worker code first only for the new application API paths.
3. Bind the database as `TIMELINE_DB` with repository-owned migrations.
   Add tables for active and revoked role grants, proposed timeline changes,
   review decisions, and immutable audit timestamps.
   Use the stable account id as a logical reference only; do not add account
   profile fields or assume a cross-database foreign key.
4. Add an `ACCOUNT_SERVICE` Service Binding to the existing
   `curiretas-account` Worker.
   Forward only the tool-host session cookie needed by the existing
   `GET /auth/session` contract, validate its response, derive the account id
   server-side, return generic authentication failures, and never log raw
   cookies or session tokens.
5. Define the minimum roles `contributor`, `reviewer`, and `admin`.
   Contributors may create and inspect their own requests; reviewers may list
   and decide submitted requests; administrators may grant or revoke roles.
   Require one explicit, repository-documented bootstrap operation using a
   human-selected stable account id before any administrator-only API is usable.
6. Add same-origin, no-store JSON endpoints beneath the timeline mount path for
   current-role inspection, role administration, request submission, request
   listing, and review decisions.
   Require exact same-origin `Origin` checks for mutations, prepared statements,
   indexed account and status lookups, bounded payload sizes, and explicit
   allowed status transitions with optimistic conflict handling.
7. Extract the reusable worldline payload validation from the development Vite
   endpoint into a side-effect-free module.
   Apply the same structural and semantic validation before writing a proposed
   change to D1, while keeping the local editor's repository-write endpoint
   development-only.
8. Add an authenticated contribution surface and a reviewer queue without
   exposing controls to anonymous users or users without the required role.
   Show truthful loading, unavailable, forbidden, submitted, conflict, approved,
   and rejected states, and keep keyboard and mobile behavior accessible.
9. Keep approval separate from publication.
   An approved D1 record must be exported or manually translated into a reviewed
   repository change, passed through existing data generation and validation,
   and committed before it can reach public generated assets.
   Do not implement automatic D1-to-production publication in this plan.
10. Add Worker tests for session validation, role enforcement, IDOR attempts,
    origin checks, input limits, status transitions, concurrent review, and
    audit fields.
    Add UI tests for anonymous, contributor, reviewer, failure, and narrow
    viewport states.
    Validate local migrations before applying them remotely, apply the remote
    migration to the newly created database, deploy the account Worker first
    only if its compatible contract changed, and deploy the timeline Worker
    after the Service Binding target exists.
11. Update authoring and deployment documentation with the database name,
    binding, migration commands, first-administrator procedure, review and Git
    publication boundary, recovery/export procedure, and account-deletion
    follow-up.

## Decisions

- Timeline roles and proposed additions are application data owned by this
  repository, not records in the account database.
- The timeline Worker validates the tool-host session through a Service Binding
  to the account Worker and derives the stable account id server-side.
- An approved D1 request is converted into a reviewed Git change; D1 does not
  directly mutate public timeline JSON.
- The remote D1 database name is `gakumasu-timeline-prod` and the Worker binding
  is `TIMELINE_DB`.
- The application Worker validates the existing tool-host session through the
  `ACCOUNT_SERVICE` Service Binding; it does not access account D1 directly or
  call the account Worker through public HTTP.
- Published raw JSON and generated assets remain the source of truth.
- D1 approval does not publish data automatically.
- Role assignment uses stable account ids and never email addresses.
- The first administrator id is an implementation-time human input and must not
  be committed as a fixed production identity.
- Database deletion, application-data deletion after account deletion, and
  retention durations require explicit documented operations; no cross-D1
  cascade is assumed.

## Tasks

- [ ] Provision and bind the timeline-owned D1 database.
- [ ] Add migrations, the runtime Worker, and account-session validation.
- [ ] Implement and test roles, change requests, reviews, and audit records.
- [ ] Add accessible contributor and reviewer surfaces.
- [ ] Preserve and document the reviewed Git publication boundary.
- [ ] Apply remote migrations, deploy in dependency order, and record validation.

## Validation Notes
