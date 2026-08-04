# View State Persistence And Sharing

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/composables/useCategoryFilter.js
  - src/composables/useEventSearchFilter.js
  - src/composables/usePersistedSettings.js
  - src/composables/useSelection.js
  - src/composables/useZoomMachine.js
  - src/utils/dom.js
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
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npm run test
  - npm run build
  - npm run verify
  - browser verification for URL restore, filter chips, lane visibility, selection, and mobile viewport
  - git diff --check
acceptance:
  - Users can restore useful timeline state after reload without losing canonical event URL behavior.
  - Shareable state is explicit, compact, and backward compatible with existing `?event=<canonicalId>` links.
  - Active search/filter/lane-focus state is visible outside the side menu and can be cleared predictably.
  - Hidden selected events remain inspectable and clearly marked when current filters exclude them.
acceptance_focus:
  - shareable state
  - visible filters
  - restore stability
expected_output: implementation-plan
checked_summary_ja: 表示状態の保存・共有と絞り込み状態の見える化を追加する。

## Goal

Make timeline exploration resumable and shareable without weakening the existing canonical event URL contract.

## Improvement Items Covered

- Persist or share category, visible lanes, event search query, filters, viewport range, and lane focus.
- Add compact active-filter chips or state indicators outside the side menu.
- Provide one-click clear actions for active search/filter/focus state.

## Implementation Notes

- Preserve `?event=<canonicalId>` as the primary shared event selection mechanism.
- Prefer a versioned URL-state shape if filter and viewport state is added to the URL.
- Use localStorage only for personal preference state, not for state that a user expects to share.
- Keep generated URLs short enough for normal browser and chat use; omit default values.
- Treat lane IDs, category IDs, and canonical IDs as compatibility-sensitive values.
- Avoid restoring stale lane state in a way that hides all content without a visible recovery path.
- Serialize shareable exploration state as additive query parameters alongside `event`; keep existing event-only URLs valid.
- Use `view=1` as the view-state version marker and ignore unknown or malformed optional state rather than failing the full restore.
- Omit default state from generated URLs: default category, all lanes selected, default lane sort, empty event query, default filters, full horizontal range, `verticalScale=1`, and no lane focus.
- Represent lane visibility with an explicit include/exclude mode so URLs stay compact for both "few lanes visible" and "almost all lanes visible" cases.
- Treat lane-menu search as transient menu input and do not persist or share it.
- Share lane sort, horizontal viewport range, vertical density, event search/filter state, category, visible lanes, and lane focus because they change the visible timeline.
- Keep theme, intro-guide dismissal, zoom hints, and normal common-event display preference as local personal settings; include common-event visibility only in an explicit copied view-state URL when needed to reproduce the shared view.
- Update the current URL with debounced `history.replaceState` for non-event view changes; avoid deep `pushState` browser-history workflows.
- Apply restored state in stages: category/lane/sort first, event filters next, selection next through the existing `event` restore, then viewport and lane focus after timeline bounds are available.
- Preserve selected hidden events: filters may hide the selected event from the timeline, but the detail panel and canonical `event` URL state remain inspectable.
- Add a visible active-state bar near the timeline body with individual clear controls and a scoped "display conditions clear" action; do not make this clear action close the selected event.
- Keep the existing detail-panel event URL copy behavior; add a separate explicit view-state copy action for stateful sharing.

## Approval Boundary

Any change that alters the meaning or compatibility of existing public event URLs must be reviewed before implementation. If the implementation changes public URL behavior beyond additive optional parameters, promote this plan as Class C and record explicit approval.

## Suggested Task Breakdown

- [x] Define a versioned state serialization contract and default-elision rules.
- [x] Add parse/restore helpers with unit tests for missing, malformed, and legacy URL parameters.
- [x] Add active-state chips for search, filters, lane focus, and non-default view state.
- [x] Add clear actions for individual chips and all active state.
- [x] Update manual and behavior docs.

## Completion Notes

- Added additive `view=1` URL state for category, lane sort, lane visibility, event query/filter state, horizontal range, vertical scale, and lane focus.
- Kept `event=<canonicalId>` as the primary event selection URL and preserved it while replacing view-state params.
- Added a timeline active-state bar with individual clear chips, display-state clear, and explicit display URL copy.
- Kept personal settings in localStorage; common-event visibility is included only in explicit display URL copies when needed.
- Added `tests/viewStateUrl.test.js` for default elision, malformed parsing, lane include/exclude, event param preservation, and explicit common-event sharing.

## Validation Completed

- `npm run test`
- `npm run build`
- `npm run verify`
- `git diff --check`
- `python3 scripts/lint-plan-docs.py`
- `python3 scripts/format-plan-docs.py --check`
- Browser verification with Playwright:
  - Desktop `1365x900`: restored `event` + `view=1`, active chips, right detail panel, display-state clear, SVG render, no console/request errors.
  - Mobile `375x812`: restored `view=1`, active chips, display-state clear, SVG render, no console/request errors.

## Out Of Scope

- Editing timeline data from the UI.
- Deep browser history workflows beyond simple restore/share behavior.
- Replacing the existing selection and URL restore model.
