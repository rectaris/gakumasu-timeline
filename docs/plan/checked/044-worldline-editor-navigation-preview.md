# Worldline Editor Navigation And Preview

status: active
task_type: ui_layout
review_class: B
human_design_required: yes
human_approval_status: not_required
target_files:
  - src/components/WorldlineEditor.vue
  - tests/worldlineEditorApi.test.js
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
  - npm run test -- tests/worldlineEditorApi.test.js
  - npm run test
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Sidebar field spacing separates search, commu selection, file selection, and add actions.
  - Sidebar navigation first selects commu type, then selects a file for file-backed categories.
  - Common commu can be selected as a commu type and edited without an extra file step.
  - Editor review shows a lane-level preview of the event as it would appear after add or edit.
  - Existing editor save and validation behavior remains unchanged.
acceptance_focus:
  - sidebar hierarchy
  - spacing
  - lane preview
expected_output: implementation
checked_summary_ja: worldline 編集画面の左ナビゲーションとレーンプレビューを改善する。

## Goal

Improve the local worldline editor workflow based on direct usability feedback.

The left sidebar should match the raw data directory hierarchy instead of exposing all lanes in one flat lane select.
The review panel should show the destination lane with the edited or newly added event inserted, so authors can inspect placement before saving.

## Tasks

- [x] Add commu type navigation for common, event, support, hatsuboshi, and idol data.
- [x] Show file selection only for file-backed commu types.
- [x] Keep common events directly editable after selecting the common commu type.
- [x] Increase vertical spacing between sidebar controls.
- [x] Add lane preview in the review panel using the current form event and selected destination lane.
- [x] Run focused and full validation.

## Validation Results

- `npm run test -- tests/worldlineEditorApi.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- Browser desktop `1366x900`: commu type hierarchy, common direct editing, idol file selection, 16px sidebar gaps, and lane preview rendered.
- Browser mobile `375x812`: one-column layout, commu type control, and lane preview rendered.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
