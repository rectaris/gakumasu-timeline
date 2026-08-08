# Worldline Editor Layout Tuning

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - scripts/worldline-editor-api.mjs
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
  - npm run test -- tests/worldlineEditorApi.test.js
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Editor content starts near the page top without the normal timeline header gap.
  - Start and end date labels appear above their input groups.
  - Participant options follow the raw idol commu file order.
  - Existing editor loading and save validation behavior remains unchanged.
acceptance_focus:
  - top spacing
  - date input labels
  - participant order
expected_output: implementation
checked_summary_ja: worldline 編集画面の上部余白、時期入力、参加者順を調整する。

## Goal

Tune the local worldline editor layout based on direct editing feedback.

## Tasks

- [x] Remove the unused top space caused by the main app shell padding.
- [x] Put start and end date labels above their input groups.
- [x] Preserve raw idol commu file order for participant options.
- [x] Verify desktop and mobile editor rendering.

## Validation Results

- `npm run test -- tests/worldlineEditorApi.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- Browser desktop `1366x900`: editor top is at viewport top, start/end labels are above date inputs, participant order starts with raw idol file order.
- Browser mobile `375x812`: editor top is at viewport top and start/end labels are above date inputs.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
