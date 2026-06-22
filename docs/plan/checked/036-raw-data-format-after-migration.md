# Raw Data Format After Migration

status: active
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/
  - scripts/generate-data.mjs
  - scripts/validate-data.mjs
  - src/data/generated/
  - src/data/index.js
  - src/data/integrityRunner.js
  - tests/
  - docs/data-structure.md
  - docs/processing-flow.md
  - package.json
target_json:
  - data/raw/**/*.json
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
  - All migrated raw timeline source files use a non-executable data format.
  - Generated app modules remain JavaScript ESM modules consumed by the existing app data index.
  - Generation is deterministic and preserves lane IDs, event IDs, event order, URL-facing canonical IDs, dates, source metadata, participants, and worldline references.
  - Validation errors point to the raw source file and the relevant lane, event, and field.
  - Documentation explains the raw/generated boundary, the accepted raw file extension, and the authoring command flow.
acceptance_focus:
  - non-executable raw source
  - generated JS compatibility
  - post-migration execution gate
expected_output: full-implementation
checked_summary_ja: 全データ移行後に raw データ形式を非実行形式へ変更する。

## Goal

Convert `data/raw/` from executable JavaScript modules to a non-executable data format after the current commu data migration is complete.

The preferred target is JSON unless the implementation proves that comments or authoring ergonomics require JSONC or another explicitly approved format.

## Start Conditions

- All commu categories that are intended to use the generated-data pipeline have already been migrated into `data/raw/` and `src/data/generated/`.
- Runtime imports no longer depend on legacy commu source files under `src/data/worldline_commu/`.
- Existing raw/generated freshness checks pass before this plan starts.
- The implementation owner has rechecked the completed migration inventory and confirmed that the approved raw format still fits the actual migrated data.

## Scope Decisions

- Keep `src/data/generated/` as JavaScript ESM modules.
- Treat `src/data/generated/` as generated app output and keep it tracked in Git.
- Move the human-edited source of truth in `data/raw/` to a non-executable format.
- Prefer plain JSON with direct numeric date values such as `{ "year": 1, "month": 4, "day": 1 }`.
- Remove helper calls such as `yearOf(1)` from raw data.
- Keep the current one-lane-per-file organization unless the completed data migration exposes a concrete reason to group files differently.
- Do not change event semantics, chronology, source attribution, participant IDs, worldline IDs, or URL-facing event IDs as part of the format conversion.
- If comments are needed in raw files, decide explicitly between JSONC, adjacent Markdown notes, or preserving comment text in structured fields such as `note`.

## Tasks

- [x] Confirm the completed migration inventory and identify every raw file to convert.
- [x] Decide the final raw extension and parser.
- [x] Convert `data/raw/` source files from JavaScript modules to the approved non-executable format.
- [x] Update `scripts/generate-data.mjs` to parse raw data without dynamic `import()`.
- [x] Keep generated JavaScript output deterministic and app-compatible.
- [x] Update freshness validation so stale generated files still fail without rewriting files.
- [x] Update data integrity validation so focused errors still report raw source paths.
- [x] Add or update compatibility tests for lane IDs, event IDs, event order, and canonical ID behavior.
- [x] Update authoring documentation and processing-flow documentation.
- [x] Run the full validation set and record any intentionally deferred migration exceptions.

## Validation Results

- `npm run generate:data`: passed.
- `npm run validate:data -- data/raw/worldline_commu/idol_commu/001hanamiSaki.json data/raw/worldline_commu/common_timeline.json`: passed.
- `npm run test -- tests/dataIndex.test.js tests/generatedData.test.js tests/dataIntegrity.test.js`: passed.
- `npm run validate:data`: passed.
- `npm run test`: passed.
- `npm run build`: passed.

## Implementation Notes

The current pilot uses JavaScript raw files because it minimized the first raw/generated migration diff.

That choice is acceptable for the pilot, but it leaves the source of truth executable during generation.

After the broader data migration is complete, the safer long-term boundary is to keep raw files as data and keep executable code in the generator and app modules.

## Risks

- JSON cannot contain comments, helper calls, trailing commas, or unquoted property names.
- A broad mechanical conversion can hide accidental data changes if compatibility tests are too narrow.
- Changing the raw parser before all data is migrated would mix two source formats and make authoring rules harder to follow.

## Out Of Scope

- Changing timeline interpretation or source claims.
- Reworking the app data API.
- Removing generated JavaScript modules from Git.
- Introducing a CMS or database.
