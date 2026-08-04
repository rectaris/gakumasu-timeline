# Event Information Hierarchy

status: completed
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/TimelineEvents.vue
  - src/components/TimelineSvg.vue
  - src/components/TimelineScaleOverlay.vue
  - src/components/TimelineScaleLabels.vue
  - src/components/TimelineLaneLabels.vue
  - src/composables/useTimelineLayout.js
  - src/composables/useTimelineScales.js
  - src/style.css
  - src/utils/labels.js
  - tests/labels.test.js
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

- [x] Define which event fields can appear directly on the bar: title, short title, icon/category, or none depending on width.
- [x] Add width-aware label display so text appears only when it fits and does not overlap markers.
- [x] Add selected and hover label behavior that exposes more context without permanent clutter.
- [x] Define zoom-aware scale density: year only, year/month, month/day, and edge hiding rules.
- [x] Add common-event and uncertainty indicators that remain visible even when labels are hidden.
- [x] Consider event importance or display priority only if existing data can support it without semantic changes.
- [x] Update manual and behavior docs for any new visible event labels or indicators.

## Implementation Decisions

- Use existing `title` data only for visible event labels; do not add `shortTitle`, `importance`, category icons, or timeline data semantics.
- Decide inline event labels with conservative text-width estimation and visible clipped bar width.
- Reserve marker space before rendering inline text, with extra reserve for `singleWithinRange` uncertainty markers.
- Keep common events quiet by default: show a compact common-event indicator and reveal title text only when selected, focused, or hovered.
- Keep uncertainty indicators higher priority than labels; never hide `singleWithinRange` markers to make room for text.
- Use pixel-density thresholds for scale labels so month/day labels depend on actual readable spacing, not only date span.
- Prefer year labels over month labels, and month labels over day labels when density is limited.
- Keep selected/hover/focus context temporary and non-interactive; labels must not steal event click, keyboard, drag, or touch behavior.
- Preserve detailed accessible labels through `aria-label` and SVG `<title>` even when visible labels are shortened.
- Keep reusable label and density rules in helpers so width and scale behavior can be unit-tested.

## Out Of Scope

- Adding new chronology semantics.
- Full search/filter implementation.
- Visual theme redesign beyond label and hierarchy needs.

## Completion Notes

- Added reusable label helpers for conservative text-width estimation, ellipsis, inline event label eligibility, hover/selection context labels, and pixel-density scale visibility.
- Rendered event titles directly on bars only when the visible clipped width and current bar height can support them without crowding markers.
- Kept common events quiet by default with a compact diamond indicator, while selected, focused, or hovered events can reveal title context.
- Preserved uncertainty markers as higher-priority visual meaning for `singleWithinRange` events.
- Switched scale label density to viewport pixel spacing so year/month/day labels appear only when readable.
- Reused the shared text-width estimator for lane label truncation.
- Updated `docs/manual.md` and `docs/ui-behavior.md` for visible event labels, common-event indicators, and pixel-density date labels.

## Validation Notes

- `npm run test`
- `npm run build`
- `npm run verify`
- `python3 scripts/validate-changes.py`
- `git diff --check`
- Browser/visual verification with Playwright:
  - `/tmp/gakumasu-desktop-labels-after-fix.png`
  - `/tmp/gakumasu-mobile-labels.png`
  - `/tmp/gakumasu-desktop-zoom-labels.png`
