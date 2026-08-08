# Real-World Intake Resilience

status: checked
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/realworld_events/source-registry.json
  - scripts/collect-realworld-sources.mjs
  - scripts/validate-realworld-intake.mjs
  - src/data/realworldIntakeModel.js
  - tests/realworldIntake.test.js
  - docs/realworld-history/
  - docs/data-structure.md
  - docs/processing-flow.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run verify
  - focused real-world intake tests
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - A page-limited YouTube run is explicitly marked partial and records pagination metadata.
  - A partial run merges with valid existing candidates and cannot silently reduce the candidate set.
  - One source failure does not prevent later sources from running and does not overwrite the last valid dataset.
  - Collection failures are classified without exposing credentials.
  - Paused sources are skipped before their adapter makes a network request.
  - Both registered X origins are paused and no X browser or API acquisition path is added.
  - Existing public InfoEvents, URLs, and production-data boundaries remain unchanged.
acceptance_focus:
  - lossless partial collection
  - source failure isolation
  - X acquisition pause
expected_output: implementation
checked_summary_ja: 部分取得による候補消失を防ぎ、取得失敗を発信元単位で隔離し、X取得を保留状態にした。

## Goal

Make official-source intake safe under capped pagination and source-specific
failures while pausing all X acquisition work.

## Decisions

- Keep the existing intake files backward-compatible.
- Add explicit partial-collection metadata to newly written datasets.
- Merge a partial result with the last valid dataset by stable resource key.
- Replace existing items only after a complete collection.
- Continue after source-specific failures, report them, and leave the previous
  dataset unchanged.
- Treat missing credentials and paused sources as skipped rather than failed.
- Mark X origins paused in the source registry and do not implement browser,
  oEmbed, or paid-API acquisition in this plan.
- Preserve the user's current uncommitted intake data and do not stage it.

## Tasks

- [x] Extend source and intake contracts for paused and partial states.
- [x] Return pagination completeness metadata from paginated adapters.
- [x] Add lossless partial merge and atomic per-source writes.
- [x] Isolate and classify source-specific failures.
- [x] Pause both X origins before adapter dispatch.
- [x] Add focused regression tests.
- [x] Update data-flow and authoring documentation.
- [x] Run full validation and archive the plan.

## Boundaries

- Do not read, print, modify, or commit `.env.local`.
- Do not run X API or logged-in browser acquisition.
- Do not modify or stage the user's current intake JSON changes.
- Do not promote intake candidates to InfoEvents.
- Do not change public routes or selection IDs.

## Validation Notes

Focused tests verify that a capped YouTube run retains candidates from the last
valid dataset, a failed source does not stop a later source, and paused X
origins make no network request.

A credential-free smoke run used a temporary output directory.
It collected both website origins, skipped YouTube for missing credentials, and
skipped both X origins because their registry entries are paused.

Validation completed:

- `npm test -- --run tests/realworldIntake.test.js`
- `npm run verify`
- `python3 scripts/security-static-check.py`
- `python3 scripts/validate-changes.py`
- `bash scripts/lint-plan-docs.sh`
- `bash scripts/format-plan-docs.sh --check`
- `git diff --check`

The user's three uncommitted intake datasets remain outside implementation
commits.
