# Disable event vertical scaling during timeline density changes

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
  - src/components/TimelineEvents.vue
  - src/utils/constants.js
  - tests/useTimelineLayout.test.js
  - docs/ui-behavior.md
  - docs/manual.md
  - README.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - agents-rules/invariants.md
  - agents-rules/ui-change-playbook.md
  - agents-rules/timeline-regression-checklist.md
validation:
  - npm run test -- tests/useTimelineLayout.test.js
  - npm run build
  - git diff --check
acceptance:
  - Timeline density changes must not increase the rendered height of normal events, selected rings, focus rings, uncertainty bands, summary bars, labels, or endpoint markers.
  - Density changes may continue to alter lane height, row spacing, timeline viewport height, and dense-summary behavior where those depend on available vertical space.
  - Existing zoom, drag, wheel, touch, keyboard selection, URL restore, and side-panel selection behavior must not regress.
acceptance_focus:
  - Fixed event visual height
  - Preserved vertical spacing and viewport expansion
  - Interaction regression check
expected_output: full-implementation
checked_summary_ja: 密度変更時にタイムラインイベント本体が縦拡大しないようにした。

## Notes

## Request Summary

The user reports that changing timeline density to widen the visible area also makes timeline events visually taller. The desired behavior is to expand the timeline display area and spacing without scaling the event bodies themselves.

## Current Hypothesis

- `useTimelineLayout` currently derives `eventBarHeight` as `Math.max(8, EVENT_BAR_HEIGHT * verticalScale.value)`.
- `eventBarHeight` is passed through `timelineRenderContext` and used by `TimelineEvents.vue` for normal event bars, selected rings, focus rings, uncertainty bands, summary bars, and inline-label visibility decisions.
- This couples density/vertical layout expansion to event visual size.

## Implementation Plan

1. Confirm the current density control path.
   - Trace `verticalScale` from user controls into `useTimelineLayout`.
   - Verify whether `verticalScale` represents density, vertical zoom, or both in the current UI wording.

2. Split layout spacing from event visual size.
   - Keep event body height anchored to the base `EVENT_BAR_HEIGHT`, or introduce a clearly named fixed visual-height metric if the component needs a separate contract.
   - Continue applying density scale to row gap, lane padding, and minimum lane height only where it expands or compresses available layout space.
   - Preserve `rowHeight` so sub-lane placement still has enough space around fixed-height events at each density setting.

3. Update render consumers.
   - Ensure `TimelineEvents.vue` receives the fixed event height for event bodies and related visual affordances.
   - Audit summary bars, uncertainty bands, selection/focus rings, endpoint markers, and inline label visibility so none implicitly reintroduce vertical scaling.

4. Add focused regression coverage.
   - Extend `tests/useTimelineLayout.test.js` to assert that changing `verticalScale` changes lane/viewport dimensions but does not change `eventBarHeight`.
   - Include a case that protects the low-density or expanded-display setting most likely to reproduce the reported issue.

5. Validate UI behavior.
   - Run the focused layout test and full build.
   - Use browser or visual verification when available for a representative density change, checking that event height remains stable while the visible timeline area changes.
   - Check key timeline regressions from `timeline-regression-checklist.md`, especially wheel zoom, drag pan, click selection, and label/viewport overlap.

## Decisions

1. Fixed event visual scope
   - Adopt a broad visual scope: normal event bars, selected rings, focus rings, uncertainty bands, summary bars, inline label height checks, and related event body affordances all use fixed event visual height.
   - Keep hit testing unchanged unless validation shows a concrete interaction regression.

2. Density responsibility
   - Treat density as a lane/layout spacing control, not an event body scale control.
   - Continue applying density scale to row gaps, lane padding, minimum lane height, viewport height, and dense-summary thresholds where applicable.

3. Overlap prevention
   - Preserve row height as fixed event height plus scaled row gap, with existing lower bounds.
   - Keep dense-summary behavior as the fallback for visually crowded areas.

4. Summary events and labels
   - Keep summary bars on the same fixed event-height contract as regular events.
   - Keep inline-label visibility based on the fixed event visual height so density does not make labels appear only because the row was scaled.

5. Saved view-state compatibility
   - Do not migrate or reset saved URL/local display state.
   - Existing `scale` values now change lane spacing and viewport height without changing event body height.

6. Documentation
   - Update human-facing behavior docs only where they describe vertical scale as changing event size or use wording that becomes inaccurate.
   - Do not add new in-app explanatory text.

## Implementation Notes

- `useTimelineLayout` now keeps `eventBarHeight` anchored to `EVENT_BAR_HEIGHT`.
- `verticalScale` still affects row gaps, lane padding, minimum lane height, viewport height, and dense-summary threshold behavior.
- `TimelineEvents.vue` continues to receive a single event visual-height contract, so event bars, summary bars, focus rings, selection rings, and uncertainty bands remain fixed through density changes.
- Human-facing docs now describe density as lane spacing/density rather than a generic vertical scale.

## Suggested Task Breakdown

- [x] Record adopted decisions in the active plan.
- [x] Split event visual height from density-scaled layout spacing.
- [x] Add a focused layout regression test for fixed event height.
- [x] Update behavior documentation for density wording.
- [x] Verify focused tests, build, and browser-rendered event heights.

## Validation Result

- `npm run test -- tests/useTimelineLayout.test.js`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser verification: passed on production preview `http://127.0.0.1:4174/timeline/` for desktop `1280x900` and mobile `375x812`; after four density-increase clicks, `event-bar` height stayed `12`, summary height stayed `16`, focus ring height stayed `20`, viewport height increased from `1142` to `1564.3838749999998`, and no console errors were reported.

## Out Of Scope

- Changing event copy, event data, chronology, source attribution, or IDs.
- Redesigning timeline cards, colors, labels, or density control wording unless existing text becomes inaccurate.
- Removing the density feature.
