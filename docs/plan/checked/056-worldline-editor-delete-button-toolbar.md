# Worldline Editor Delete Button Toolbar

status: checked
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
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - The delete button appears next to the duplicate, diff preview, and save controls.
  - The isolated delete button is removed from the review panel.
  - Existing delete confirmation behavior remains unchanged.
acceptance_focus:
  - toolbar actions
  - delete placement
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor の削除ボタンを上部ツールバーへ移動する。

## Goal

Move the event delete action into the main editor toolbar so destructive and save-related commands are grouped together.

## Tasks

- [x] Move the delete button into the toolbar action group.
- [x] Remove the isolated delete button from the review panel.
- [x] Verify desktop and mobile layout.
- [x] Run required validation and archive the plan.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- Browser desktop `1366x900`: toolbar buttons appeared as `複製`, `削除`, `差分確認`, `保存`; review panel delete button count was 0.
- Browser mobile `375x812`: toolbar buttons appeared in the same order; review panel delete button count was 0.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.
