# Shorten the authenticated account menu logout label.

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/AccountControl.vue
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
  - browser verification
  - python3 scripts/validate-changes.py
  - git diff --check
acceptance:
  - The authenticated account menu displays `ログアウト` for the idle logout action.
  - Logout behavior, progress text, and the note about the account-page session remain unchanged.
  - Human-facing UI behavior documentation names the current label while preserving the three-application logout scope.
acceptance_focus:
  - exact logout label
  - unchanged logout semantics
expected_output: implementation-and-pr
checked_summary_ja: アカウントメニューの「三アプリからログアウト」を「ログアウト」に変更する。

## Decisions

- Change only the idle button label and its exact-label documentation.
- Keep the three-application session scope, pending label, and explanatory note unchanged.

## Tasks

- [x] Update the account-menu logout label.
- [x] Synchronize the UI behavior documentation.
- [x] Build and browser-check the authenticated menu.
- [x] Commit, push `dev`, and open a draft PR to `main`.

## Validation Notes

- `npm run build` passed for the legacy `/timeline/` build.
- `npm run build:curiretas` passed for the canonical `/gakumastool/timeline/` build.
- Headless Chromium verified the authenticated account menu at `1440x900` and `375x812`.
- Browser checks confirmed the exact `ログアウト` label, no old-label rendering, no horizontal overflow, Escape closure, focus restoration, and no unexpected console or network errors.
- `git diff --check`, plan lint, plan format, change-aware validation, and the static security check passed.
- Commit `6e2c527` was pushed to `dev`, and draft PR #8 was opened from `dev` to `main`.
