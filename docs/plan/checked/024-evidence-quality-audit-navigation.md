# Evidence Quality Audit Navigation

status: completed
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

## Decisions

1. Derive audit categories as multiple UI tags from existing metadata, not as a new persisted event field.
2. Treat source-missing as `eventSourceStatus(event) === "unsourced"`; keep `unknown` and `unreviewed` separate from source absence.
3. Add audit presets into the existing event search/filter surface, and combine them with other filters using the existing AND semantics.
4. Use existing evidence labels where possible, with audit-oriented labels only for filter groups and status chips.
5. Show all applicable audit tags in a stable order: conflict, source missing, unreviewed/unknown, inferred, range-only.
6. Resolve same-source navigation by `sourceDetails[].id`, then `url`, then normalized `label` / `source` text; do not use fuzzy matching.
7. Add a dedicated source filter and a same-source related section rather than stuffing source selection into the free-text query.
8. Include source and audit filters in view-state URL sync.
9. Lane quality summaries count lane-owned events only; common events are not included in lane-owned quality counts.
10. Search navigation remains canonical-ID based; lane summaries remain lane-owned event based.
11. Do not add new hard integrity failures for source absence in this task.
12. Expand source details in the panel when needed so all source items can be inspected and used for navigation.
13. Keep mobile audit controls inside the existing menu surface without adding a separate mobile-only mode.
14. Document derived rules in `docs/data-structure.md`, visible behavior in `docs/ui-behavior.md`, and user operation in `docs/manual.md`.

## Approval Boundary

Any change that reclassifies existing event confidence, chronology, source attribution, or conflict interpretation requires explicit user approval before implementation.

## Suggested Task Breakdown

- [x] Define audit categories and Japanese labels from existing uncertainty/source metadata.
- [x] Add filter presets or an audit panel using existing search/filter composition where possible.
- [x] Add source-chip actions in the detail panel for same-source navigation.
- [x] Add lane-level quality summary counts in the lane menu.
- [x] Add tests for category derivation and source navigation.
- [x] Update data-structure, manual, and behavior docs.

## Validation Result

- `npm run test`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- `scripts/validate-changes.py`: passed.
- Browser verification: passed on local dev server `http://127.0.0.1:5174/timeline/` with Playwright Chromium for desktop and mobile viewports; covered audit filter, source navigation, lane quality summary, and detail panel. Screenshots were saved to `/tmp/gakumasu-audit-desktop.png` and `/tmp/gakumasu-audit-mobile.png`.

## Out Of Scope

- Changing timeline event data.
- Resolving conflicts automatically.
- Inferring missing source metadata from free text.
