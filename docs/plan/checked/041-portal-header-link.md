# Add portal header link

status: active
task_type: ui_layout
review_class: A
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/style.css
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
  - Header exposes an icon link to https://rectaris.github.io/.
  - Link has accessible Japanese label and does not disturb existing header controls.
acceptance_focus:
  - Top header right-side placement
expected_output: full-implementation
checked_summary_ja: ヘッダーに rectaris.github.io へのリンクを追加する。

## Notes

## Validation Results

- `git diff --check`: passed.
- `npm run build`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Playwright preview check: passed at `1280x800` and `375x812`.
