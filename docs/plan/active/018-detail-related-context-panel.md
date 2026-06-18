# Detail Related Context Panel

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/SidePanel.vue
  - src/components/TimelineEvents.vue
  - src/composables/useSelection.js
  - src/composables/useTimelineData.js
  - src/utils/events.js
  - src/utils/labels.js
  - docs/manual.md
  - docs/ui-behavior.md
  - docs/data-structure.md
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
  - browser verification for event selection, panel close paths, URL restore, and mobile viewport
  - git diff --check
acceptance:
  - Event detail panels show the selected event as a structured record, not only title/date/free text.
  - Source, note, participants, worldline, occurrence type, uncertainty, and share URL are scannable when present.
  - Nearby or related events help users understand context without changing chronology semantics.
  - Panel layout remains reachable, readable, and non-overlapping on desktop and mobile.
acceptance_focus:
  - detail readability
  - related context
  - shareability
expected_output: implementation-plan
checked_summary_ja: 詳細パネルを構造化し、関連イベントや共有導線を強化する。

## Goal

Turn the side panel into the high-confidence inspection surface for Gakumasu timeline events.

## Tasks

- [ ] Split detail content into sections: title, character/lane, occurrence period, event type, participants, worldline, source, note, and detail text.
- [ ] Add visual linkage between selected event bar and panel using the official color token from the selected event.
- [ ] Add copy/share action for the current event URL.
- [ ] Show nearby events in the same visible period or same lane without implying unsupported causality.
- [ ] Show related common events and same-participant events when data supports the relationship.
- [ ] Preserve canonical ID behavior for common events and URL restore.
- [ ] Update manual and behavior docs for structured detail fields and share behavior.

## Relationship To Existing Backlog

This overlaps with `docs/plan/backlog/010-viewer-search-filter-upgrades.md` for source, participant, note, and uncertainty presentation.

If implemented together, keep search/filter state outside the side panel unless the UI design explicitly approves a combined inspector/search surface.

## Out Of Scope

- Adding unsupported relation types.
- Reinterpreting story chronology.
- Editing timeline data from the UI.
