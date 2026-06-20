# Generated Data Pipeline

status: completed
task_type: environment_data_flow
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - data/raw/
  - src/data/generated/
  - src/data/index.js
  - scripts/
  - package.json
  - tests/
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
  - npm run validate:data
  - git diff --check
acceptance:
  - Raw authoring data and generated app data have a documented source-of-truth relationship.
  - Generator output is deterministic and validated before build.
  - The app reads generated data without changing visible behavior.
  - The migration path preserves existing IDs and URL restore behavior.
acceptance_focus:
  - raw/generated boundary
  - deterministic generation
  - compatibility
expected_output: full-implementation
checked_summary_ja: raw/generated 分離による長期運用向けデータ読み込みへ移行する。

## Goal

Move from direct JS-module data loading toward a long-term authoring model where raw timeline data can be validated, normalized, and generated into app-ready modules.

This plan is a backlog planning record. Treat implementation as Class C if it changes data-source ownership, generated-artifact policy, public IDs, or timeline data contracts.

## Recommended Path

Introduce `data/raw/` and `src/data/generated/` only after the raw format, generated module contract, artifact policy, and ID compatibility rules are decided.

## Pilot Decisions

These decisions apply to the first generated-data pilot. Revisit them only with an explicit data-contract change.

1. Authoring ownership
   - `data/raw/` is the human-editable source of truth for migrated data.
   - `src/data/generated/` is generated output and must not be hand-edited.
   - Existing non-migrated `src/data/worldline_commu/` files remain legacy authoring data until their category is migrated.
2. Artifact policy
   - Generated app modules are tracked in Git so review can inspect generated diffs and static builds do not depend on hidden local state.
   - Freshness validation must fail when generated output differs from the generator output.
3. Validation boundary
   - `npm run validate:data` validates both raw input for migrated files and generated output freshness/compatibility.
   - `npm run verify` remains the full gate because it already runs data validation, tests, and build.
4. App API compatibility
   - `src/data/index.js` keeps its exported names stable.
   - Migration may be category-by-category, but each migrated category must preserve lane order, event order, event IDs, and URL restore behavior.
5. ID compatibility
   - Existing event IDs are public URL compatibility data.
   - Tests must compare pilot raw/generated IDs against the legacy-compatible exported data and include URL-facing `canonicalId` coverage when practical.
6. Ordering
   - The pilot preserves raw array order for lane events and generated export order.
   - The generator output is deterministic; object keys are emitted in a stable project-defined order.
7. Common events
   - `commonTimeline` stays a dedicated app contract and is not pre-expanded per lane in generated data.
8. Error reporting
   - Generator and validator errors should point to the raw source file, lane, event ID/title, and field whenever practical.
9. Required fields
   - Migrated raw data should be stricter than display fallback behavior. Missing IDs, titles, dates, and occurrence types should fail before build.
10. Source model
    - Existing `source` remains for app compatibility.
    - Future structured-source migration may generate compatibility `source` values from `sourceDetails`, but this pilot does not change source semantics.
11. Derived values
    - Raw data stores semantic data only.
    - Display-derived values such as `canonicalId`, `instanceId`, `displayStartDay`, and `displayEndDay` are not raw fields.
12. Test fixtures
    - Use a small generator-focused fixture where useful and run the real pilot data as a smoke/compatibility path.
13. Legacy retirement
    - Keep legacy `src/data/worldline_commu/` files during pilot migration for comparison and rollback.
    - Remove or archive each legacy source only after the corresponding raw/generated category has passing compatibility coverage.
14. Commands
    - Use `npm run generate:data` for generation.
    - Keep generation separate from validation; validation may check freshness but should not silently rewrite files.
15. Review boundary
    - Mechanical shape conversion is allowed inside the approved migration.
    - Timeline semantics, chronology, source attribution, generated contract changes, and public ID changes remain approval-sensitive.

## Pilot Scope

- Migrate `src/data/worldline_commu/hatsuboshi_commu/001storyOfReiris.js` into `data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.js`.
- Generate `src/data/generated/worldline_commu/hatsuboshi_commu/001storyOfReiris.js`.
- Point `src/data/index.js` to the generated Hatsuboshi module while leaving other categories on the legacy path.
- Preserve all data values, event IDs, lane order, and event order.
- Add a freshness check that reports stale generated files without rewriting them.

## Tasks

- [x] Decide raw format: JavaScript ESM data files for the pilot, preserving existing authoring ergonomics without adding dependencies.
- [x] Define generated module format consumed by `src/data/index.js`: deterministic JavaScript ESM default-export lane modules.
- [x] Build a pilot generator that normalizes the migrated lane into deterministic app-ready JavaScript modules.
- [x] Add deterministic generation checks so stale generated files are detected.
- [x] Migrate one category file as a pilot before migrating all `worldline_commu` data.
- [x] Preserve existing `canonicalId` and shared URL behavior for the pilot through ID/order compatibility tests.
- [x] Document source-of-truth, generator command, and freshness validation.

## Implementation Notes

- Added `scripts/generate-data.mjs` with `generate:data` and `--check` modes.
- Migrated `Story of Re;Iris` Hatsuboshi data into `data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.js`.
- Generated `src/data/generated/worldline_commu/hatsuboshi_commu/001storyOfReiris.js` as a tracked app module.
- Updated `src/data/index.js` so `hatsuboshiCommus` reads the generated module while other categories remain on legacy modules.
- Updated data integrity loading so migrated generated modules are validated as app data and errors point at the raw source path.
- Added freshness and ID/order/canonical ID compatibility tests.
- Updated `docs/data-structure.md` and `docs/processing-flow.md` for the raw/generated source-of-truth boundary.

## Validation Notes

- `npm run generate:data`: passed.
- `npm run validate:data`: passed.
- `npm run validate:data -- data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser verification: not run because this change preserves the existing data contract and does not alter visible UI or interactions.

## Out Of Scope

- Database/CMS adoption.
- Generic timeline import/export adapter.
- Runtime network fetching.
