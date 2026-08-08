# Worldline Editor Preview Fixed Viewport

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
  - Lane preview viewport keeps a fixed height even when many sub-lanes exist.
  - Preview content can be dragged vertically to inspect hidden sub-lanes.
  - Preview content can still be dragged horizontally and zoomed with the wheel.
  - Preview does not overflow the page or show an internal scrollbar.
acceptance_focus:
  - fixed preview viewport
  - vertical drag pan
  - horizontal pan and wheel zoom
expected_output: implementation
checked_summary_ja: worldline 編集画面のレーンプレビューを固定表示窓にして縦横ドラッグで確認できるようにする。

## Goal

Keep the lane preview at a stable fixed size and allow users to pan the larger preview content vertically and horizontally by dragging.

## Tasks

- [x] Separate preview viewport height from content height.
- [x] Add vertical pan state and drag handling.
- [x] Preserve horizontal drag, wheel zoom, and button controls.
- [x] Verify desktop and mobile behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `2048x1001`: `Story of Re;Iris` preview kept a fixed 180px viewport while content height was larger; vertical drag moved the preview content; horizontal drag worked after zooming.
- Browser mobile `375x812`: preview viewport stayed inside the review pane with no page overflow; vertical drag moved the preview content.
- Visual crop confirmed the preview uses a fixed viewport with hidden overflow and no internal scrollbar.
