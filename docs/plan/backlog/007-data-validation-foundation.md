# Data Validation Foundation

status: backlog
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - package.json
  - scripts/
  - tests/dataIntegrity.test.js
  - tests/useTimelineData.test.js
  - src/data/
  - src/types/timeline.d.ts
  - docs/data-structure.md
  - docs/processing-flow.md
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
  - npm run verify
  - git diff --check
  - python3 scripts/lint-plan-docs.py
acceptance:
  - `npm run validate:data` or equivalent focused test validates timeline data integrity.
  - Validation catches duplicate event IDs, invalid date ranges, invalid date parts, missing occurrence type, empty source values, and broken participant/worldline references.
  - `npm run verify` includes data validation or the reason for keeping it separate is documented.
  - Data validation failures identify the source file, lane, event ID/title, field, and failure reason.
acceptance_focus:
  - deterministic data validation
  - reference integrity
  - actionable error output
expected_output: full-implementation
checked_summary_ja: タイムラインデータの基礎検証を追加する。

## Goal

Raise the long-term data quality floor without changing runtime behavior or the current `src/data/worldline_commu` source format.

## Scope

This plan covers the first safety layer for the current JS-module data source. It does not migrate data to raw/generated files and does not change event semantics.

## Tasks

- [ ] Add a reusable data traversal helper for all timeline categories.
- [ ] Validate event ID uniqueness across all loaded events where IDs are present.
- [ ] Validate `start` and `end` shape: year, month, optional day, month range, day range, and `start <= end`.
- [ ] Require `occurrenceType` to be explicit for durable data files.
- [ ] Validate `participants` against `src/data/characterCatalog.js` IDs.
- [ ] Validate `worldlineId` against `src/data/worldlines.js` IDs.
- [ ] Reject empty strings in `source`, `note`, `participants`, and `worldlineId` arrays.
- [ ] Add `npm run validate:data` or a Vitest-backed equivalent.
- [ ] Add docs for running the validation and fixing common failures.

## Out Of Scope

- Generic timeline adapter work.
- Raw/generated data migration.
- Changing current event meanings, IDs, or chronology.
