# Idol Commu Generated Data Migration

status: active
task_type: environment_data_flow
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - data/raw/worldline_commu/idol_commu/
  - src/data/generated/worldline_commu/idol_commu/
  - src/data/worldline_commu/idol_commu/
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
  - Idol commu raw files exist under data/raw and remain behavior-compatible with the legacy source files.
  - Idol commu generated files are deterministic app modules under src/data/generated.
  - src/data/index.js reads idol commu data from generated modules without changing exported lane order.
  - Data validation excludes migrated legacy idol files and reports generated data errors against raw source paths.
  - Tests cover legacy/generated lane ID, event ID order, and canonical ID compatibility.
acceptance_focus:
  - idol commu generated loading
  - legacy compatibility
  - raw source paths
expected_output: full-implementation
checked_summary_ja: アイドルコミュを raw/generated 方式へ段階移行する。

## Goal

Migrate `src/data/worldline_commu/idol_commu/*.js` to the existing raw/generated data pipeline as the next stage after the Hatsuboshi pilot.

Keep legacy idol files during this stage for compatibility tests and rollback comparison.

## Scope

- Migrate only `idol_commu` in this stage.
- Do not migrate `src/data/worldline_commu/common_timeline.js` in this plan because it is a dedicated common-event app contract.
- Do not remove legacy idol source files in this plan.
- Do not change timeline semantics, event IDs, event order, participants, worldline IDs, dates, or source claims.

## Tasks

- [x] Copy idol commu source files into `data/raw/worldline_commu/idol_commu/` with raw-local helper definitions.
- [x] Generalize `scripts/generate-data.mjs` so every raw idol file produces a generated app module.
- [x] Generate `src/data/generated/worldline_commu/idol_commu/*.js`.
- [x] Switch `src/data/index.js` idol loading to generated modules while preserving filename order.
- [x] Exclude migrated legacy idol files from integrity validation and map generated source paths to raw files.
- [x] Extend compatibility tests for generated idol lane order, event ID order, and canonical IDs.
- [x] Update documentation for the migrated idol category and remaining legacy surfaces.
- [x] Run validation and archive this active plan.

## Validation Results

- `npm run validate:data`: passed.
- `npm run validate:data -- data/raw/worldline_commu/idol_commu`: passed.
- `npm run test -- tests/dataIndex.test.js tests/generatedData.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/validate-changes.py`: passed.

## Notes

The current raw format remains JavaScript modules for consistency with the existing pilot.

Plan 036 covers the later non-executable raw format conversion after the broader migration is complete.
