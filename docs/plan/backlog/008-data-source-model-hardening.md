# Data Source Model Hardening

status: backlog
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/types/timeline.d.ts
  - src/data/characterCatalog.js
  - src/data/worldlines.js
  - src/data/worldline_commu/
  - src/composables/useTimelineData.js
  - src/components/SidePanel.vue
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
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run test
  - npm run build
  - npm run verify
  - npm run validate:data
  - git diff --check
acceptance:
  - Participant references, worldline references, source status, and uncertainty metadata are represented with explicit fields.
  - Existing public `canonicalId` values remain compatible or a migration/alias decision is documented before implementation.
  - Side panel and docs explain source basis and uncertainty without turning unknown dates into fake concrete dates.
  - Data validation covers the hardened model.
acceptance_focus:
  - source model
  - uncertainty metadata
  - ID compatibility
expected_output: full-implementation
checked_summary_ja: 参加者・世界線・出典・不確実性のデータモデルを強化する。

## Goal

Reduce long-term data quality risk by making source basis, participants, worldlines, and uncertainty machine-checkable instead of relying on free-form strings and notes.

## Scope

This plan is a backlog planning record. Treat implementation as Class C unless the user approves the exact field migration, because it can change the event data contract.

## Tasks

- [ ] Decide whether `participants` must always use `characterCatalog` IDs instead of display names.
- [ ] Define source metadata fields, such as `source`, `sourceStatus`, `basis`, or `confidence`.
- [ ] Define uncertainty fields, such as `dateConfidence`, `rangeReason`, `isInferred`, or `conflicts`.
- [ ] Add compatibility rules for existing `canonicalId` and URL restore behavior.
- [ ] Migrate a small representative slice first and validate UI/detail-panel rendering.
- [ ] Extend data validation for the new fields.
- [ ] Update `docs/data-structure.md` and `docs/processing-flow.md`.

## Out Of Scope

- Generic timeline app support.
- Broad visual redesign.
- Unapproved reinterpretation of chronology, source claims, or event meanings.
