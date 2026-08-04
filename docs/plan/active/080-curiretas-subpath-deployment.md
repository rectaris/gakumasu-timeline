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
  - .node-version
  - .github/workflows/ci.yml
  - .github/workflows/deploy-dev.yml
  - .github/workflows/deploy-main.yml
  - scripts/prepare-cloudflare-assets.mjs
  - wrangler.timeline.jsonc
  - docs/deploy.md
  - docs/agent/SPEC_ENVIRONMENT.md
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
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - The existing /timeline/ and /timeline/dev/ GitHub Pages builds remain unchanged.
  - A separate build produces assets at gakumastool/timeline/ with matching absolute asset URLs.
  - Wrangler dry-run accepts the path route for curiretas.com/gakumastool/timeline/*.
  - Cloudflare Workers Builds deploys main only after npm run verify succeeds.
  - GitHub and repository files contain no Cloudflare deployment credentials.
acceptance_focus:
  - existing URL compatibility
  - subpath asset correctness
  - deployment boundary
expected_output: implementation-and-activation
checked_summary_ja: 現行配信を維持したままmainへのpushでcuriretas.com配下のタイムラインを自動デプロイする。
completion_deferred_reason: Cloudflare Workers Builds Git integration must be activated and verified against a main-branch commit.

## Problem

The Curiretas Worker is live but still depends on owner-run Wrangler uploads.
It needs the same Git-linked production deployment used by the portal and
support-card repositories without changing legacy GitHub Pages publication.

## Goal

Connect the existing Worker to GitHub so validated `main` pushes deploy it
automatically while `dev` and pull requests remain verification-only paths.

## Implementation Instructions

- Preserve the default Vite build and both GitHub Pages deployment targets.
- Pin their Node runtime to the same version used by Workers Builds.
- Build a second artifact whose directory tree mirrors the public URL path.
- Add a dedicated Wrangler configuration that is never used by the existing
  deploy guard or GitHub Pages workflows.
- Keep GitHub Actions credential-free and use it only for verification and the
  legacy Pages publication.
- Activate Workers Builds on the existing production Worker and verify the
  resulting GitHub check and live route.

## Decisions

- Keep `https://rectaris.github.io/timeline/` operational during migration.
- Use `https://curiretas.com/gakumastool/timeline/` as the new canonical target.
- Route only `curiretas.com/gakumastool/timeline/*` to this Worker.
- Mirror the public path in the static artifact instead of adding runtime URL
  rewriting to the timeline application.
- Let the root portal handle the no-trailing-slash redirect.
- Use Cloudflare Workers Builds Git integration instead of storing Cloudflare
  credentials in GitHub Actions.
- Deploy only `main`; keep non-production Workers Builds disabled.
- Use `npm run verify` as the Workers Builds build command and
  `npm run deploy:curiretas` as its deploy command.
- Pin CI and Workers Builds to Node.js 24 through `.node-version`.
- Do not update legacy redirects in this plan.

## Tasks

- [x] Add and validate the isolated Cloudflare asset build.
- [x] Add the owner-gated Wrangler route configuration.
- [x] Update deployment documentation without changing the legacy contract.
- [x] Prepare the Codex handoff for deployment and cutover verification.
- [x] Commit the coherent local preparation.
- [x] Deploy and smoke-test the production route after owner approval.
- [x] Add repository-side configuration and documentation for Git-linked deployment.
- [ ] Connect the existing Worker to `rectaris/gakumasu-timeline`.
- [ ] Verify a `main` push produces a successful Workers Builds check and deployment.

## Validation Notes

Local validation passed for the legacy build, the mounted Cloudflare build,
Wrangler dry-run, 138 unit tests, data integrity, and production publication
boundaries.

Local Wrangler and Chromium smoke checks returned 200 for the base timeline,
story graph, real-world history, and a hashed asset with no failed network
requests or browser console errors.
