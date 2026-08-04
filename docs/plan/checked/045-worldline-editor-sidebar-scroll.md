# Worldline Editor Sidebar Scroll

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/WorldlineEditor.vue
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Sidebar controls and event list are visually separated.
  - Search, commu type, file, and new-event controls stay fixed within the sidebar.
  - Only the event list scrolls when many events are present.
  - Mobile one-column editor layout remains usable.
acceptance_focus:
  - sidebar fixed controls
  - event-only scroll
expected_output: implementation
checked_summary_ja: worldline 編集画面の左部でイベント一覧だけをスクロール可能にする。

## Goal

Split the worldline editor left sidebar into a fixed control area and a scrollable event area.

## Tasks

- [x] Wrap search, commu type, file, and new-event controls in a fixed sidebar control region.
- [x] Wrap the event list in a separate region with its own heading.
- [x] Move sidebar scrolling from the whole sidebar to the event list region.
- [x] Verify desktop and mobile editor layouts.

## Validation Results

- `npm run build`: passed.
- `git diff --check`: passed.
- Browser desktop `1366x900`: sidebar overflow is hidden, event list overflow is auto, event list scroll changes without moving controls.
- Browser mobile `375x812`: sidebar overflow is hidden, event list overflow is auto, event list scroll changes without moving controls.
- Existing console warning remains: `Invalid event start date` for an existing timeline event.
