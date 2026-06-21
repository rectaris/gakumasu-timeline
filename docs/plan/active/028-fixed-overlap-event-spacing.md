# Fixed spacing between overlapping timeline events

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
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
  - Changing lane density must not change the vertical distance between overlapping events placed on adjacent sub-lanes.
  - Adjacent sub-lane events must keep enough default vertical gap that event bars, selection rings, focus rings, uncertainty bands, endpoint markers, and labels do not visually overlap.
  - Event body height must remain fixed as established by plan 027.
  - Density changes may still alter lane padding, minimum lane height, total timeline viewport height, and non-event spacing.
  - Timeline zoom, drag, wheel, touch, keyboard selection, URL restore, dense summaries, and `singleWithinRange` semantics must not regress.
acceptance_focus:
  - Fixed sub-lane spacing
  - Non-overlapping default gap
  - Preserved density controls
expected_output: full-implementation
checked_summary_ja: 密度変更時に重なりイベント間の縦距離が変わらないようにした。

## Notes

## Request Summary

The user reports that changing timeline density still changes the vertical distance between events whose date ranges overlap and are placed above/below each other in the same lane. The requested behavior is to keep that event-to-event distance constant, with a default gap large enough to prevent overlapping visuals.

## Current Hypothesis

- Plan 027 fixed `eventBarHeight`, but `useTimelineLayout` still computes `rowGap` as `Math.max(4, EVENT_ROW_GAP * verticalScale.value)`.
- `rowHeight = eventBarHeight + rowGap`, and `yPos()` uses `subLaneIndex * rowHeight`, so adjacent overlapping-event distance still changes when `verticalScale` changes.
- The likely fix is to make the event row spacing contract fixed, while keeping density scaling for lane-level padding or minimum lane height where it does not change event-to-event spacing.

## Implementation Plan

1. Confirm the layout ownership.
   - Trace `layoutMetrics.rowHeight`, `laneHeight`, and `yPos()` in `src/composables/useTimelineLayout.js`.
   - Confirm that overlapping events are separated by `subLaneIndex * rowHeight`.

2. Split sub-lane event spacing from lane density.
   - Keep `eventBarHeight` fixed.
   - Keep the adjacent sub-lane distance fixed by using a fixed event row gap or fixed event row height.
   - Choose a default gap that covers event body height plus surrounding visual affordances such as focus rings and uncertainty bands.

3. Preserve useful density behavior.
   - Continue applying `verticalScale` only to lane-level spacing such as lane padding and minimum lane height, unless validation shows this produces confusing behavior.
   - Ensure density changes can still expand or reduce total visible timeline space without moving overlapping event centers farther apart or closer together.

4. Add regression coverage.
   - Extend `tests/useTimelineLayout.test.js` so `yPos(0, 1) - yPos(0, 0)` remains constant across density values.
   - Assert that the fixed sub-lane distance remains greater than the event height plus a default non-overlap gap.
   - Keep or adjust the existing plan-027 test so it continues to prove event height is fixed.

5. Update behavior docs if needed.
   - Clarify that lane density does not change event height or overlapping-event spacing.
   - Avoid adding new in-app explanatory text unless current visible wording becomes inaccurate.

6. Validate UI behavior.
   - Run the focused layout test and `npm run build`.
   - Use browser or visual verification when available to compare density changes at desktop and mobile viewports.
   - Check timeline regression risks: wheel zoom, drag pan, click selection, dense summary behavior, and `singleWithinRange` uncertainty rendering.

## Decisions To Confirm During Implementation

1. Fixed gap source
   - Prefer deriving fixed sub-lane distance from existing constants (`EVENT_BAR_HEIGHT + EVENT_ROW_GAP`) unless visual verification shows the gap is too tight.
   - Add or rename a constant only if it makes the event spacing contract clearer.

2. Density scope
   - Treat density as lane-level padding/viewport spacing, not event-row spacing.
   - Keep saved `scale` URL compatibility; existing scale values should now affect lane-level spacing only.

3. Hit testing
   - Keep hit areas tied to existing event visuals unless browser verification shows touch/click usability regressed.

## Out Of Scope

- Changing event data, chronology, source attribution, labels, colors, or IDs.
- Redesigning event bars or dense summary visuals beyond spacing required to satisfy the request.
- Removing the lane density feature or changing URL parameter names.
