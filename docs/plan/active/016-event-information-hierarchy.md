# Event Information Hierarchy

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/TimelineEvents.vue
  - src/components/TimelineScaleOverlay.vue
  - src/components/TimelineScaleLabels.vue
  - src/components/TimelineLaneLabels.vue
  - src/composables/useTimelineLayout.js
  - src/composables/useTimelineScales.js
  - src/utils/labels.js
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
  - browser verification for zoom levels, label density, and event selection
  - git diff --check
acceptance:
  - Users can identify important visible events without opening every detail panel.
  - Event labels, year/month/day labels, and lane labels remain legible without collision.
  - Zoomed-out views reduce noise while zoomed-in views reveal useful detail.
  - Uncertain and common events remain distinguishable from normal continuous events.
acceptance_focus:
  - scannability
  - label density
  - zoom-aware detail
expected_output: implementation-plan
checked_summary_ja: イベント・目盛り・レーンの情報階層を整理して読みやすくする。

## Goal

Make the timeline easier to scan by showing the right amount of information at each zoom level.

## Tasks

- [ ] Define which event fields can appear directly on the bar: title, short title, icon/category, or none depending on width.
- [ ] Add width-aware label display so text appears only when it fits and does not overlap markers.
- [ ] Add selected and hover label behavior that exposes more context without permanent clutter.
- [ ] Define zoom-aware scale density: year only, year/month, month/day, and edge hiding rules.
- [ ] Add common-event and uncertainty indicators that remain visible even when labels are hidden.
- [ ] Consider event importance or display priority only if existing data can support it without semantic changes.
- [ ] Update manual and behavior docs for any new visible event labels or indicators.

## Out Of Scope

- Adding new chronology semantics.
- Full search/filter implementation.
- Visual theme redesign beyond label and hierarchy needs.
