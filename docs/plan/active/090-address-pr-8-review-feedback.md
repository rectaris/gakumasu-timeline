# Address actionable Codex review feedback on pull request 8.

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/auth/toolSession.js
  - src/ApplicationRoot.vue
  - src/components/AccountControl.vue
  - src/components/TimelineContribution.vue
  - src/components/TimelineReviewQueue.vue
  - scripts/verify-timeline-authoring-ui.mjs
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_DECISION_AUDIT.md
validation:
  - npm run test
  - npm run build
  - npm run build:curiretas
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - git diff --check
  - GitHub Actions checks
acceptance:
  - A successful account-menu logout synchronously removes contributor and reviewer controls and unmounts any open authoring panel.
  - Failed logout preserves authenticated authoring access and its current controls.
  - At 375x812, contributor and reviewer launchers do not overlap each other or the timeline zoom panel.
  - Existing authoring submission, review, anonymous, unavailable, desktop, and mobile behavior remains covered.
acceptance_focus:
  - logout state propagation
  - mobile control reachability
  - deterministic browser regression coverage
expected_output: implementation-and-pr-update
checked_summary_ja: PRレビューに基づき、ログアウト後の投稿権限UI消去とモバイル操作の重なりを修正する。

## Decisions

- Propagate successful logout through a Vue-provided tool-session callback instead of a global browser event or prop drilling.
- Clear authoring roles and state synchronously; component unmounting owns disposal of cached contribution and review panel state.
- Move both authoring launchers below the fixed header on viewports up to 600px instead of reserving a fragile fixed offset above the zoom panel.
- Extend the existing Playwright verification with logout and bounding-box regression assertions.
- Treat the Chromium installation thread as already addressed by commit `9cfa3d6`; do not duplicate the workflow change.

## Tasks

- [x] Clear role-gated authoring state after successful logout.
- [x] Reposition mobile authoring launchers away from zoom controls.
- [x] Add browser regression coverage for logout and control overlap.
- [x] Synchronize UI behavior documentation.
- [ ] Validate, commit, push `dev`, and confirm PR #8 checks.

## Validation Notes

- The user referenced PR #18, but no such PR exists in `rectaris/gakumasu-timeline`; the only accessible PR #18 is an unrelated merged `rectaris/calc-sapo` plan PR with no Codex review.
- Current repository PR #8 contains the three recent `chatgpt-codex-connector` threads matching the current work, so it is the selected target.
- Thread `PRRT_kwDOQ7xUqc6XdsPL` is already addressed and verified by the Playwright Chromium CI installation.
- Threads `PRRT_kwDOQ7xUqc6XdsPM` and `PRRT_kwDOQ7xUqc6XdsPN` are valid and require implementation.
- `npm run test` passed 144 Node tests, 7 Worker tests, and Playwright coverage for logout success, logout failure, and 375x812 control separation.
- `npm run build` and `npm run build:curiretas` passed.
- The mobile browser assertions confirmed that contributor and reviewer launchers do not overlap each other or the zoom panel.
- Plan lint, plan format, `git diff --check`, and the static security check passed before commit.
