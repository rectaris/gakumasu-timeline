# Close the residual PR #3 CodeQL HTML-filter alert.

status: checked
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - scripts/collect-realworld-sources.mjs
  - tests/realworldIntake.test.js
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npm run test
  - npm run build
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - git diff --check
acceptance:
  - Script and style closing tags with unexpected trailing content are removed before text extraction.
  - The focused intake regression and full project validation pass.
expected_output: implementation-and-commit
checked_summary_ja: PR #3 に残った HTML フィルタの CodeQL 指摘を修正した。

## Tasks

- [x] Broaden the closing-tag match without changing surrounding extraction behavior.
- [x] Add regression coverage and run validation.

## Validation Notes

- The focused official-source intake test passed with malformed trailing closing-tag content.
- All 25 test files and 139 tests passed.
- Vite build, static security, change-aware validation, plan checks, and `git diff --check` passed.
