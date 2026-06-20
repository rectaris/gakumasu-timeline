# Detail Related Context Panel

status: completed
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

- [x] Split detail content into sections: title, character/lane, occurrence period, event type, participants, worldline, source, note, and detail text.
- [x] Add visual linkage between selected event bar and panel using the official color token from the selected event.
- [x] Add copy/share action for the current event URL.
- [x] Show nearby events in the same visible period or same lane without implying unsupported causality.
- [x] Show related common events and same-participant events when data supports the relationship.
- [x] Preserve canonical ID behavior for common events and URL restore.
- [x] Update manual and behavior docs for structured detail fields and share behavior.

## Implementation Decisions

- Derive detail-panel context in a dedicated composable/helper, then pass display-ready context into `SidePanel.vue`.
- Use current visible events for nearby visible-period context, and all events for same-lane and same-participant context.
- Separate related sections by evidence: nearby visible events, same-lane events, common events, and same-participant events.
- Cap each related-event section to three canonical events and show omitted counts when useful.
- Deduplicate related events by `canonicalId`; for common events, prefer the instance in the selected event's lane.
- Selecting a related event should update selection and scroll the target lane into view without forcing a horizontal viewport jump.
- Copy/share should produce an absolute URL with `?event=<canonicalId>`, with a visible manual fallback if clipboard access fails.
- Resolve participant and worldline IDs to display names; show unresolved IDs only as fallback.
- Hide optional empty fields, but make source and worldline absence explicit enough to avoid implying evidence exists.
- Label `singleWithinRange` as uncertain and explain that it means one day somewhere in the range.
- Keep relation wording evidence-based and avoid implying causality or story reinterpretation.
- Keep the panel dense and readable with compact sections/definition-list style; avoid nested card layouts.
- Use selected event color as a restrained accent only, preserving contrast in light and dark modes.
- Add focused unit tests for context derivation, canonical deduplication, label resolution, and share URL generation.

## Relationship To Existing Backlog

This overlaps with `docs/plan/checked/010-viewer-search-filter-upgrades.md` for source, participant, note, and uncertainty presentation.

If implemented together, keep search/filter state outside the side panel unless the UI design explicitly approves a combined inspector/search surface.

## Out Of Scope

- Adding unsupported relation types.
- Reinterpreting story chronology.
- Editing timeline data from the UI.

## Completion Notes

- Added `useEventDetailContext` for structured field resolution, share URL creation, canonical related-event deduplication, and evidence-based related sections.
- Updated `SidePanel.vue` to show structured fields, share/copy feedback, notes, and related context with desktop and mobile layouts.
- Updated human-facing behavior/data docs for detail fields, share behavior, and related-context semantics.
- Validation: `npm run test -- tests/useEventDetailContext.test.js`; `npm run test`; `npm run build`; `npm run verify`; `git diff --check`; `python3 scripts/lint-plan-docs.py`; `python3 scripts/format-plan-docs.py --check`.
- Browser verification: Playwright/Chromium desktop event selection, close paths, related-event selection, URL copy feedback, URL restore, and mobile bottom-sheet restore at `375x812`.
