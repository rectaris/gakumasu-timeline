# Real-World Official Source Intake

status: active
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - data/raw/realworld_events/source-registry.json
  - data/raw/realworld_events/intake/
  - data/raw/realworld_events/unreviewed/
  - src/data/realworldHistoryModel.js
  - scripts/collect-realworld-sources.mjs
  - scripts/generate-data.mjs
  - tests/
  - docs/realworld-history/
  - docs/data-structure.md
  - docs/processing-flow.md
  - package.json
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_AGENT_LOGGING.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run verify
  - focused collector and intake-model tests
  - collector dry run without credentials
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - The seven approved official origins are represented by stable source-registry entries.
  - Retrieved resources are normalized as intake records before any InfoEvent is created.
  - Website, YouTube Data API, and X API adapters preserve platform IDs, canonical URLs, source publication time, and retrieval time.
  - Full response bodies remain local-only while lightweight normalized intake records are reviewable repository data.
  - Collection never promotes candidates directly to published InfoEvents.
  - Umbrella Idolmaster sources only yield explicitly Gakumas-related candidates.
  - Secrets are read only from documented environment variables and are never written to output or logs.
  - Existing published IDs, selection URLs, and production-data boundaries remain compatible.
acceptance_focus:
  - source provenance
  - candidate isolation
  - secret-safe collection
expected_output: implementation
checked_summary_ja: 7つの公式発信元から学マス情報史候補を安全に取得し、レビュー前データとして保存する基盤を構築する。

## Goal

Add the collection boundary that precedes the existing unreviewed and published
InfoEvent lifecycle.

## Decisions

- Keep `data/raw/realworld_events/` as the existing source-of-truth root.
- Add a global source registry and a lightweight `intake/` layer.
- Store full fetched payloads only under local `.agent-artifacts/`.
- Use platform-native external IDs and canonical URLs for deduplication.
- Treat multiple posts, videos, and pages as evidence for one InfoEvent rather
  than as separate events by default.
- Use source-specific adapters: public website retrieval, YouTube Data API, and
  X API with a manual fallback.
- Filter umbrella Idolmaster origins to explicitly Gakumas-related resources.
- Collection stops at intake; only reviewed records may become unreviewed
  InfoEvents, and only reviewed InfoEvents may become published.

## Tasks

- [x] Define and validate source-registry and intake-record contracts.
- [x] Register all seven approved origins and platform-specific scope rules.
- [x] Implement secret-safe website, YouTube, playlist, and X collection adapters.
- [x] Store normalized intake records deterministically and keep full payloads local.
- [x] Add duplicate detection and explicit Gakumas filtering for umbrella sources.
- [x] Make unreviewed InfoEvent generation discover review files without hardcoded names.
- [x] Strengthen InfoEvent source validation and add focused tests.
- [x] Run credential-free collection and collect all sources available without new credentials.
- [x] Update authoring, source, data-structure, and processing-flow documentation.
- [x] Run full validation and archive the plan.

## Boundaries

- Do not add or print API keys, bearer tokens, `.env` values, or full API
  responses.
- Do not scrape authenticated or browser-only views.
- Do not automatically create or publish factual InfoEvents from collected text.
- Do not change existing public IDs or URL semantics.

## Validation Notes

The credential-free collection produced seven intake datasets.
The two public website adapters collected three page candidates in total.
The three YouTube origins and two X origins were recorded as `skipped` because
their environment credentials were not configured; their adapters and
secret-redaction behavior are covered by tests.

No new InfoEvent was promoted from the page candidates because the collected
pages did not provide enough reviewed occurrence-time evidence.

Validation completed:

- `npm run collect:realworld -- --max-pages 1`
- `npm run verify`
- `python3 scripts/security-static-check.py`
- `python3 scripts/validate-changes.py`
- `bash scripts/lint-plan-docs.sh`
- `bash scripts/format-plan-docs.sh --check`
- `git diff --check`
