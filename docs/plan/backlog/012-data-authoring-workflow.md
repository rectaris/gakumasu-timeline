# Data Authoring Workflow

status: backlog
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/data/worldline_commu/template.js
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/plan/backlog/README.md
  - scripts/
  - package.json
  - tests/
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
validation:
  - npm run test
  - npm run build
  - npm run validate:data
  - git diff --check
  - python3 scripts/lint-plan-docs.py
acceptance:
  - Data authors have a clear checklist for adding, reviewing, validating, and previewing timeline data.
  - Template fields match the validated schema and current source-of-truth format.
  - Validation can be run for the whole dataset and, when practical, a focused file/path.
  - Documentation explains common validation failures and source/uncertainty expectations.
acceptance_focus:
  - authoring checklist
  - template accuracy
  - focused validation
expected_output: full-implementation
checked_summary_ja: データ追加・編集・プレビューの運用を整備する。

## Goal

Raise data editing ease without making the runtime app heavier or requiring a database/CMS.

## Tasks

- [ ] Update `src/data/worldline_commu/template.js` to match the validated schema.
- [ ] Add a data author checklist to `docs/data-structure.md`.
- [ ] Document source, participant, worldline, uncertainty, and ID rules.
- [ ] Add focused validation support for a single file/path if practical.
- [ ] Document preview steps using the local Vite stack.
- [ ] Add guidance for when a data change needs approval because it changes chronology, source claims, or public IDs.

## Out Of Scope

- Non-repository CMS/editor.
- Generic timeline authoring support.
- Unapproved data reinterpretation.
