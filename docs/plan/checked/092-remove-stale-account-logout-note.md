# Remove the stale account logout note.

status: checked
task_type: ui_layout
review_class: A
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/AccountControl.vue
  - docs/manual.md
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
validation:
  - npm run build
  - npm run test:ui
  - python3 scripts/validate-changes.py
  - git diff --check
acceptance:
  - The account menu no longer claims that the account page remains logged in.
  - User-facing documentation states that logout also ends the account-page session.
  - Account menu actions and logout error feedback remain unchanged.
acceptance_focus:
  - account menu copy
  - logout documentation
expected_output: full-implementation
checked_summary_ja: アカウントメニューから旧ログアウト仕様の注記を削除し、利用者向け文書を現仕様へ揃える。

## Problem

The account menu and user-facing documentation still state that the account-page session survives logout, but logout now ends that session too.

## Goal

Remove the stale menu note and align the affected documentation with current logout behavior.

## Implementation Instructions

Remove only the obsolete note and its unused style, then update the two user-facing behavior descriptions that still document the old session boundary.

## Decisions

- Treat this as a mechanical copy correction with no interaction or logout logic changes.

## Tasks

- [x] Remove the obsolete account-menu note and unused CSS.
- [x] Update the affected manual and UI behavior text.
- [x] Run required validation and archive the plan.

## Validation Notes

- `npm run build` passed.
- `npm run test:ui` passed for anonymous, contributor, reviewer, logout, failure, and 375x812 states.
- Change-aware validation, plan lint, plan format, and `git diff --check` passed.
- The stale menu and documentation wording no longer appears in the working tree.
