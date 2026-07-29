# Real-World Review Decision Ledger

status: active
task_type: environment_data_flow
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/data/realworldReviewDecisionModel.js
  - src/data/realworldReviewModel.js
  - scripts/set-realworld-review-decision.mjs
  - scripts/generate-realworld-review-inventory.mjs
  - scripts/validate-realworld-intake.mjs
  - tests/realworldReviewDecision.test.js
  - tests/realworldReview.test.js
  - package.json
  - README.md
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/realworld-history/data-model.md
  - docs/realworld-history/authoring.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_AGENT_LOGGING.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run verify
  - focused real-world review decision tests
  - review inventory smoke run
  - review decision command dry-run fixture tests
  - python3 scripts/security-static-check.py
  - python3 scripts/validate-changes.py
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - Review decisions are stored separately per source and survive intake refreshes.
  - Missing decisions derive as pending while stored decisions use include, exclude, or defer.
  - Stored decisions retain reviewer, review time, reviewed content hash, and zero or more InfoEvent links.
  - Exclusion and deferral reasons use controlled values with notes required for other.
  - Changed candidate content derives a recheck requirement without deleting the prior decision.
  - Decisions for missing candidates remain visible as orphan decisions.
  - A safe CLI records one explicit decision without creating or publishing an InfoEvent.
  - The local inventory reports decision counts, stale decisions, orphan decisions, and a deterministic pilot batch.
  - No factual candidate decision is recorded before review authority is selected.
acceptance_focus:
  - durable review boundary
  - review provenance
  - publication isolation
expected_output: implementation
checked_summary_ja: 取得データと分離したレビュー判断台帳、検証、記録コマンド、パイロット候補抽出を構築した。

## Goal

Implement the accepted candidate-review contract without performing factual
review or granting publication authority.

## Decisions

- Store review datasets under
  `data/raw/realworld_events/reviews/<sourceRegistryId>.json`.
- Identify a candidate with its source registry ID and intake ID.
- Treat an absent stored decision as pending.
- Store only include, exclude, and defer decisions.
- Require reviewer identity, review timestamp, and reviewed content hash.
- Derive a recheck requirement when the current content hash differs.
- Use controlled exclusion and deferral reasons and require a note for other.
- Allow an included candidate to link to zero or more existing InfoEvents.
- Do not create InfoEvents or copy candidate timestamps automatically.
- Retain and report decisions whose candidates no longer exist.
- Derive a pilot batch from the three website candidates, the ten newest
  playlist candidates, and the newest exact-title group.
- Keep factual review and publication blocked until review authority is
  explicitly selected.

## Tasks

- [ ] Implement and validate the durable review decision contract.
- [ ] Add a safe per-candidate decision recording command.
- [ ] Integrate decisions, recheck state, and orphan state into the inventory.
- [ ] Add deterministic pilot-batch selection and reporting.
- [ ] Add focused model, CLI, and integration tests.
- [ ] Update data model, authoring, processing, and README documentation.
- [ ] Run full validation and archive the plan.

## Boundaries

- Do not read, print, modify, or commit `.env.local`.
- Do not call external APIs or browse X.
- Do not make factual include, exclude, or defer decisions in this plan.
- Do not create, modify, approve, or publish InfoEvents.
- Do not add a review UI before the contract is validated through CLI and JSON.
- Do not change public routes, IDs, or production data inputs.
