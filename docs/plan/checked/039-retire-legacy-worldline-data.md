# Retire Legacy Worldline Data

status: active
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/data/worldline_commu/common_timeline.js
  - src/data/worldline_commu/hatsuboshi_commu/001storyOfReiris.js
  - src/data/worldline_commu/idol_commu/
  - tests/dataIndex.test.js
  - src/data/integrityRunner.js
  - src/data/worldline_commu/template.js
  - docs/data-structure.md
  - docs/processing-flow.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npm run validate:data
  - npm run test
  - npm run build
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Migrated legacy runtime data files under src/data/worldline_commu are removed.
  - src/data/worldline_commu/template.js remains available as a raw-compatible authoring starter.
  - Compatibility tests compare generated data against raw source data instead of legacy src/data/worldline_commu modules.
  - Integrity loading no longer needs migrated legacy exclusions for removed files.
  - Documentation no longer describes migrated legacy files as retained comparison data.
acceptance_focus:
  - legacy retirement
  - raw/generated compatibility
  - template retained
expected_output: full-implementation
checked_summary_ja: 移行済み worldline_commu 旧データを削除する。

## Goal

Remove the migrated legacy data modules from `src/data/worldline_commu/` now that `commonTimeline`, `idolCommu`, and `hatsuboshiCommus` are loaded from generated modules.

Keep `src/data/worldline_commu/template.js` because the documentation still uses it as the authoring starter.

## Scope

- Remove only migrated legacy data modules.
- Do not remove `src/data/worldline_commu/template.js`.
- Do not change raw data, generated data semantics, event IDs, event order, source claims, participants, worldline IDs, or common-event expansion behavior.
- Update tests to use `data/raw/` as the compatibility source of truth.

## Tasks

- [x] Update compatibility tests to compare generated modules against raw source modules.
- [x] Remove migrated legacy modules under `src/data/worldline_commu/`.
- [x] Simplify integrity validation legacy exclusion for removed files.
- [x] Update the retained template so it can be copied into raw data files.
- [x] Update data-flow documentation for the retired legacy files.
- [x] Run validation and archive this active plan.

## Validation Results

- `npm run validate:data`: passed.
- `npm run test -- tests/dataIndex.test.js tests/generatedData.test.js tests/dataIntegrity.test.js`: passed.
- `npm run test`: passed.
- `npm run build`: passed.
