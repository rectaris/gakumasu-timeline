# Domain Uncertainty Semantics

status: backlog
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/types/timeline.d.ts
  - src/utils/events.js
  - src/composables/useTimelineData.js
  - src/components/SidePanel.vue
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

This plan is a backlog planning record. Treat implementation as Class C unless the user approves the exact uncertainty and chronology semantics.

## Tasks

- [ ] Define the allowed uncertainty states and how they map to current `singleWithinRange` and `continuous` behavior.
- [ ] Decide how to represent inferred events and conflicting sources without inventing fake concrete dates.
- [ ] Update side-panel wording so users can distinguish source basis, inference, and unresolved conflict.
- [ ] Add validation rules that prevent unsupported combinations.
- [ ] Add focused tests for uncertainty helpers and rendering decisions.
- [ ] Update docs for authoring and viewer interpretation.

## Out Of Scope

- Generic timeline app support.
- Broad story reinterpretation without source-backed approval.
