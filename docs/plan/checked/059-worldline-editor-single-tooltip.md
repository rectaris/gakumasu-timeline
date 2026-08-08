# Worldline Editor Single Tooltip

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
  - browser verification for editor tooltip behavior
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Hovering an editor help label shows only the custom tooltip.
  - Help labels no longer expose a native browser `title` tooltip.
  - Keyboard focus still shows the custom tooltip.
acceptance_focus:
  - tooltip behavior
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor の説明表示を独自ツールチップだけにする。

## Goal

Remove duplicate tooltip display from editor field help labels.

## Tasks

- [x] Remove native title attributes from help labels.
- [x] Verify hover and focus tooltip behavior.
- [x] Run required validation and archive the plan.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: `ID` help label had no native `title` attribute, custom tooltip remained visible on hover, and focus tooltip remained visible.
- Browser mobile `375x812`: same tooltip behavior passed.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.
