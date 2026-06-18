# Navigation Search Filter Experience

status: active
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

- [ ] Add event-level search across title, detail, participants, source, note, commu, and worldline where available.
- [ ] Add filters for event type, uncertainty, common events, character, commu, and worldline where data exists.
- [ ] Add "next event" and "previous event" navigation for the current visible or filtered set.
- [ ] Add "focus this lane/character" behavior from lane label, event, or detail panel.
- [ ] Consider a compact minimap or viewport overview if it helps users understand the current visible range.
- [ ] Redesign zoom controls into a compact tool surface with optional hints hidden by default or collapsed on mobile.
- [ ] Preserve existing wheel, drag, touch, keyboard, lane hide/show, and URL restore behavior.
- [ ] Update manual and behavior docs for new controls.

## Relationship To Existing Backlog

This overlaps with `docs/plan/backlog/010-viewer-search-filter-upgrades.md` and `docs/plan/backlog/011-timeline-interaction-scale.md`.

If this active plan is implemented, either promote and merge those backlog items or update them to avoid duplicate work.

## Out Of Scope

- Color system implementation.
- Data extraction pipeline changes.
- Broad performance optimization unless a navigation feature requires it.
