# Data Source Model Hardening

status: completed
task_type: product_logic
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - src/types/timeline.d.ts
  - src/utils/events.js
  - src/data/integrity.js
  - src/data/worldline_commu/
  - src/composables/useEventDetailContext.js
  - src/composables/useEventSearchFilter.js
  - src/components/SidePanel.vue
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/ui-behavior.md
  - docs/manual.md
  - tests/
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
  - Source status, source basis, and uncertainty metadata are represented with explicit fields.
  - Structured source details support stable optional source IDs and claim-target metadata.
  - Existing public `canonicalId` values remain compatible or a migration/alias decision is documented before implementation.
  - Side panel and docs explain source basis and uncertainty without turning unknown dates into fake concrete dates.
  - Data validation covers the hardened model.
acceptance_focus:
  - source model
  - uncertainty metadata
  - ID compatibility
expected_output: full-implementation
checked_summary_ja: 出典・不確実性のデータモデルを強化する。

## Goal

Reduce long-term data quality risk by making source basis and uncertainty machine-checkable instead of relying on free-form strings and notes.

## Scope

The user approved the remaining direction on 2026-06-20.

Plan 013 already implemented the core uncertainty fields and UI. This plan now covers the source-model hardening that remains after 013:

- Keep existing `source: string[]` as a compatibility field.
- Use `sourceDetails` for structured source labels, optional stable source IDs, source status, claims, and claim targets.
- Split source-status unknown cases into unreviewed, unsourced, and unknown/classification-failed states.
- Keep `canonicalId` and shared URL behavior unchanged.
- Migrate a small representative slice first instead of rewriting every event.
- Keep `note` for human explanation; use machine-readable fields for classification and validation.

## Tasks

- [x] Add optional stable source IDs and claim-target metadata to `sourceDetails`.
- [x] Split source-status unknown cases into `unreviewed`, `unsourced`, and `unknown`.
- [x] Add compatibility rules documenting that `source` remains supported and `canonicalId` is unchanged.
- [x] Migrate a small representative slice first and validate UI/detail-panel rendering.
- [x] Extend data validation for source IDs, claim-target metadata, and impossible source-status combinations.
- [x] Update `docs/data-structure.md`, `docs/processing-flow.md`, `docs/ui-behavior.md`, and `docs/manual.md`.

## Implementation Notes

- Extended `sourceDetails` with optional `id` and `supports`.
- Added claim targets: `event`, `date`, `detail`, `worldline`, and `participants`.
- Split source status into `confirmed`, `inferred`, `conflicting`, `unreviewed`, `unsourced`, and `unknown`.
- Kept `source: string[]` as the compatibility field.
- Kept `canonicalId` and shared URL behavior unchanged.
- Migrated `hatsuboshi_founding_a_school` as the representative pilot event.
- Limited side-panel source-detail preview to the first three entries with overflow count.

## Validation Notes

- `npm run test`: passed.
- `npm run validate:data`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser verification: checked preview at `http://127.0.0.1:4174/timeline/` on desktop `1280x900` and mobile `375x812`.
- Browser evidence: `/tmp/gakumasu-source-model-desktop.png`, `/tmp/gakumasu-source-model-mobile.png`.
- Remaining unrelated warning: browser console reports an existing `Invalid event start date` warning for `saki_hanami`.

## Out Of Scope

- Generic timeline app support.
- Broad visual redesign.
- Unapproved reinterpretation of chronology, source claims, or event meanings.
