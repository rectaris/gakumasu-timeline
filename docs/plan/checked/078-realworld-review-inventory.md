# Real-World Review Inventory

status: checked
task_type: environment_data_flow
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/data/realworldReviewModel.js
  - scripts/generate-realworld-review-inventory.mjs
  - tests/realworldReview.test.js
  - package.json
  - README.md
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/realworld-history/authoring.md
  - docs/plan/backlog/README.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_AGENT_LOGGING.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run verify
  - focused real-world review tests
  - review inventory smoke run
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - A deterministic read-only review inventory is derived from all valid intake files.
  - Inventory items retain source identity, canonical URL, publication time, match state, and intake status.
  - Exact resource-key, exact normalized-title, and InfoEvent source-URL matches are reported only as review clues.
  - No semantic grouping, inclusion decision, exclusion decision, or InfoEvent is created automatically.
  - Full inventory and Markdown review report remain local under .agent-artifacts.
  - The report has a manifest and redaction report without credentials or local environment values.
  - X remains absent from candidates while its intake datasets are skipped.
  - Stale plan documentation is corrected.
acceptance_focus:
  - review visibility
  - inference boundary
  - local artifact boundary
expected_output: implementation
checked_summary_ja: 取り込み候補を安全に確認する読み取り専用レビュー在庫とローカルレポートを構築した。

## Goal

Turn the current intake snapshots into a reviewable inventory without defining
durable review decisions or inferring story-level event grouping.

## Decisions

- Commit the generator, model, tests, and documentation only.
- Store generated inventory and Markdown reports under
  `.agent-artifacts/realworld-review/`.
- Use exact resource keys, normalized title equality, and exact InfoEvent source
  URLs as non-authoritative review clues.
- Include published and unreviewed InfoEvent source URLs in the exact-link index.
- Do not infer semantic duplicates or assign review outcomes.
- Defer the durable review-status and exclusion-reason contract until the user
  sees the current candidate distribution.

## Tasks

- [x] Implement the deterministic review inventory model.
- [x] Add exact-match clues and source-level completeness summaries.
- [x] Add a local JSON and Markdown report generator with manifest and redaction report.
- [x] Add focused tests and a package command.
- [x] Generate and inspect the current inventory.
- [x] Update authoring, data-flow, README, and stale backlog documentation.
- [x] Run full validation and archive the plan.

## Boundaries

- Do not read, print, modify, or commit `.env.local`.
- Do not call external APIs or browse X.
- Do not create durable review decisions or reason codes.
- Do not group candidates by semantic similarity.
- Do not create or publish InfoEvents.
- Do not commit generated review artifacts.

## Validation Notes

The current inventory contains 203 eligible candidates from seven registered
sources.
The two YouTube datasets remain partial at 100 candidates each, X contributes
no candidates, and the remaining three candidates come from official websites.

Exact matching found no shared resource-key group, 26 normalized-title groups,
and one candidate whose canonical URL equals a published InfoEvent source URL.
These results remain review clues and did not create decisions or InfoEvents.

Validation completed:

- `npm test -- --run tests/realworldReview.test.js tests/realworldIntake.test.js`
- `npm run review:realworld`
- `npm run verify`
- `python3 scripts/security-static-check.py`
- `python3 scripts/validate-changes.py`
- `bash scripts/lint-plan-docs.sh`
- `bash scripts/format-plan-docs.sh --check`
- `git diff --check`

## Deferred Decisions

- Define the durable candidate review statuses and whether a reviewer identity
  and decision timestamp are required.
- Define controlled exclusion-reason values and whether free-form notes are
  allowed.
- Select the first candidate batch or information category for factual review.
- Define when multiple official resources represent one InfoEvent and when
  they must remain separate.
