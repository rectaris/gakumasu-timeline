# Worldline Editor Save Target File Creation

status: active
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/WorldlineEditor.vue
  - scripts/worldline-editor-api.mjs
  - scripts/generate-data.mjs
  - src/data/index.js
  - tests/worldlineEditorApi.test.js
  - docs/data-structure.md
  - docs/processing-flow.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npm run test -- tests/worldlineEditorApi.test.js
  - npm run build
  - browser verification for editor desktop and mobile views
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Save destination is selected through commu type and file controls.
  - Existing files can still be selected as save targets.
  - File-backed commu types can create a new raw file target with lane metadata.
  - New raw files participate in generation and app data loading.
  - Existing update, move, add, duplicate, and delete behavior remains intact.
acceptance_focus:
  - save target controls
  - new file creation
  - generated data discovery
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor の保存先をコミュ種別とファイル選択へ変更し、新規ファイル作成に対応する。

## Goal

Replace the flat save destination select with commu type and file selection, including a new-file path for file-backed commu types.

## Tasks

- [x] Add save target commu type and file controls in the editor form.
- [x] Support creating a new lane raw file from save requests.
- [x] Make generated data discovery include new hatsuboshi files as well as other file-backed categories.
- [x] Add focused editor API tests for new file creation.
- [x] Update affected human-facing data flow docs.
- [x] Verify UI and run required validation.

## Validation Results

- `npm run test -- tests/worldlineEditorApi.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
- `npm run validate:data`: passed.
- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/validate-changes.py`: passed.
- Browser desktop `1366x900`: save target initialized to the selected idol file, switching target commu type to event commu exposed `新規ファイル`, and `差分確認` returned a patch for `data/raw/worldline_commu/event_commu/999playwrightPreview.json`.
- Browser mobile `375x812`: same new-file preview flow passed.
- Existing console warning remains: `Invalid event start date` for `saki_hanami`.

## Notes

- Browser verification used preview only and did not write the Playwright new-file target to disk.
