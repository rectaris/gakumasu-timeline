# Worldline Editor File Filter

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/WorldlineEditor.vue
  - docs/manual.md
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - File-backed commu types offer a "すべて" file option.
  - Selecting a specific file lists only that file's events in the sidebar.
  - Selecting "すべて" lists every event for the selected commu type.
  - Existing event edit and add flows remain usable.
acceptance_focus:
  - file filter
  - event list
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor のイベント一覧をファイル選択に合わせて絞り込む。

## Goal

Make the left event list respect the selected file for file-backed commu types while preserving an explicit all-files view.

## Tasks

- [x] Add an all-files option to the file selector.
- [x] Filter sidebar events by selected file unless all-files is selected.
- [x] Review human-facing docs for affected editor behavior.
- [x] Run required validation and archive the plan.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: `idolCommu` first file listed 6 events, `すべて` listed 22 events, and returning to the first file restored 6 events.
- Browser mobile `375x812`: same file filter behavior passed.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.

## Documentation Review

- `docs/manual.md`: no editor-specific text affected.
- `docs/ui-behavior.md`: no editor-specific text affected.
