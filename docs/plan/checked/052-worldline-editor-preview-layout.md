# Worldline Editor Preview Layout

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
  - Lane preview uses the same sub-lane overlap layout as the main timeline.
  - Overlapping events are not forced into only three vertical rows.
  - Preview height expands to fit the rendered sub-lanes without an internal scrollbar.
  - Existing drag, wheel, and button controls continue to work.
acceptance_focus:
  - preview overlap layout
  - dynamic preview height
  - preview gestures
expected_output: implementation
checked_summary_ja: worldline 編集画面のレーンプレビューをメインタイムラインと同じ重なり配置にする。

## Goal

Replace the preview-only three-row layout with the shared timeline sub-lane layout so overlapping events stack correctly.

## Tasks

- [x] Reuse timeline lane layout helpers for preview sub-lane assignment.
- [x] Render preview events by assigned sub-lane instead of `index % 3`.
- [x] Make preview track height depend on rendered sub-lane count.
- [x] Verify desktop and mobile behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `2048x1001`: common preview rendered three overlapping events on three distinct rows with `sameRowOverlapCount: 0`; drag and wheel changed event positions.
- Browser desktop `2048x1001`: `Story of Re;Iris` preview rendered more than three rows when visible overlaps required it, with no same-row overlap.
- Browser mobile `375x812`: preview track stayed inside the viewport; drag and wheel changed event positions; no same-row overlap in the visible preview.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
