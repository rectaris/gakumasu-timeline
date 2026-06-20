# Performance Observability And Scaling

status: backlog
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineEvents.vue
  - src/composables/useTimelineData.js
  - src/composables/useTimelineLayout.js
  - src/utils/timelineLayout.js
  - tests/useTimelineLayout.test.js
  - docs/development.md
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
  - browser verification for drag, wheel zoom, filter changes, lane hide/show, event selection, and large visible event sets
  - git diff --check
acceptance:
  - Developers can inspect rendered event counts, lane counts, and layout density during performance work.
  - Instrumentation is dev-only or unobtrusive and does not affect normal user-facing UI.
  - Any scaling optimization preserves selection, URL restore, common-event identity, and uncertainty rendering.
  - Timeline interaction checks remain the required proof for perceived performance.
acceptance_focus:
  - render observability
  - scaling safety
  - interaction feel
expected_output: implementation-plan
checked_summary_ja: タイムライン描画の性能観測と将来の大規模化に備える。

## Goal

Create a measurement foundation for future timeline scaling before introducing heavier rendering optimizations.

## Improvement Items Covered

- Add lightweight development metrics for lane count, event count, visible event count, filtered count, and layout density.
- Use metrics to decide whether virtualization, aggregation, or memoization is needed.
- Preserve manual interaction checks for wheel zoom, drag, touch, filters, and selection.

## Implementation Notes

- Prefer development-only diagnostics or console/debug-panel controls gated by build mode or explicit settings.
- Do not introduce broad optimization rewrites without evidence from metrics or observed interaction regressions.
- Keep layout derivation testable in helper functions.
- Avoid expensive color conversion, text measurement, or data reshaping inside hot render loops.
- Coordinate with plan 023 if dense-event aggregation becomes the chosen scaling strategy.

## Suggested Task Breakdown

- [ ] Define the smallest useful set of timeline metrics.
- [ ] Add dev-only metric derivation with no production visual noise.
- [ ] Add documentation for using metrics during browser verification.
- [ ] Capture baseline metrics for representative current categories.
- [ ] Decide whether follow-up work should target memoization, event aggregation, or viewport virtualization.

## Out Of Scope

- Replacing SVG rendering.
- Numeric performance budgets before repeatable measurement exists.
- User-facing analytics or telemetry.
