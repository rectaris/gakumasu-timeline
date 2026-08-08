# Worldline Editor Preview Clipping

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
  - Lane preview clips partially visible events to the visible range.
  - Narrow edge fragments do not show broken labels.
  - Lane preview keeps no internal scrollbar and remains operable by drag and wheel.
  - The preview track stays fully visible on mobile.
acceptance_focus:
  - preview clipping
  - narrow label suppression
  - preview gestures
expected_output: implementation
checked_summary_ja: worldline 編集画面のレーンプレビューで範囲外イベントの断片表示を整える。

## Goal

Fix visually broken lane preview fragments by clipping event bars to the visible range and suppressing labels that cannot fit.

## Tasks

- [x] Compute preview item geometry from the clipped visible event range.
- [x] Hide labels on too-narrow preview fragments.
- [x] Verify desktop and mobile preview behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `2048x1001`: preview has no internal scrollbar; narrow fragments have no labels; extremely narrow edge fragments are not rendered; wheel and drag changed event positions.
- Browser mobile `375x812`: preview track stayed inside the viewport; no internal scrollbar; narrow fragments have no labels; wheel and drag changed event positions.
- Visual crop confirmed the right-edge broken labels/fragments were removed.
