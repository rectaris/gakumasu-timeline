# YouTube Intake Snapshot

status: active
task_type: environment_data_flow
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - data/raw/realworld_events/intake/origin_gakumas_official_site.json
  - data/raw/realworld_events/intake/origin_hatsuboshi_youtube.json
  - data/raw/realworld_events/intake/origin_imas_gakumas_playlist.json
  - src/data/realworldIntakeModel.js
  - tests/realworldIntake.test.js
  - docs/realworld-history/data-model.md
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
  - The user-collected official-site and YouTube intake snapshots are reviewed and committed.
  - Both YouTube snapshots remain partial and expose their exact page and item counts.
  - Successful YouTube datasets without pagination metadata fail validation.
  - Pagination page counts cannot exceed their configured page limit.
  - X sources remain paused and their intake files are not changed.
  - No intake candidate is promoted to an InfoEvent.
acceptance_focus:
  - reviewable YouTube snapshot
  - pagination validation
  - publication isolation
expected_output: implementation
checked_summary_ja: 公式YouTubeの部分取得スナップショットを適用し、ページング情報の欠落を検証で防止した。

## Goal

Adopt the official-source snapshots collected by the user and close the
validation gap that allowed successful YouTube datasets to omit pagination
completeness metadata.

## Decisions

- Treat the two 100-item YouTube results as partial candidate snapshots.
- Keep all candidates in the intake layer and do not create InfoEvents.
- Require pagination metadata for successful YouTube intake datasets.
- Keep backward compatibility for non-YouTube collected website datasets.
- Include the official-site timestamp refresh because it was produced by the
  same approved collection workflow and its content hashes are unchanged.
- Leave X intake files and X acquisition unchanged.

## Tasks

- [x] Review the three collected snapshots for identity, uniqueness, dates, and secrets.
- [x] Require pagination metadata on successful YouTube datasets.
- [x] Add focused validation regression tests.
- [x] Update the data-model validation contract.
- [x] Run full validation, commit the snapshots, and archive the plan.

## Boundaries

- Do not read, print, modify, or commit `.env.local`.
- Do not run X acquisition.
- Do not expand the YouTube page limit in this plan.
- Do not promote intake candidates to InfoEvents.
- Do not change public routes or IDs.

## Validation Notes

The adopted snapshot contains two unchanged official-site pages and two
100-item YouTube candidate sets.
Both YouTube datasets are explicitly partial after two pages, report that a
next page remains, and contain no retained legacy items.

The review found no duplicate IDs or resource keys, malformed video IDs or
URLs, missing publication times, empty titles, private/deleted titles, duplicate
content hashes, or secret-like values.

Validation completed:

- `npm test -- --run tests/realworldIntake.test.js`
- `npm run verify`
- `python3 scripts/security-static-check.py`
- `python3 scripts/validate-changes.py`
- `bash scripts/lint-plan-docs.sh`
- `bash scripts/format-plan-docs.sh --check`
- `git diff --check`
