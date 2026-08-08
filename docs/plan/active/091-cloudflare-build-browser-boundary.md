# Keep browser verification outside Cloudflare Workers Builds.

status: active
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - package.json
  - scripts/run-verify-tests.mjs
  - docs/deploy.md
  - docs/processing-flow.md
  - docs/agent/SPEC_ENVIRONMENT.md
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
  - npm run verify
  - WORKERS_CI=1 PLAYWRIGHT_BROWSERS_PATH=/definitely-missing npm run verify
  - npm run build:curiretas
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - git diff --check
acceptance:
  - Normal and GitHub verification continue to run Node, Worker, and Playwright UI tests.
  - With `WORKERS_CI=1`, verification runs Node and Worker tests, both build and production artifact checks, but does not launch Playwright.
  - Cloudflare Workers Builds does not need to download a browser or install browser system dependencies.
  - The GitHub Actions Playwright gate remains unchanged.
acceptance_focus:
  - Workers Builds runtime boundary
  - retained browser regression gate
expected_output: implementation-and-pr
checked_summary_ja: Cloudflare Workers Buildsではブラウザ不要の検証を実行し、Playwright UI検証はGitHub Actionsで維持する。

## Decisions

- Use the Cloudflare-provided `WORKERS_CI=1` environment variable to select the browserless verification path.
- Keep `npm run test` and normal `npm run verify` as full test paths, including Playwright UI verification.
- Keep the Cloudflare dashboard build command as `npm run verify`; place the environment-specific selection in version-controlled code.

## Tasks

- [x] Split the reusable Node and Worker test chain from the full test command.
- [x] Select the browserless chain only in Cloudflare Workers Builds.
- [x] Document the CI responsibility boundary.
- [ ] Validate both verification paths, commit, push `dev`, and open a PR to `main`.

## Validation Notes

- Normal `npm run verify` passed 144 Node tests, 7 Worker tests, Playwright UI verification, the Vite build, and the production publication boundary check.
- `WORKERS_CI=1 PLAYWRIGHT_BROWSERS_PATH=/definitely-missing npm run verify` passed without launching Playwright, while retaining 144 Node tests, 7 Worker tests, the Vite build, and the production publication boundary check.
- `npm run build:curiretas` prepared the canonical `/gakumastool/timeline/` Worker assets successfully.
- Plan lint, plan format, `git diff --check`, change-aware validation, the static security check, and the structure map check passed.
