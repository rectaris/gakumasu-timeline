# Worldline Editor Fixed Shell

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
  - Editor header stays fixed at the top of the editor viewport.
  - Left and right columns use the available page height without causing page scroll.
  - Only the center editing column scrolls vertically.
  - Mobile editor layout remains usable.
acceptance_focus:
  - fixed header
  - fixed side columns
  - center-only scroll
expected_output: implementation
checked_summary_ja: worldline 編集画面でヘッダーと左右カラムを固定し、中央だけをスクロール可能にする。

## Goal

Make the worldline editor behave like a fixed-height application shell.

The page should not scroll as a whole.
The header and side columns should remain stable while only the central editing column scrolls.

## Tasks

- [x] Convert the editor root to a fixed viewport-height shell.
- [x] Make the header a fixed non-scrolling region.
- [x] Make the layout fill the remaining height.
- [x] Move vertical scrolling to the center form column only.
- [x] Verify desktop and mobile behavior.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- Browser desktop `1366x900`: page scroll stayed `0`, left and right scroll stayed `0`, center scrolled, header top stayed fixed, all columns matched the available layout height.
- Browser mobile `375x812`: page scroll stayed `0`, left and right scroll stayed `0`, center scrolled, header top stayed fixed.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
