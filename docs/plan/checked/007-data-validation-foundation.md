# Data Validation Foundation

status: checked
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - package.json
  - scripts/validate-data.mjs
  - tests/dataIntegrity.test.js
  - tests/useTimelineData.test.js
  - src/data/
  - src/data/integrity.js
  - src/data/integrityRunner.js
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
  - npm run validate:data
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

## Implementation Decisions

- Use a reusable validation module plus a Vite runner-backed CLI: `src/data/integrity.js`, `src/data/integrityRunner.js`, and `scripts/validate-data.mjs`.
- Keep durable data validation scoped to `src/data/worldline_commu/**/*.js`, excluding `template.js`.
- Require global uniqueness for present event IDs because `canonicalId` is URL-facing.
- Keep `id` optional in the shared type for now; this plan validates duplicate present IDs but does not make all IDs mandatory.
- Validate dates with the current abstract 31-day month model, not real-calendar month lengths.
- Require explicit `occurrenceType` only for durable timeline data.
- Validate `participants` against `characterCatalog` IDs and `worldlineId` against `worldlines` IDs.
- Reject trimmed-empty values in `source`, `note`, `participants`, and `worldlineId` arrays.
- Do not make `source` mandatory in this plan; only reject invalid values when the field is present.
- Report all validation errors with source file, category, lane, event ID/title, field, and reason.
- Keep existing data fixes mechanical: remove empty participant placeholders, map old worldline IDs to existing catalog IDs, and correct known character ID order mismatches.
- Preserve unknown-person notes as natural-language `note` text instead of introducing temporary participant IDs.
- Leave data model hardening, uncertainty metadata, and raw/generated migration to follow-up plans 008 and 009.

## Tasks

- [x] Add a reusable data traversal helper for all timeline categories.
- [x] Validate event ID uniqueness across all loaded events where IDs are present.
- [x] Validate `start` and `end` shape: year, month, optional day, month range, day range, and `start <= end`.
- [x] Require `occurrenceType` to be explicit for durable data files.
- [x] Validate `participants` against `src/data/characterCatalog.js` IDs.
- [x] Validate `worldlineId` against `src/data/worldlines.js` IDs.
- [x] Reject empty strings in `source`, `note`, `participants`, and `worldlineId` arrays.
- [x] Add `npm run validate:data` or a Vitest-backed equivalent.
- [x] Add docs for running the validation and fixing common failures.

## Out Of Scope

- Generic timeline adapter work.
- Raw/generated data migration.
- Changing current event meanings, IDs, or chronology.

## Completion Notes

- Added reusable timeline data integrity validation in `src/data/integrity.js`.
- Added `src/data/integrityRunner.js` to collect durable `src/data/worldline_commu/**/*.js` data with source paths, excluding `template.js`.
- Added `scripts/validate-data.mjs` and `npm run validate:data`.
- Updated `npm run verify` to run data validation before tests and build.
- Added Vitest coverage for current durable data, duplicate IDs, invalid date parts/ranges, missing occurrence type, empty values, broken references, and formatted error output.
- Applied scoped data fixes:
  - Removed empty participant placeholders from common events.
  - Preserved unknown `juo_kunio` / `kaya_kei` references as natural-language notes.
  - Corrected `juo_sena` to `sena_juo` and `amaya_tsubame` to `tsubame_amaya`.
  - Mapped `likability_story` to `idol_story` and `story_of_reiris` to `hatsuboshi_commu`.
- Updated `docs/data-structure.md` and `docs/processing-flow.md` with validation rules and commands.
- Validation passed:
  - `npm run validate:data`
  - `npm run test`
  - `npm run build`
  - `npm run verify`
  - `git diff --check`
  - `python3 scripts/lint-plan-docs.py`
  - `python3 scripts/validate-changes.py`
- Unresolved risks: none for the 007 scope. Richer participant/source/uncertainty modeling remains deferred to plans 008 and 009.
