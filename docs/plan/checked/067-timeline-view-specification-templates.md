# Timeline View Specification Templates

status: completed
task_type: japanese_prose
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - docs/narrative-timeline/
  - docs/story-event/
  - docs/realworld-history/
  - docs/plan/backlog/064-three-view-application-shell.md
  - docs/plan/backlog/065-story-event-graph-view.md
  - docs/plan/backlog/066-gakumasu-realworld-history-view.md
  - docs/plan/backlog/README.md
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - python3 scripts/validate-changes.py
acceptance:
  - Each of the three timeline views has a dedicated Draft specification directory with a human-facing README and topic-specific templates.
  - The templates separate data contracts, time or graph semantics, UI behavior, authoring, examples, and durable decisions.
  - Draft specifications do not claim to describe implemented behavior until reviewed and approved.
  - Backlog plans 064, 065, and 066 reference the relevant specification directories.
acceptance_focus:
  - durable specification boundary
  - consistent directory structure
  - Draft status clarity
expected_output: documentation
checked_summary_ja: 3種類のタイムラインビューに対応する仕様書ディレクトリの雛形を整備した。

## Decisions

- Use `docs/narrative-timeline/`, `docs/story-event/`, and `docs/realworld-history/` as the canonical specification directories.
- Give every directory a human-facing `README.md`, data model, UI behavior, authoring, examples, and decisions index.
- Use a view-specific semantics document for abstract narrative time, mixed graph semantics, or Gregorian calendar semantics.
- Keep all new specification documents in Draft status until their contents are reviewed.
- Keep current implementation documentation in the existing root `docs/` files until each Draft specification is approved and synchronized.
- Reference the specification directories from the related backlog plans without routing Draft content as mandatory agent policy.

## Tasks

- [x] Create the three specification directory trees.
- [x] Add concise Japanese templates with scope, decision, requirement, validation, and open-question sections.
- [x] Add README indexes and explain the Draft-to-Approved lifecycle.
- [x] Update backlog plan references.
- [x] Validate plan and documentation formatting.

## Implementation Notes

- Added Draft 0.1 specification templates for narrative timeline, story event graph, and real-world history.
- Kept current implemented behavior authoritative while the new specifications remain Draft.
- Added view-specific semantics documents and a source-policy document for real-world history.
- Added tracked decision directories through human-facing README files.
- Linked plans 064, 065, and 066 to their relevant specification directories.

## Validation Results

- `git diff --check`: passed.
- `python3 scripts/lint-plan-docs.py`: passed.
- `python3 scripts/format-plan-docs.py --check`: passed.
- `python3 scripts/validate-changes.py`: passed.
