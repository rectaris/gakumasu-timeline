# Address PR #3 security and review findings.

status: checked
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - .github/workflows/codex-ci-autofix.yml
  - .github/workflows/secret-scan.yml
  - AGENTS.md
  - docs/agent/CODEX_CI_AUTOFIX.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/manual.md
  - scripts/collect-realworld-sources.mjs
  - scripts/worldline-editor-api.mjs
  - src/components/WorldlineEditor.vue
  - src/pages/RealworldHistoryPage.vue
  - tests/realworldIntake.test.js
  - tests/useKeyboard.test.js
  - tests/worldlineEditorApi.test.js
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run test
  - npm run build
  - python3 scripts/security-static-check.py
  - python3 scripts/structure-map.py --check
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - All twelve actionable PR review threads are addressed by scoped code, workflow, policy, or test changes.
  - Worldline editor writes require a same-session token and reject cross-origin or non-JSON requests.
  - CI autofix is manual-only, checks out the failed commit SHA, and aborts if the PR branch advances.
  - Real-world history shortcuts ignore form and modified input, and its lanes and detail panel no longer overlap their headers.
  - The relevant tests, build, static security checks, and browser verification pass.
acceptance_focus:
  - security boundaries
  - interaction regression prevention
  - policy consistency
expected_output: implementation-and-commit
checked_summary_ja: PR #3 のセキュリティ指摘とレビュー指摘を修正した。

## Decisions

- Require both a per-server random editor token and same-origin requests for editor POST endpoints.
- Convert Codex CI Autofix to manual dispatch and bind each repair to the failed current PR head SHA.
- Reuse the narrative shortcut guard for the real-world history keyboard handler.
- Resolve policy conflict markers by preserving the compatible rules from both sides.

## Tasks

- [x] Harden workflows and official-source HTML processing.
- [x] Protect worldline editor mutations with a session token and origin checks.
- [x] Fix real-world history keyboard and layout regressions.
- [x] Resolve committed policy conflict markers.
- [x] Add focused regression coverage and run required validation.
- [x] Prepare the validated changes as one coherent review-fix commit.

## Validation Notes

- `npm run test`: 25 files and 139 tests passed.
- `npm run build`: Vite production build passed.
- Focused Vitest coverage passed for official-source intake, keyboard guards, worldline editor request authorization, and real-world history behavior.
- Change-aware validation, plan lint and format, static security, structure scan, YAML parse, and `git diff --check` passed.
- Headless Chromium passed at 1440x900 and 375x812 with no console errors or failed requests. The desktop header, lane coordinates, item offset, form shortcut guard, and desktop/mobile detail placement were checked.
- Live middleware checks returned 403 for cross-origin and missing-token writes and 415 for a token-authenticated `text/plain` write.
- Screenshots were kept as temporary evidence at `/tmp/gakumasu-pr3-desktop.png` and `/tmp/gakumasu-pr3-mobile.png`; they are not tracked artifacts.
