# Lane Comparison And Dense Event Summary

status: active
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineEvents.vue
  - src/components/TimelineLaneLabels.vue
  - src/composables/useCategoryFilter.js
  - src/composables/useTimelineData.js
  - src/composables/useTimelineLayout.js
  - src/utils/timelineLayout.js
  - tests/useTimelineLayout.test.js
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
  - browser verification for lane comparison, dense areas, common-event selection, URL restore, drag, wheel, and mobile viewport
  - git diff --check
acceptance:
  - Users can compare a small set of lanes without permanently changing lane checkbox selections.
  - Dense event areas become easier to scan at low zoom without implying unsupported chronology.
  - Common-event canonical selection and per-lane render identity remain correct.
  - Aggregated or summarized marks never make `singleWithinRange` look like a concrete date.
acceptance_focus:
  - lane comparison
  - dense-event readability
  - uncertainty preservation
expected_output: implementation-plan
checked_summary_ja: 複数レーン比較と密集イベントの要約表示を追加する。

## Goal

Support side-by-side comparison and high-density reading while preserving the current timeline invariants.

## Improvement Items Covered

- Add a pinned-lane comparison mode for two to four lanes.
- Add aggregate or summary marks for dense event clusters when zoomed out.
- Keep lane focus as temporary state rather than changing the user's saved lane selection.

## Implementation Notes

- Build comparison mode as a view-state layer over active lanes, similar to existing lane focus.
- Avoid adding new chronology semantics; aggregation is a rendering aid only.
- Aggregates should represent visible candidate ranges or counts, not inferred exact dates.
- Preserve `canonicalId` for lookup and URL sharing and `instanceId` for render identity.
- Prefer focused helper functions in `utils/timelineLayout.js` so dense-layout behavior can be tested.

## Approval Boundary

If aggregate rendering changes how users interpret uncertain dates or event duration, pause for product review before implementation.

## Suggested Task Breakdown

- [ ] Define comparison-mode state and UI affordances for adding/removing pinned lanes.
- [ ] Implement lane comparison without mutating category lane checkbox state.
- [ ] Define zoom/density thresholds where event summaries appear.
- [ ] Add aggregate markers with click/keyboard behavior that opens a list or zooms in, not a fake event detail.
- [ ] Add tests for layout grouping, canonical identity, and uncertainty handling.
- [ ] Update manual and behavior docs.

## Out Of Scope

- Data schema changes.
- Story interpretation or causality analysis.
- Cross-category global comparison unless explicitly requested later.
