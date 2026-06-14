# Generated Data Pipeline

status: backlog
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
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

Use a phased path: keep current JS data first, add validation, then introduce `data/raw/` and `src/data/generated/` when validation is stable.

## Tasks

- [ ] Decide raw format: JSON, YAML, or TypeScript data files.
- [ ] Define generated module format consumed by `src/data/index.js`.
- [ ] Build a generator that normalizes category, lane, event, source, participant, worldline, and uncertainty fields.
- [ ] Add deterministic generation checks so stale generated files are detected.
- [ ] Migrate one category as a pilot before migrating all `worldline_commu` data.
- [ ] Preserve existing `canonicalId` and shared URL behavior.
- [ ] Document source-of-truth, generator command, and freshness validation.

## Out Of Scope

- Database/CMS adoption.
- Generic timeline import/export adapter.
- Runtime network fetching.
