status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
  - src/utils/constants.js
  - tests/useTimelineLayout.test.js
  - tests/useZoomMachine.test.js
  - docs/ui-behavior.md
  - docs/manual.md
required_specs:
  - AGENTS.md
  - ../AGENTS.md
  - ../GEMINI.md
  - docs/agent/spec-index.yaml
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - agents-rules/decision-boundaries.md
  - agents-rules/invariants.md
  - agents-rules/ui-change-playbook.md
  - agents-rules/timeline-regression-checklist.md
validation:
  - npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js
  - npm run test
  - npm run build
  - browser verification for desktop and mobile minimum density
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - git diff --check
  - bash scripts/check-agent-completion.sh
acceptance:
  - Low-end density removes avoidable lane height caused by sparse original sub-lane indexes.
  - Minimum density can reach a compact visual floor without causing overlapping items that share horizontal space.
  - Existing fixed event height, top padding, uncertainty rendering, and selection semantics remain intact.
acceptance_focus:
  - compact minimum density
  - no horizontal-overlap collision
  - desktop and mobile verification
expected_output: scoped implementation, tests, docs, validation, archived plan, commit
checked_summary_ja: 低密度時のレーン表示を不要な縦段が残らないように詰めた。

# Timeline Density Low-End Compaction

## Context

At the current minimum density, a lane can still appear as roughly two event rows when visible items retain sparse source sub-lane indexes.
Changing the minimum percentage to `25%` alone is not sufficient if lane height is still derived from those sparse indexes.

## Approach

- Measure the actual rendered items at minimum density to confirm whether height comes from unavoidable overlap or sparse sub-lane indexes.
- Prefer low-density re-packing of rendered items over shrinking event bars or uncertainty markers.
- Keep fixed top padding and fixed event drawing size.

## Finding

- In the focused `saki_hanami` full-range view, the previous `53%` minimum produced a `54px` lane because two nearby `singleWithinRange` items remained on separate rendered sub-lanes.
- Lowering the scale floor alone would not remove that height while the two rendered sub-lanes remained.

## Completed Changes

- Changed the vertical density operation floor to `25%`.
- Split lane-height interpolation into `25% -> 100%` and `100% -> max` so `100%` remains the standard lane-height baseline.
- Added a low-density summary threshold that summarizes two-sub-lane dense clusters at `60%` and below.
- Kept event bar height, uncertainty marker height, fixed top padding, and sub-lane spacing unchanged for rendered non-summary events.
- Updated user-facing density behavior docs.

## Validation Results

- `npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- Browser verification with Vite preview and headless Chrome:
  - Desktop `2048x1024`, focused `saki_hanami`, `scale=0.25`: lane height `32`, displayed density `25%`, dense two-sub-lane pair summarized as `期間内 2件`.
  - Mobile `375x812`, focused `saki_hanami`, `scale=0.25`: lane height `32`, displayed density `25%`.
  - Desktop continuity check: `25% -> 32`, `53% -> 42.45333333333333`, `100% -> 76`, `150% -> 105.38461538461539`.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
