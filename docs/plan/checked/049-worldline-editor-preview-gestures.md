# Worldline Editor Preview Gestures

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
  - Lane preview can be panned by dragging inside the preview track.
  - Lane preview can be zoomed with the mouse wheel inside the preview track.
  - Wheel zoom anchors around the pointer position inside the preview.
  - Existing button controls still work.
acceptance_focus:
  - preview drag pan
  - preview wheel zoom
  - preview button controls
expected_output: implementation
checked_summary_ja: worldline 編集画面のレーンプレビューをドラッグとホイールで操作できるようにする。

## Goal

Add direct manipulation gestures to the lane preview so editors can pan by dragging and zoom with the mouse wheel.

## Tasks

- [x] Add pointer drag state and handlers for preview panning.
- [x] Add wheel zoom handling anchored to the pointer position.
- [x] Update preview track affordance and interaction styling.
- [x] Verify build and browser behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: wheel zoom changed the preview range, drag panned the range, and reset returned to full range.
- Browser mobile `375x812`: preview controls and track stayed within the viewport; pointer drag changed the preview range.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
