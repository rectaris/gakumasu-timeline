# Worldline Editor Preserve All File Selection

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/WorldlineEditor.vue
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Selecting an event while the file selector is "すべて" keeps the selector on "すべて".
  - The selected event still loads into the edit form.
  - Selecting an event while a specific file is selected keeps existing behavior.
acceptance_focus:
  - all-files selection
  - event form loading
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor でイベント選択時に「すべて」のファイル選択を維持する。

## Goal

Keep the all-files event list view stable when an author selects an event from that list.

## Tasks

- [x] Update event row selection so all-files state is not replaced by the event source file.
- [x] Verify the selected event still loads and remains editable.
- [x] Run required validation and archive the plan.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- Browser desktop `1366x900`: selecting `002_birth` from `すべて` kept the file selector on `すべて` and loaded `002_birth` into the form.
- Browser mobile `375x812`: same all-files selection behavior passed through DOM click verification.
- Browser desktop `1366x900`: selecting an event while the first idol file was selected kept that file selected and loaded `001_birth`.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.
