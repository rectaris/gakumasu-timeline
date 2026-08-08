# Address PR #11 review feedback

status: checked
task_types:
  - planning_docs
  - context_compression
  - copier_adoption
  - japanese_prose
review_class: B
human_design_required: no
human_approval_status: not_required
write_scope:
  - .project-agent-workflow/scripts/context-compress.sh
  - README.md
  - agents-rules/ui-change-playbook.md
  - docs/plan/README.md
  - docs/plan/backlog/README.md
  - docs/plan/handoffs/README.md
  - docs/plan/plan.md
  - docs/plan/active/094-address-pr-11-review-feedback.md
  - docs/plan/checked.md
  - docs/plan/checked/2026/08/01-15/094-address-pr-11-review-feedback.md
context_files:
  - none
target_json:
  - none
required_specs:
  - docs/agent/PROJECT_POLICY.md
  - .project-agent-workflow/docs/agent/SPEC_VALIDATION.md
  - .project-agent-workflow/docs/agent/SPEC_GIT_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_FILE_MANAGEMENT.md
  - .project-agent-workflow/docs/agent/SPEC_USER_COMMUNICATION.md
  - .project-agent-workflow/docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_AGENT_LOGGING.md
  - .project-agent-workflow/docs/agent/SPEC_CONTEXT_COMPRESSION.md
  - .project-agent-workflow/docs/agent/SPEC_COPIER_ADOPTION.md
  - .project-agent-workflow/docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - sh -n .project-agent-workflow/scripts/context-compress.sh
  - python3 .project-agent-workflow/scripts/lint-plan-docs.py
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
acceptance:
  - The compression wrapper refuses managed policy files under .project-agent-workflow/docs/agent.
  - Current repository guidance contains no stale pre-namespace policy or workflow-helper paths.
  - Historical checked plans remain unchanged.
acceptance_focus:
  - normative compression refusal
  - live documentation paths
checked_summary_ja: PR #11 のレビュー指摘に従い、規範文書の圧縮拒否と旧パス参照を修正した。

## Problem

Copier v1 moved generic policy and workflow helpers under `.project-agent-workflow/`.
The compression wrapper does not refuse the new managed policy path, and several live documentation files still direct readers to removed pre-namespace paths.

## Goal

Reject both project-owned and managed normative policy files from context compression, and update every live stale workflow reference without rewriting checked history.

## Implementation Instructions

Extend the canonical-path refusal list for managed policy files.
Replace stale paths in current human-facing and agent-facing guidance with their namespaced locations.
Use project-owned `PROJECT_*.md` naming where the text describes repository-specific policy.

## Decisions

- Treat checked plans as historical records and exclude them from path rewrites.
- Keep the fix local to the current PR; do not change product behavior or public paths.

## Tasks

- [x] Add the managed policy path to the compression refusal list.
- [x] Update all current pre-namespace policy and workflow-helper references.
- [x] Run syntax, refusal smoke, path search, and change-aware validation.
- [x] Record validation evidence and prepare the plan for archival.

## Validation Notes

- `sh -n .project-agent-workflow/scripts/context-compress.sh` passed.
- `context-compress.sh` rejected `.project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md` with the expected exit status `1`.
- The existing refusal for `docs/agent/PROJECT_POLICY.md` still returned the expected exit status `1`.
- The live-path search found no pre-namespace generic policy or workflow-helper references outside checked history.
- `python3 .project-agent-workflow/scripts/validate-changes.py --all` passed, including plan lint, plan format, shell syntax, and static security checks.
