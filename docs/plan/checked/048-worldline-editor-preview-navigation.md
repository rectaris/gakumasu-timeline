# Worldline Editor Preview Navigation

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
validation:
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Left event list scrolls independently while the rest of the sidebar stays fixed.
  - Lane preview supports zooming in and out within the preview.
  - Lane preview supports panning left and right within the preview.
  - Existing page shell keeps the header fixed and center form scrollable.
acceptance_focus:
  - event list scroll
  - preview zoom
  - preview pan
expected_output: implementation
checked_summary_ja: worldline 編集画面のイベント一覧スクロールとレーンプレビュー操作を追加する。

## Goal

Restore independent scrolling for the left event list and add zoom and pan controls to the lane preview.

## Tasks

- [x] Make only the left event list scroll inside the fixed sidebar.
- [x] Add preview range state for lane preview zoom and pan.
- [x] Add zoom and pan controls to the preview UI.
- [x] Verify desktop and mobile behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- Browser desktop `1366x900`: left event list scrolled while sidebar stayed fixed; preview zoom and pan changed the visible range.
- Browser mobile `375x812`: left event list scrolled while sidebar stayed fixed; preview controls stayed visible; preview zoom and pan changed the visible range.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
