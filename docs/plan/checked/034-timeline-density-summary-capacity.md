# Timeline density summary capacity

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/composables/useTimelineLayout.js
  - src/utils/constants.js
  - src/utils/timelineLayout.js
  - tests/useTimelineLayout.test.js
  - docs/ui-behavior.md
  - docs/manual.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
validation:
  - npm run test -- tests/useTimelineLayout.test.js
  - npm run test
  - npm run build
  - browser verification
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - git diff --check
  - python3 scripts/validate-changes.py
  - bash scripts/check-agent-completion.sh
acceptance:
  - Dense summaries use lane density as vertical display capacity, not only fixed thresholds.
  - A six-event cluster that fits within expanded lane capacity renders as individual events at high density.
  - Low density still summarizes multi-sublane clusters so minimum lanes can collapse to one event slot.
acceptance_focus:
  - high-density summary release
  - low-density minimum lane preservation
  - fixed event height and sub-lane spacing
expected_output: full-implementation
checked_summary_ja: レーン密度を上げた時に、密集イベントの個別表示許容量も増えるようにした。

## Notes

User-observed issue: at 545% lane density and a tall focused lane, a `期間内6件`
summary remains even though the lane has enough vertical room to show all
members.

Current suspected cause: `visibleEvents` uses fixed summary thresholds after
95% density, so lane expansion does not increase the number of individually
rendered events.

## Completed Changes

- Added density-derived dense-summary capacity.
- Kept low density behavior at one visible sub-lane through `60%`.
- Kept the `100%` summary baseline at three individually visible sub-lanes.
- Increased individually visible sub-lane and nearby-event capacity as density
  expands beyond `100%`.
- Documented that high density makes dense summaries release back into
  individual event rendering when vertical room is available.

## Validation

- `npm run test -- tests/useTimelineLayout.test.js`
- `npm run test`
- `npm run build`
- Browser verification with Vite preview:
  - desktop `2048x1024`, `focus=saki_hanami`, `range=-1488,744`,
    `scale=5.45`: `summaryCount = 0`, `eventCount = 11`, density label `545%`.
  - desktop `2048x1024`, same range, `scale=0.25`: dense summaries remain,
    including `期間内 6件`, density label `25%`.
  - mobile `375x812`, same high-density range: `summaryCount = 0`,
    `eventCount = 11`, density label `545%`.
  - mobile `375x812`, same low-density range: dense summaries remain at `25%`.
- `python3 scripts/lint-plan-docs.py`
- `python3 scripts/format-plan-docs.py --check`
- `git diff --check`
- `python3 scripts/validate-changes.py`
