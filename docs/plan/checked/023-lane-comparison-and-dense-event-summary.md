# Lane Comparison And Dense Event Summary

status: completed
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

## Decisions

- Model the lane display as explicit modes: all lanes, single-lane focus, and pinned-lane comparison.
- Keep existing `focus=<laneId>` URL compatibility and add a separate comparison URL state for pinned lane IDs.
- Treat comparison as a view-state layer over active lanes; if a pinned lane is no longer selected in the lane checkbox state, remove it from comparison.
- Clear comparison when the category changes; cross-category comparison remains out of scope.
- Use current category lane order for comparison ordering instead of pin order or custom ordering.
- Allow comparison setup with one pinned lane, but show comparison as a meaningful mode only when at least two valid lanes are pinned; reject a fifth pinned lane instead of auto-replacing an older pin.
- Add comparison affordances in the lane menu and event detail flow; keep lane-label click behavior as single-lane focus.
- In comparison mode, event search, navigation, and layout operate on the visible comparison lanes.
- Preserve selected-event state if comparison or filters hide it, matching existing filtered-selection behavior.
- Implement dense-event summaries in layout helpers after per-lane placement, replacing only dense rendered items with summary marks.
- Use screen density as the grouping driver: horizontal pixel proximity plus event count, with sub-lane crowding as a supporting signal.
- Separate exact/continuous and `singleWithinRange` summary groups when needed so uncertain timing never appears as a concrete date.
- Count dense rendering pressure by displayed instances, but keep canonical IDs available for list behavior and selection.
- Do not persist summary markers as URL selection state; they are rendering aids only.
- Make summary markers keyboard-focusable buttons that open a nearby list of member events or zoom into the represented range, not a fake event detail.
- Keep dense-summary thresholds in `utils/timelineLayout.js` pure helpers for focused Vitest coverage.
- Keep dense summaries automatic for this change; do not add a user setting unless later feedback shows the automatic behavior is disruptive.
- Treat comparison as a normal display condition: individual chips can clear it, and global display reset clears it.
- Document operation in `docs/manual.md` and detailed behavior in `docs/ui-behavior.md`.

## Approval Boundary

If aggregate rendering changes how users interpret uncertain dates or event duration, pause for product review before implementation.

## Suggested Task Breakdown

- [x] Define comparison-mode state and UI affordances for adding/removing pinned lanes.
- [x] Implement lane comparison without mutating category lane checkbox state.
- [x] Define zoom/density thresholds where event summaries appear.
- [x] Add aggregate markers with click/keyboard behavior that opens a list or zooms in, not a fake event detail.
- [x] Add tests for layout grouping, canonical identity, and uncertainty handling.
- [x] Update manual and behavior docs.

## Validation Result

- `npm run test`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- Browser verification: passed on local preview `http://127.0.0.1:4174/timeline/` with Chrome headless CDP for desktop lane comparison, dense summary popover, event selection, URL restore/sync, wheel zoom, drag pan, and mobile viewport load.

## Out Of Scope

- Data schema changes.
- Story interpretation or causality analysis.
- Cross-category global comparison unless explicitly requested later.
