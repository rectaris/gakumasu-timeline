# Worldline Editor Field Tooltips

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
  - Worldline Data Editor labels expose mouse hover descriptions.
  - Tooltip text is also reachable on keyboard focus.
  - Existing layout and editor controls remain usable on desktop and mobile.
acceptance_focus:
  - field labels
  - tooltip display
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor の各入力項目に説明ツールチップを追加する。

## Goal

Add lightweight field descriptions to the editor so authors can confirm what each item means while editing.

## Tasks

- [x] Add tooltip text and helper attributes for editor field labels.
- [x] Add scoped tooltip styling for hover and focus.
- [x] Verify desktop and mobile editor views.
- [x] Run required validation and archive the plan.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: 24 visible labels exposed help marks; `ID` showed its tooltip on hover and `検索` showed its tooltip on keyboard focus.
- Browser mobile `375x812`: same visible-label hover and focus checks passed.
- Browser desktop `1366x900`: conditional `新規ファイル名` and added structured-source labels exposed tooltips.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.
