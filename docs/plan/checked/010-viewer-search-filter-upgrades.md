# Viewer Search And Filter Upgrades

status: completed
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/SidePanel.vue
  - src/components/TimelineEvents.vue
  - src/composables/useCategoryFilter.js
  - src/composables/useSelection.js
  - src/composables/useTimelineData.js
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
  - browser verification for desktop and mobile UI paths
  - git diff --check
acceptance:
  - Users can search across event title, detail, source, note, and participants without losing lane filtering behavior.
  - Users can filter by worldline and uncertainty when those fields are available.
  - Side panel presents source, participants, notes, and uncertainty in a scannable way.
  - URL restore, selection, lane visibility, and common-event behavior remain stable.
acceptance_focus:
  - Gakumasu viewer utility
  - search/filter behavior
  - detail readability
expected_output: full-implementation
checked_summary_ja: 学マス時系列ビューアの検索・フィルタ・詳細表示を強化する。

## Goal

Increase the value of the app as a Gakumasu timeline viewer by making event evidence and cross-character lookup easier.

## Tasks

- [x] Define search scope and matching behavior for event title, detail, source, note, and participant IDs/names.
- [x] Add event-level filtering without breaking category/lane selection.
- [x] Add UI for worldline and uncertainty filters when the data model supports them.
- [x] Improve `SidePanel.vue` source, participants, notes, and uncertainty sections.
- [x] Preserve common-event canonical selection and URL restore behavior.
- [x] Update `docs/manual.md` and `docs/ui-behavior.md`.
- [x] Browser-check desktop and narrow mobile paths.

## Completion Notes

- Event search covers title, detail, source, note, occurrence type, lane/commu, participants, and worldline labels.
- Event filters cover occurrence type, uncertainty, participant, commu, and worldline.
- The detail panel presents source, participants, worldline, notes, uncertainty wording, related context, and share URL behavior.
- Canonical event IDs remain the URL and common-event selection key.

## Out Of Scope

- Generic timeline application features.
- Data contract migration except where already approved by related data-model plans.
