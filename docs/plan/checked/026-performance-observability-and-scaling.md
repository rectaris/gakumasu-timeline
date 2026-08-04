# Performance Observability And Scaling

status: active
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineEvents.vue
  - src/style.css
  - src/composables/useTimelineData.js
  - src/composables/useTimelineLayout.js
  - src/composables/useTimelineMetrics.js
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

## Decisions

1. Expose browser metrics through an opt-in development-only panel, not normal production UI.
2. Gate the panel behind `import.meta.env.DEV` and an explicit URL flag or local developer setting.
3. Keep `npm run measure:layout` as the CLI baseline for synthetic layout pressure.
4. Count both canonical events and displayed event instances so common-event duplication is visible.
5. Split visible metrics into source visible events, rendered items after dense summaries, summary member events, and summary compression.
6. Define layout density as separate lane, screen, and sub-lane metrics instead of one overloaded number.
7. Derive metrics in pure helpers and expose them through a small composable so App-level wiring stays thin.
8. Compute browser metrics only while the debug panel is enabled.
9. Capture baseline snapshots for representative real states: category defaults, common-event on/off, filters, lane focus, lane comparison, and dense visible ranges.
10. Advance to scaling work only when metrics and browser interaction checks show a real issue.
11. Prefer follow-up optimization in this order: memoization, dense-summary threshold/aggregation adjustment, viewport virtualization.
12. Keep SVG replacement, canvas migration, user-facing telemetry, and numeric budgets out of scope.

## Suggested Task Breakdown

- [x] Define the smallest useful set of timeline metrics.
- [x] Add dev-only metric derivation with no production visual noise.
- [x] Add documentation for using metrics during browser verification.
- [x] Capture baseline metrics for representative current categories.
- [x] Decide whether follow-up work should target memoization, event aggregation, or viewport virtualization.

## Baseline Snapshot

- `npm run measure:layout`: passed with 48 lanes, 8640 synthetic events, 2874 visible events, 576 total sub-lanes, and median timings of `groupEventsByLane=0.149ms`, `buildLaneLayout=0.652ms`, `visibleEventLayouts=0.174ms`.
- Dev browser default category with `debugMetrics=1`: 13 lanes, 177 displayed instances, 33 canonical events, 177 source-visible events, 122 rendered items, 13 summary items, and 68 summary member events.

## Follow-up Decision

- Do not start memoization, additional aggregation, or viewport virtualization now.
- Use this metrics foundation for future performance work and prioritize follow-up optimization in this order when metrics plus interaction checks show a real issue: memoization, dense-summary threshold/aggregation adjustment, viewport virtualization.

## Validation Result

- `npm run test -- tests/useTimelineLayout.test.js`: passed.
- `npm run measure:layout`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `npm run verify`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- Browser verification: passed on production preview `http://127.0.0.1:4174/timeline/?debugMetrics=1`; confirmed debug metrics do not render in production, SVG renders, no console errors, and wheel/drag smoke passed.
- Browser verification: passed on dev server `http://127.0.0.1:5174/timeline/?debugMetrics=1`; confirmed metrics panel renders, wheel zoom, drag, event selection, event search filter, lane hide/show, and mobile `375x812` load without console errors.

## Out Of Scope

- Replacing SVG rendering.
- Numeric performance budgets before repeatable measurement exists.
- User-facing analytics or telemetry.
