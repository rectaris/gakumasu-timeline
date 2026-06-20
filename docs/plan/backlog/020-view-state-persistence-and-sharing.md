# View State Persistence And Sharing

status: backlog
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

## Approval Boundary

Any change that alters the meaning or compatibility of existing public event URLs must be reviewed before implementation. If the implementation changes public URL behavior beyond additive optional parameters, promote this plan as Class C and record explicit approval.

## Suggested Task Breakdown

- [ ] Define a versioned state serialization contract and default-elision rules.
- [ ] Add parse/restore helpers with unit tests for missing, malformed, and legacy URL parameters.
- [ ] Add active-state chips for search, filters, lane focus, and non-default view state.
- [ ] Add clear actions for individual chips and all active state.
- [ ] Update manual and behavior docs.

## Out Of Scope

- Editing timeline data from the UI.
- Deep browser history workflows beyond simple restore/share behavior.
- Replacing the existing selection and URL restore model.
