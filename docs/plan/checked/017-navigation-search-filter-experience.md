# Navigation Search Filter Experience

status: completed
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/ZoomControls.vue
  - src/components/SidePanel.vue
  - src/composables/useCategoryFilter.js
  - src/composables/useSelection.js
  - src/composables/useTimelineData.js
  - src/composables/useZoomMachine.js
  - src/composables/useKeyboard.js
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
  - browser verification for menu, search, filter, zoom, drag, keyboard, and mobile viewport
  - git diff --check
acceptance:
  - Users can move from broad overview to a specific event, lane, character, commu, or worldline efficiently.
  - Search and filters do not break category/lane selection, URL restore, or common-event canonical selection.
  - Zoom controls and help affordances are compact enough to keep the timeline primary.
  - Keyboard and mobile navigation remain usable.
acceptance_focus:
  - event discovery
  - compact controls
  - stable selection
expected_output: implementation-plan
checked_summary_ja: タイムラインの検索・絞り込み・移動操作を強化する。

## Goal

Improve discovery and navigation without making the first screen feel like an instruction page.

## Tasks

- [x] Add event-level search across title, detail, participants, source, note, commu, and worldline where available.
- [x] Add filters for event type, uncertainty, common events, character, commu, and worldline where data exists.
- [x] Add "next event" and "previous event" navigation for the current visible or filtered set.
- [x] Add "focus this lane/character" behavior from lane label, event, or detail panel.
- [x] Consider a compact minimap or viewport overview if it helps users understand the current visible range.
- [x] Redesign zoom controls into a compact tool surface with optional hints hidden by default or collapsed on mobile.
- [x] Preserve existing wheel, drag, touch, keyboard, lane hide/show, and URL restore behavior.
- [x] Update manual and behavior docs for new controls.

## Implementation Decisions

- Keep event search and event filters in the existing side menu so the timeline remains the primary surface.
- Apply scope as selected category, selected lanes, then event search and event filters.
- Search within the active category only. Do not add cross-category search in this pass.
- Normalize searchable text from event title, detail, source, note, occurrence type, lane/commu name, participant IDs, participant names, worldline IDs, and worldline names.
- Treat space-separated query terms as AND conditions; each term may match any searchable field.
- Use filter groups as AND conditions, with OR semantics inside each group.
- Keep search and filter state as in-memory UI state. Do not write search/filter state to URL or localStorage in this pass.
- Preserve shared event URLs by keeping `event` query restore based on `canonicalId`; filters must not rewrite URL state.
- Keep the selected detail panel open when the selected event is filtered out, and mark that it is hidden by the current search/filter conditions rather than clearing selection.
- Collapse common-event results by `canonicalId` for result counts and next/previous navigation, while preserving per-lane event instances for rendering.
- Treat the existing common-event display setting as the primary common-event control rather than adding a duplicate common-event toggle.
- Define uncertainty filtering as `occurrenceType === "singleWithinRange"` only.
- Define commu filters as lane/commu filters, separate from category and source text.
- Use filtered event order for next/previous navigation: `displayStartDay`, `displayEndDay`, lane order, then title.
- When a searched or next/previous event is selected, move the horizontal viewport through the existing selected-event behavior and scroll vertically to the target lane.
- Implement lane/character focus as a temporary focus mode with a clear action, not by overwriting the user's lane checkbox selection.
- Do not add a minimap in this pass; revisit it only if search/filter/navigation still leaves orientation unclear.
- Keep zoom behavior unchanged and reduce the visual footprint of `ZoomControls`.
- Keep detailed SidePanel restructuring in `docs/plan/active/018-detail-related-context-panel.md`; this plan may add only minimal status or action affordances needed for navigation.
- Add focused tests for search text normalization, filter composition, common-event canonical collapse, and navigation ordering.

## Completion Notes

- Implemented event search and filters in the existing side menu.
- Added focused search/filter/navigation tests in `tests/useEventSearchFilter.test.js`.
- Did not add a minimap; current navigation improvements are sufficient for this pass and avoid extra layout/performance risk.
- Kept SidePanel restructuring deferred to `docs/plan/active/018-detail-related-context-panel.md`.
- Validation run: `npm run test`, `npm run build`, `npm run verify`, `git diff --check`, and Playwright browser smoke for desktop/mobile menu, search, filter navigation, zoom, drag, and lane focus.

## Relationship To Existing Backlog

This overlaps with `docs/plan/checked/010-viewer-search-filter-upgrades.md` and `docs/plan/active/011-timeline-interaction-scale.md`.

If this active plan is implemented, either promote and merge those backlog items or update them to avoid duplicate work.

## Out Of Scope

- Color system implementation.
- Data extraction pipeline changes.
- Broad performance optimization unless a navigation feature requires it.
