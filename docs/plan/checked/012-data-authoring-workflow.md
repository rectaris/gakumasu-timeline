# Data Authoring Workflow

status: completed
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/data/worldline_commu/template.js
  - src/data/integrity.js
  - src/data/integrityRunner.js
  - docs/data-structure.md
  - docs/development.md
  - docs/processing-flow.md
  - scripts/
  - package.json
  - tests/
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
  - npm run validate:data
  - git diff --check
  - python3 scripts/lint-plan-docs.py
acceptance:
  - Data authors have a clear checklist for adding, reviewing, validating, and previewing timeline data.
  - Template fields match the validated schema and current source-of-truth format.
  - Validation can be run for the whole dataset and, when practical, a focused file/path.
  - Documentation explains common validation failures and source/uncertainty expectations.
acceptance_focus:
  - authoring checklist
  - template accuracy
  - focused validation
expected_output: full-implementation
checked_summary_ja: データ追加・編集・プレビューの運用を整備する。

## Goal

Raise data editing ease without making the runtime app heavier or requiring a database/CMS.

## Scope Decisions

- Keep this plan on the current JS-module data source format. Do not add source-status, confidence, uncertainty, raw-data, or generated-data fields here; those remain backlog work for plans 008, 009, and 013.
- Make `src/data/worldline_commu/template.js` a copyable authoring starter that follows the validated schema. Avoid invalid placeholder values such as empty strings in arrays.
- Treat `source` as required authoring practice for new data, but do not make missing `source` a hard validation failure in this plan.
- `participants` must contain only IDs from `src/data/characterCatalog.js`. Unknown, group-only, or not-yet-cataloged participants belong in `note` until the data model is expanded.
- `worldlineId` should use known IDs from `src/data/worldlines.js` when known. Do not create temporary worldline IDs for uncertainty.
- Use only the existing `continuous` and `singleWithinRange` values for uncertainty in this plan. Do not invent concrete dates for range-only events.
- Treat event `id` as a stable URL-facing `canonicalId`. New IDs should be stable and descriptive enough to survive title edits; published IDs should not change without an explicit compatibility decision.
- Focused validation should use `npm run validate:data -- <path...>`. Without paths it should keep validating the whole dataset. With paths it should validate targeted files while still using the full dataset context for references and duplicate IDs.
- Keep validation hard failures to current schema/integrity rules. Authoring expectations that require domain judgment remain checklist rules.
- Document the current loading rules: idol commu files are glob-loaded by file name; other categories require `src/data/index.js` registration under current behavior.
- Preview guidance should use the local Vite stack: `npm run dev` for editing and `npm run preview` after a build when release-like inspection is useful.

## Tasks

- [x] Update `src/data/worldline_commu/template.js` to match the validated schema.
- [x] Expand the data author checklist in `docs/data-structure.md`.
- [x] Document source, participant, worldline, uncertainty, ID, and approval-boundary rules for data authors.
- [x] Add focused validation support for a single file/path if practical.
- [x] Document preview steps using the local Vite stack.

## Implementation Notes

- Added `npm run validate:data -- <path...>` support without changing the no-argument full-dataset validation behavior.
- Focused validation reports errors for targeted source files while still loading the full durable dataset for duplicate event IDs and participant/worldline reference checks.
- Updated the authoring template to avoid empty string arrays and to show valid example references.
- Expanded authoring documentation for file placement, current category loading behavior, stable event IDs, source expectations, participant/worldline rules, uncertainty handling, approval boundaries, validation failures, and Vite preview steps.
- Updated processing and development docs to reflect focused validation and the current `verify` command behavior.

## Validation Results

- `npm run validate:data -- src/data/worldline_commu/idol_commu/001hanamiSaki.js`
- `npm run validate:data -- src/data/worldline_commu/idol_commu`
- `npm run validate:data`
- `npm run test`
- `npm run build`
- `git diff --check`
- `python3 scripts/lint-plan-docs.py`

## Out Of Scope

- Non-repository CMS/editor.
- Generic timeline authoring support.
- Unapproved data reinterpretation.
