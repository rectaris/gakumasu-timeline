# Orientation And Range Navigation

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineScaleOverlay.vue
  - src/components/TimelineSvg.vue
  - src/components/ZoomControls.vue
  - src/composables/useTimelineLayout.js
  - src/composables/useTimelineScales.js
  - src/composables/useZoomMachine.js
  - src/style.css
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
  - browser verification for minimap/range control, selected-event return, zoom presets, drag, wheel, and mobile viewport
  - git diff --check
acceptance:
  - Users can understand where the current viewport sits within the full timeline.
  - Users can jump back to the selected event after panning or zooming away.
  - Zoom presets improve orientation without replacing existing fine-grained zoom controls.
  - Added controls do not cover selected event content, lane labels, or close actions.
acceptance_focus:
  - orientation
  - viewport recovery
  - compact controls
expected_output: implementation-plan
checked_summary_ja: 現在位置を把握しやすくし、選択イベントや期間プリセットへ素早く戻れるようにする。

## Goal

Add lightweight orientation tools for large or dense timelines while preserving the current direct manipulation feel.

## Improvement Items Covered

- Add a compact minimap or range overview for the full timeline span.
- Add a "return to selected event" action.
- Add purpose-based zoom presets such as overview, year, month, and detail.

## Implementation Notes

- Reuse `viewRange`, `timeBounds`, and existing zoom-machine behavior rather than adding a parallel viewport model.
- Keep the minimap informational and compact; it should not become the visual center of the app.
- Prefer controls that can be hidden or collapsed on narrow viewports.
- The selected-event return action should scroll vertically and adjust horizontal range only enough to reveal the event.
- Presets should be deterministic and documented in terms of abstract timeline days/months.

## Decisions

- Use a compact range overview in `ZoomControls`, not a full event-density minimap.
- Make the overview click-target jump the viewport center to the clicked full-range position; do not add draggable handles in this plan.
- Keep mobile compact by hiding the range overview on narrow viewports while leaving presets and selected-event return available.
- Keep selected-event return explicit: preserve the current selection, adjust the horizontal range only enough to reveal the event, and scroll to the lane when the lane is currently renderable.
- Define presets by abstract timeline spans: overview = full range, year = 12 * 31 days, month = 31 days, detail = 7 days.
- Center presets on the selected event when one is selected; otherwise preserve the current viewport center.
- Reuse existing URL range synchronization. Do not add preset-name or range-control URL parameters here.
- Keep selection auto-follow in `useZoomMachine`, but expose an explicit selected-event reveal action for returning after manual panning.
- Represent `singleWithinRange` and common-event markers by their full display range / canonical selection position, never by an invented concrete day.

## Suggested Task Breakdown

- [x] Expose full time bounds and viewport ratio from `useZoomMachine`.
- [x] Prototype a compact range overview with current-range and selected-event markers.
- [x] Add selected-event return action with disabled state when no event is selected.
- [x] Add zoom preset actions using the existing zoom machine.
- [x] Verify wheel, drag, touch, and keyboard interactions still feel unchanged.
- [x] Update manual and behavior docs.

## Out Of Scope

- Event clustering or aggregate rendering.
- Persistent URL state for range controls; use plan 020 for that.
- A separate mobile navigation system.
