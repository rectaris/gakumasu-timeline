# Timeline Interaction Scale

status: active
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

- [ ] Measure current render cost and identify whether event count, lane count, or label generation dominates.
- [ ] Reduce unnecessary work for offscreen events and lanes.
- [ ] Consider lane-level virtualization only if simpler clipping/filtering is insufficient.
- [ ] Add focused tests for selection, lane hide/show, URL restore, and `singleWithinRange` rendering when touched.

## Out Of Scope

- Generic timeline library replacement.
- Visual philosophy redesign.
- Data model migration.
