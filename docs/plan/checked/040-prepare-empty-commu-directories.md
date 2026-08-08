# Prepare Empty Commu Directories

status: checked
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - data/raw/worldline_commu/event_commu/
  - data/raw/worldline_commu/support_story/
  - src/data/generated/worldline_commu/event_commu/
  - src/data/generated/worldline_commu/support_story/
  - data/raw/worldline_commu/template.json
  - scripts/generate-data.mjs
  - src/data/index.js
  - tests/dataIndex.test.js
  - docs/data-structure.md
  - docs/processing-flow.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
validation:
  - npm run generate:data
  - npm run validate:data
  - npm run test
  - npm run build
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Empty raw/generated directories exist for event commu and support story data.
  - Future event/support raw JSON files will be picked up by the generator and exported from src/data/index.js.
  - The authoring template lives under data/raw/worldline_commu/template.json.
  - Existing runtime data behavior remains unchanged while event/support categories are empty.
acceptance_focus:
  - tracked empty dirs
  - template location
  - empty category loading
expected_output: full-implementation
checked_summary_ja: 未登録コミュ用の raw/generated ディレクトリを用意する。

## Goal

Prepare the empty `event_commu` and `support_story` raw/generated directories so future data can follow the raw JSON to generated JS pipeline from the start.

Move the JSON authoring template into `data/raw/worldline_commu/` because raw data is now the source-of-truth surface.

## Tasks

- [x] Add tracked raw directories for event commu and support story data.
- [x] Add tracked generated directories for event commu and support story output.
- [x] Move `template.json` to `data/raw/worldline_commu/template.json`.
- [x] Update generation and index loading for empty event/support categories.
- [x] Update docs and tests.
- [x] Run validation and archive this active plan.

## Validation Results

- `npm run generate:data`: passed.
- `npm run test -- tests/dataIndex.test.js tests/generatedData.test.js`: passed.
- `npm run validate:data`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
