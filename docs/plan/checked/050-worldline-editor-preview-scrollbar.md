# Worldline Editor Preview Scrollbar

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
  - python3 scripts/validate-changes.py
acceptance:
  - Lane preview does not show an internal scrollbar.
  - Lane preview remains draggable and wheel-zoomable.
  - Preview range coordinates are not displayed.
  - The preview track is fully visible on mobile.
acceptance_focus:
  - preview scrollbar removal
  - preview gestures
  - coordinate label removal
expected_output: implementation
checked_summary_ja: worldline 編集画面のレーンプレビューから内部スクロールバーと座標表示を取り除く。

## Goal

Make the lane preview operate as a fixed interaction surface without an internal scrollbar, and remove the range coordinate label.

## Tasks

- [x] Remove the visible range label from the preview header.
- [x] Change preview events from vertical document flow to bounded row placement.
- [x] Disable internal preview scrolling while preserving drag and wheel gestures.
- [x] Verify build and browser behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: preview track overflow is hidden with no internal scrollbar; coordinate label is absent; wheel and drag changed event positions.
- Browser mobile `375x812`: preview track overflow is hidden with no internal scrollbar; track bottom stayed inside the viewport; drag changed event positions.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
