# Prepare the curiretas.com timeline deployment.

status: active
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - package.json
  - package-lock.json
  - .gitignore
  - scripts/prepare-cloudflare-assets.mjs
  - wrangler.timeline.jsonc
  - docs/deploy.md
  - docs/plan/handoffs/080-curiretas-subpath-deployment/request.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run build
  - npm run build:curiretas
  - npx --yes wrangler@4.118.0 deploy --dry-run --config wrangler.timeline.jsonc
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - The existing /timeline/ and /timeline/dev/ GitHub Pages builds remain unchanged.
  - A separate build produces assets at gakumastool/timeline/ with matching absolute asset URLs.
  - Wrangler dry-run accepts the path route for curiretas.com/gakumastool/timeline/*.
  - Deployment and legacy redirect activation remain explicit owner-approved actions.
acceptance_focus:
  - existing URL compatibility
  - subpath asset correctness
  - deployment boundary
expected_output: implementation-and-handoff
checked_summary_ja: 現行配信を維持したまま curiretas.com 配下へのタイムライン配信準備を行う。
completion_deferred_reason: Production routing and deployment require Cloudflare owner access and explicit cutover approval.

## Problem

The production build currently targets only the legacy GitHub Pages path.
The new Cloudflare path must be prepared without changing that output or
publishing an unreviewed route.

## Goal

Add an isolated Cloudflare deployment artifact and an exact Codex handoff for
the remaining owner-gated deployment work.

## Implementation Instructions

- Keep the default Vite build and both GitHub Pages workflows unchanged.
- Build a second artifact whose directory tree mirrors the public URL path.
- Add a dedicated Wrangler configuration that is never used by the existing
  deploy guard or GitHub Pages workflows.
- Validate source output and Wrangler configuration without authenticating or
  deploying to Cloudflare.
- Record the remaining cutover sequence in a structured handoff request.

## Decisions

- Keep `https://rectaris.github.io/timeline/` operational during migration.
- Use `https://curiretas.com/gakumastool/timeline/` as the new canonical target.
- Route only `curiretas.com/gakumastool/timeline/*` to this Worker.
- Mirror the public path in the static artifact instead of adding runtime URL
  rewriting to the timeline application.
- Let the root portal handle the no-trailing-slash redirect.
- Do not deploy or update legacy redirects in this plan.

## Tasks

- [x] Add and validate the isolated Cloudflare asset build.
- [x] Add the owner-gated Wrangler route configuration.
- [x] Update deployment documentation without changing the legacy contract.
- [x] Prepare the Codex handoff for deployment and cutover verification.
- [x] Commit the coherent local preparation.
- [ ] Deploy and smoke-test the production route after owner approval.

## Validation Notes

Local validation passed for the legacy build, the mounted Cloudflare build,
Wrangler dry-run, 138 unit tests, data integrity, and production publication
boundaries.

Local Wrangler and Chromium smoke checks returned 200 for the base timeline,
story graph, real-world history, and a hashed asset with no failed network
requests or browser console errors.
