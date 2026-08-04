# Domain Uncertainty Semantics

status: completed
task_type: product_logic
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - src/types/timeline.d.ts
  - src/utils/events.js
  - src/composables/useTimelineData.js
  - src/composables/useEventDetailContext.js
  - src/composables/useEventSearchFilter.js
  - src/components/SidePanel.vue
  - src/data/integrity.js
  - src/data/worldline_commu/
  - docs/data-structure.md
  - docs/ui-behavior.md
  - docs/processing-flow.md
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
  - npm run validate:data
  - browser verification for uncertainty rendering and side-panel detail
  - git diff --check
acceptance:
  - Gakumasu-specific uncertainty states are explicit and cannot be confused with confirmed concrete dates.
  - The UI distinguishes confirmed, inferred, range-only, and conflicting-source events when those states exist.
  - Documentation explains each uncertainty state and how it affects display.
  - Existing `singleWithinRange` behavior remains compatible with the expanded uncertainty model or its migration is approved and documented.
acceptance_focus:
  - domain semantics
  - uncertainty display
  - source conflict handling
expected_output: full-implementation
checked_summary_ja: 学マス時系列に固有の不確実性・根拠・世界線意味論を強化する。

## Goal

Improve domain fit by making inferred timing, confirmed timing, range-only timing, and source conflicts explicit in both data and UI.

The user approved the semantic direction on 2026-06-20:

- Keep `occurrenceType` as the occurrence-shape field (`continuous` or `singleWithinRange`).
- Represent chronology certainty, source basis, range reason, and source conflicts as separate metadata fields.
- Keep existing `singleWithinRange` data compatible by deriving range-only uncertainty when no richer metadata is present.
- Use structured metadata for new source/uncertainty details while keeping existing `source: string[]` compatible.
- Use Japanese UI labels such as `確定`, `推定`, `期間内の1日`, and `出典矛盾`; do not expose internal enum values directly.
- Treat source-conflict and inferred chronology as explicit UI states, not as concrete dates.

## Tasks

- [x] Define the allowed uncertainty states and how they map to current `singleWithinRange` and `continuous` behavior.
- [x] Add explicit event metadata fields for date confidence, source basis, range reason, and source conflicts.
- [x] Represent inferred events and conflicting sources without inventing fake concrete dates.
- [x] Update side-panel wording so users can distinguish source basis, inference, and unresolved conflict.
- [x] Add validation rules that prevent unsupported combinations.
- [x] Add focused tests for uncertainty helpers and rendering decisions.
- [x] Update docs for authoring and viewer interpretation.

## Implementation Notes

- Added optional event fields: `dateConfidence`, `sourceBasis`, `sourceStatus`, `rangeReason`, `sourceDetails`, and `conflicts`.
- `occurrenceType` remains the occurrence-shape field.
- Existing `singleWithinRange` events derive `dateConfidence: "rangeOnly"` and do not require immediate data migration.
- Source conflicts derive the highest-priority UI state `conflicting`.
- Detail-panel labels are Japanese user-facing labels; enum values are not shown directly.

## Validation Notes

- `npm run test`: passed.
- `npm run validate:data`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- Browser verification: checked preview at `http://127.0.0.1:4174/timeline/` on desktop `1280x900` and mobile `375x812`.
- Browser evidence: `/tmp/gakumasu-uncertainty-desktop.png`, `/tmp/gakumasu-uncertainty-mobile.png`.
- Remaining unrelated warning: browser console reports an existing `Invalid event start date` warning for `saki_hanami`; no new runtime error remained after the null-safe helper fix.

## Out Of Scope

- Generic timeline app support.
- Broad story reinterpretation without source-backed approval.
