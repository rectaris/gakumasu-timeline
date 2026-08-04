# Common Timeline Generated Data Migration

status: active
task_type: environment_data_flow
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - data/raw/worldline_commu/common_timeline.js
  - src/data/generated/worldline_commu/common_timeline.js
  - src/data/worldline_commu/common_timeline.js
  - scripts/generate-data.mjs
  - src/data/index.js
  - src/data/integrityRunner.js
  - tests/dataIndex.test.js
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
  - npm run generate:data
  - npm run validate:data
  - npm run test
  - npm run build
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Common timeline raw source exists under data/raw and remains behavior-compatible with the legacy source file.
  - Common timeline generated output is a deterministic JavaScript ESM app module.
  - src/data/index.js imports commonTimeline from generated data without changing the exported app contract.
  - Data validation excludes the migrated legacy common timeline and reports generated common timeline errors against the raw source path.
  - Tests cover legacy/generated common timeline lane ID, event ID order, and canonical ID behavior when common events are expanded across lanes.
acceptance_focus:
  - common timeline generated loading
  - common event compatibility
  - raw source path
expected_output: full-implementation
checked_summary_ja: 共通イベントを raw/generated 方式へ段階移行する。

## Goal

Migrate `src/data/worldline_commu/common_timeline.js` to the raw/generated data pipeline while preserving the dedicated `commonTimeline` app export.

Keep the legacy source file during this stage for compatibility tests and rollback comparison.

## Scope

- Migrate only `common_timeline.js` in this stage.
- Do not remove legacy common timeline source in this plan.
- Do not change event semantics, event IDs, event order, dates, source claims, or common-event expansion behavior.

## Tasks

- [x] Copy the common timeline source into `data/raw/worldline_commu/common_timeline.js` with raw-local helper definitions.
- [x] Add the common timeline raw file to `scripts/generate-data.mjs`.
- [x] Generate `src/data/generated/worldline_commu/common_timeline.js`.
- [x] Switch `src/data/index.js` to import `commonTimeline` from generated data.
- [x] Exclude the migrated legacy common timeline from integrity validation.
- [x] Extend compatibility tests for generated common timeline event order and common-event canonical IDs.
- [x] Update documentation for the migrated common timeline source path.
- [x] Run validation and archive this active plan.

## Validation Results

- `npm run validate:data -- data/raw/worldline_commu/common_timeline.js`: passed.
- `npm run test -- tests/dataIndex.test.js tests/generatedData.test.js tests/useTimelineData.test.js`: passed.
- `npm run validate:data`: passed.
- `npm run test`: passed.
- `npm run build`: passed.

## Notes

The current raw format remains JavaScript modules for consistency with the existing migration stages.

Plan 036 covers the later non-executable raw format conversion after the broader migration is complete.
