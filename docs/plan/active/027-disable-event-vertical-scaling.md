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

## Out Of Scope

- Changing event copy, event data, chronology, source attribution, or IDs.
- Redesigning timeline cards, colors, labels, or density control wording unless existing text becomes inaccurate.
- Removing the density feature.
