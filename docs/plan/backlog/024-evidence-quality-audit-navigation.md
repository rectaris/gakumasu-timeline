# Evidence Quality Audit Navigation

status: backlog
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/SidePanel.vue
  - src/composables/useEventDetailContext.js
  - src/composables/useEventSearchFilter.js
  - src/data/integrity.js
  - src/utils/events.js
  - tests/dataIntegrity.test.js
  - tests/useEventDetailContext.test.js
  - tests/useEventSearchFilter.test.js
  - docs/data-structure.md
  - docs/manual.md
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run test
  - npm run build
  - npm run verify
  - browser verification for audit filters, source navigation, lane quality summaries, detail panel, and mobile viewport
  - git diff --check
acceptance:
  - Users can find uncertain, inferred, source-conflicting, and source-missing events quickly.
  - Source-based navigation links related records without implying causality or changing event meaning.
  - Lane-level quality summaries are derived from existing metadata and do not modify domain data.
  - Existing data-integrity tests remain the authority for invalid or incomplete data shapes.
acceptance_focus:
  - evidence review
  - source navigation
  - data quality visibility
expected_output: implementation-plan
checked_summary_ja: 不確実・矛盾・出典関連の監査ビューと探索導線を追加する。

## Goal

Make evidence quality and source relationships inspectable from the UI while preserving domain-data semantics.

## Improvement Items Covered

- Add an audit view or filter preset for `singleWithinRange`, inferred, range-only, conflicting, and missing-source events.
- Add source-based exploration from detail panel chips and source details.
- Add lane-level quality summaries such as uncertain count, conflict count, and missing-source count.

## Implementation Notes

- Derive all counts from existing event metadata; do not edit character names, chronology, source claims, or event interpretation.
- Keep labels evidence-based: "same source", "same participant", "same period", and "conflict" are allowed; causality wording is not.
- Reuse uncertainty helpers in `src/utils/events.js`.
- If new integrity warnings are added, keep them deterministic and covered by data-integrity tests.
- Distinguish source absence from source conflict; do not collapse them into a generic warning.

## Approval Boundary

Any change that reclassifies existing event confidence, chronology, source attribution, or conflict interpretation requires explicit user approval before implementation.

## Suggested Task Breakdown

- [ ] Define audit categories and Japanese labels from existing uncertainty/source metadata.
- [ ] Add filter presets or an audit panel using existing search/filter composition where possible.
- [ ] Add source-chip actions in the detail panel for same-source navigation.
- [ ] Add lane-level quality summary counts in the lane menu.
- [ ] Add tests for category derivation and source navigation.
- [ ] Update data-structure, manual, and behavior docs.

## Out Of Scope

- Changing timeline event data.
- Resolving conflicts automatically.
- Inferring missing source metadata from free text.
