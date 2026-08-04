# Timeline Interaction Scale

status: completed
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineSvg.vue
  - src/components/TimelineEvents.vue
  - src/components/TimelineLaneLabels.vue
  - src/composables/useTimelineLayout.js
  - src/composables/useZoomMachine.js
  - src/composables/usePointer.js
  - tests/
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
  - npm run measure:layout
  - npm run build
  - npm run verify
  - browser verification for zoom, drag, selection, filters, and mobile viewport
  - git diff --check
acceptance:
  - Timeline remains responsive with materially larger event and lane counts.
  - Offscreen event/lane work is reduced where practical without changing visible behavior.
  - Zoom, drag, click suppression, URL restore, lane hide/show, and common-event selection remain stable.
  - Focused regression tests or browser smoke coverage exist for changed interaction paths.
acceptance_focus:
  - scale readiness
  - interaction stability
  - regression coverage
expected_output: full-implementation
checked_summary_ja: イベント数・レーン数増加に耐える表示と操作を強化する。

## Goal

Improve UI/interaction quality as data grows while preserving the current timeline feel.

## Tasks

- [x] Measure current render cost and identify whether event count, lane count, or label generation dominates.
- [x] Reduce unnecessary work for offscreen events and lanes.
- [x] Consider lane-level virtualization only if simpler clipping/filtering is insufficient.
- [x] Add focused tests for selection, lane hide/show, URL restore, and `singleWithinRange` rendering when touched.

## Decisions

- Performance target: use repeatable synthetic layout checks plus browser smoke checks. Do not rely on prose-only claims.
- Layout stability: keep lane/sub-lane assignment based on the full filtered event set, not only the current horizontal viewport, so event vertical positions do not jump while panning or zooming.
- First implementation path: reduce repeated grouping/filtering and SVG render volume before attempting lane virtualization.
- Virtualization threshold: defer lane-level virtualization unless measurement shows event/render culling is insufficient.
- Selection and URL behavior: keep selected-event state separate from render visibility. Do not clear selection only because an event is offscreen.
- Common events: preserve per-lane display instances and shared `canonicalId` behavior unless measurement proves this is the dominant bottleneck.
- Scale labels: prefer bounded tick generation or density gates over changing the abstract 31-day month model.
- Documentation: update `docs/manual.md` or `docs/ui-behavior.md` only when user-visible behavior changes.

## Implementation Notes

- Started with `useTimelineLayout.js` because it grouped events by filtering the full event list once per lane and then flattened all lane layouts when deriving visible events.
- Extracted pure layout helpers so synthetic measurement can run in Node without browser automation.
- Added focused tests around lane layout stability, horizontal culling, and `singleWithinRange` render bounds.

## Measurement

- Command: `npm run measure:layout`
- Synthetic load: 48 lanes, 8,640 total events, 2,874 visible events, 20 iterations.
- Median timings from final validation:
  - `groupEventsByLane`: 0.100 ms
  - `buildLaneLayout`: 0.790 ms
  - `visibleEventLayouts`: 0.190 ms
- Decision: lane-level virtualization is not needed for this pass. Keep it deferred unless browser smoke checks show visible jank with larger data.

## Completion Notes

- `useTimelineLayout.js` now groups events by lane once per all-event change instead of filtering the full event list once per lane.
- Visible event derivation now walks existing lane layouts directly and clips render bounds in pure helpers.
- Browser smoke covered wheel zoom, drag/click suppression, event selection, URL restore, event filter UI, and mobile viewport rendering.
- User-visible behavior did not change, so `docs/manual.md` and `docs/ui-behavior.md` were left unchanged.

## Validation Results

- `npx vitest run tests/useTimelineLayout.test.js`
- `npm run test`
- `npm run measure:layout`
- `npm run build`
- `npm run verify`
- `git diff --check`
- `python3 scripts/validate-changes.py`
- Playwright smoke against `npm run preview -- --host 127.0.0.1 --port 4174`

## Remaining Risk

- Completion gate still reports the unrelated open active plan `docs/plan/active/012-data-authoring-workflow.md`.

## Out Of Scope

- Generic timeline library replacement.
- Visual philosophy redesign.
- Data model migration.
