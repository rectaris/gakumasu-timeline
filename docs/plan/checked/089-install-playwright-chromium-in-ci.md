# Install the Playwright Chromium runtime before CI tests.

status: active
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: approved
target_files:
  - .github/workflows/ci.yml
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npx playwright install --dry-run chromium
  - npm run test
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - GitHub Actions CI
acceptance:
  - GitHub Actions installs the Playwright Chromium binary and required system packages after Node dependencies.
  - The existing UI test runs unchanged instead of failing because the browser executable is missing.
  - No application behavior, test expectations, dependency versions, secrets, or deployment settings change.
acceptance_focus:
  - Playwright runtime availability
  - minimal workflow-only fix
expected_output: implementation-and-pr-update
checked_summary_ja: CIでPlaywrightのChromiumをインストールし、UIテストを実行可能にする。

## Decisions

- Use Playwright's existing CLI and pinned package version; do not add a dependency.
- Install only Chromium, which is the browser launched by the current UI verification script.
- Use `--with-deps` so the GitHub-hosted Ubuntu runner receives required system libraries.

## Tasks

- [x] Add the Chromium installation step after `npm ci`.
- [x] Validate the Playwright command, full test suite, and workflow security checks.
- [x] Commit and push the fix to PR #8.
- [x] Confirm the replacement GitHub Actions CI run passes.

## Validation Notes

- Failed CI runs `31252815274` and `31252833855` reached the Playwright UI test after 144 Node tests and 7 Worker tests passed, then failed because `chromium_headless_shell-1217` was absent from the runner cache.
- The user approved the focused CI workflow fix.
- `npx playwright install --dry-run chromium` resolved Chromium and Headless Shell revision 1217 from the existing Playwright package.
- `npm run test` passed 144 Node tests, 7 Worker tests, and the Playwright UI verification.
- Plan lint, plan format, `git diff --check`, change-aware validation, and `python3 scripts/security-static-check.py` passed.
- `actionlint` is not installed locally; GitHub Actions will provide the authoritative workflow execution check.
- Commit `9cfa3d6` was pushed to `dev` and added to draft PR #8.
- The replacement GitHub Actions checks passed: both CI validate runs, all CodeQL analyses, both secret scans, and the dev Pages deployment reported success.
