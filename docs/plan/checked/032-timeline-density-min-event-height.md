status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/utils/constants.js
  - src/composables/useTimelineLayout.js
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
  - browser verification for desktop and mobile density minimum
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - git diff --check
  - bash scripts/check-agent-completion.sh
acceptance:
  - Minimum density lane height for one rendered event equals event bar height plus fixed top and bottom padding.
  - Multi-sub-lane minimum height is derived from one event height plus additional sub-lane center spacing, not from one spacing slot per event.
  - Density still scales lane height continuously above the minimum and keeps fixed event height, top padding, and sub-lane spacing.
acceptance_focus:
  - one-event minimum
  - dense summary minimum
  - continuous density scaling
expected_output: scoped implementation, tests, docs, validation, archived plan, commit
checked_summary_ja: レーン密度の最小値をイベントバー1本分と固定上下余白に合わせた。

# Timeline Density Minimum Event Height

## Context

The current minimum lane-height constant uses `EVENT_SUB_LANE_SPACING + LANE_PADDING * 2`.
`EVENT_SUB_LANE_SPACING` is the distance between sub-lane centers, not the visual height of a single event.

As a result, the minimum lane can stay taller than a single rendered event needs.

## Implementation Notes

- Define the single-event minimum as `EVENT_BAR_HEIGHT + LANE_PADDING * 2`.
- Compute rendered content height as one event bar plus additional sub-lane spacing for each extra rendered sub-lane.
- Keep the fixed top padding and sub-lane spacing behavior unchanged.
- Preserve the FHD-based maximum lane-height behavior.

## Completed Changes

- Changed `MIN_SINGLE_EVENT_LANE_HEIGHT` from sub-lane spacing based height to event-bar based height.
- Changed lane content height calculation so the first rendered item consumes event-bar height and only additional rendered sub-lanes add `EVENT_SUB_LANE_SPACING`.
- Added regression coverage for the single-event minimum and two rendered sub-lanes at minimum density.
- Updated density behavior documentation to describe the event-bar based minimum.

## Validation Results

- `npm run test -- tests/useTimelineLayout.test.js tests/useZoomMachine.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- Browser verification with Vite preview and headless Chrome:
  - Desktop `2048x1024`, focused `saki_hanami`, `scale=0.533333`, `range=-5500,-5450`: lane height `32`, event bar height `12`, top padding `10`, bottom padding `10`.
  - Mobile `375x812`, focused `saki_hanami`, `scale=0.533333`, `range=-5500,-5450`: lane height `32`, event bar height `12`, top padding `10`, bottom padding `10`.
  - Desktop `2048x1024`, focused `saki_hanami`, `scale=0.533333`, `range=0,1400`: summarized lane height `32`.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `git diff --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
