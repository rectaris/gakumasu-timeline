# Real-World History Specification Proposal

status: active
task_type: planning_docs
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - docs/realworld-history/
  - docs/plan/backlog/066-gakumasu-realworld-history-view.md
  - docs/plan/backlog/README.md
  - README.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - bash scripts/lint-plan-docs.sh
  - bash scripts/format-plan-docs.sh --check
  - git diff --check
acceptance:
  - The real-world history skeleton is converted into a coherent Proposed specification.
  - The proposal defines a narrow initial inclusion boundary and explicit exclusions.
  - InfoEvent identity, Gregorian precision, timezone, status, correction history, and official provenance have concrete proposed contracts.
  - Future items, grouping, StoryReference ownership, authoring, and publication lifecycle have proposed rules.
  - The specification clearly lists the user approvals still required before plan 066 can become active.
  - No factual real-world event records or production implementation are added before dedicated approval.
acceptance_focus:
  - reviewable decisions
  - source provenance
  - implementation start gate
expected_output: documentation
checked_summary_ja: 学マス情報史の実装前レビューに使用する具体的な提案仕様を整備する。

## Problem

The real-world history directory contains only topic-level placeholders.
Plan 066 correctly blocks implementation until content scope, event identity,
calendar semantics, provenance, corrections, and maintenance receive a
dedicated review.

## Goal

Turn the placeholder documents into one concrete, internally consistent
proposal that the user can approve or revise without beginning factual data
entry or production implementation.

## Implementation Instructions

- Use the accepted direction that real-world history is the next product area.
- Mark all product contracts as Proposed rather than Approved.
- Define a high-signal MVP scope and exclude routine or maintenance-heavy
  categories.
- Define complete field-level contracts and examples with synthetic values.
- Reuse the four-state publication lifecycle without coupling the time domain to
  either narrative view.
- Keep actual official event selection and source verification outside this
  proposal.
- Update plan 066 so its remaining start gate points to exact review decisions.

## Decisions

- The proposal recommends a high-signal initial scope rather than broad official
  feed ingestion.
- One historical occurrence is one InfoEvent; announcement and occurrence
  timestamps are separate fields on that record.
- Date precision is explicit, the authored timezone is preserved, and automatic
  viewer-local conversion is out of the initial scope.
- Schedule changes retain revision history instead of silently replacing the
  previous official claim.
- Approved future events share the same view and use visible scheduled state.
- Published records require official provenance; secondary sources remain
  unreviewed candidates.
- These are proposal decisions only and do not satisfy plan 066's human review
  gate until explicitly approved.

## Tasks

- [x] Define scope, exclusions, entities, fields, and stable IDs.
- [x] Define Gregorian precision, ranges, timezone, and schedule states.
- [x] Define official-source hierarchy, deletion, correction, and lifecycle.
- [x] Define lanes, filters, selection URLs, mobile behavior, and future items.
- [x] Define manual authoring, validation, review, and maintenance procedures.
- [x] Add synthetic contract examples and an explicit approval checklist.
- [x] Reconcile plan 066 and backlog documentation with the proposal.
- [x] Run documentation and plan validation.

## Validation Notes

Do not promote plan 066 or mark the specification Approved in this plan.

The proposal is intentionally limited to contracts and synthetic examples.
No factual Gakumasu record was selected, researched, or added.

Validation completed:

- `bash scripts/lint-plan-docs.sh`
- `bash scripts/format-plan-docs.sh --check`
- `git diff --check`
- `python3 scripts/validate-changes.py`

The plan linter requires Class C backlog plans to retain
`human_approval_status: approved`. Plan 066 therefore uses its explicit Start
Gate and unchecked specification tasks to represent the remaining product
approval, rather than overloading that workflow field.
