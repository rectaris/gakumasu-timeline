# Align portal header link

status: active
task_type: ui_layout
review_class: A
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
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
  - git diff --check
  - npm run build
acceptance:
  - Portal header link uses the same external-link icon as supportcard-status.
  - Portal header link remains at the right edge of the header.
acceptance_focus:
  - Header portal icon consistency
expected_output: full-implementation
checked_summary_ja: ポータルリンクのアイコンと配置を揃える。

## Notes

## Validation Results

- `git diff --check`: passed.
- `npm run build`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Playwright preview check: passed at `1280x800` and `375x812`.
