# Update managed workflow to Copier v1.2.1

status: in_progress
task_types:
  - copier_adoption
  - planning_docs
  - environment_data_flow
  - security
  - orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
write_scope:
  - .copier-answers.yml
  - .project-agent-workflow/
  - .agents/
  - .codex/
  - .github/workflows/
  - docs/plan/
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
  - .project-agent-workflow/docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/PROJECT_ENVIRONMENT.md
  - .project-agent-workflow/docs/agent/SPEC_SECURITY.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_ORCHESTRATION.md
  - .project-agent-workflow/docs/agent/SPEC_COPIER_ADOPTION.md
validation:
  - git diff --check
  - python3 .project-agent-workflow/scripts/lint-plan-docs.py
  - python3 .project-agent-workflow/scripts/structure-map.py --check
  - python3 .project-agent-workflow/scripts/security-static-check.py --managed
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - npm run test
  - npm run build
acceptance:
  - Copier records v1.2.1 and leaves no rejection files, conflict markers, or unmerged paths.
  - Project-owned policy, plan history, helper definitions, and product runtime remain intact.
  - Managed workflow validation and application tests/build pass after the update.
acceptance_focus:
  - Preserve the boundary between Copier-managed workflow files and project-owned state.
  - Detect broken bridges, hooks, lifecycle scripts, or validation behavior before committing.
checked_summary_ja: Copier v1.2.1 の変更を検証し、管理ワークフローを安全に更新した。

## Problem

The repository records template v1.1.2. The user published v1.2.1 and requested an update while preserving the adopted repository's project-owned state and runtime behavior.

## Goal

Preview and apply v1.2.1, verify the generated change set, and commit it only after workflow and application validation pass.

## Implementation Instructions

Confirm the local and remote v1.2.1 tag identity, preview the Copier update from a clean baseline, then execute the requested update. Inspect every changed path against `.project-agent-workflow/ownership.yaml`, search for rejections and conflict markers, run managed and application validation, archive this plan, commit the scoped update, and confirm a second v1.2.1 update is idempotent.

## Decisions

- Treat the user-requested v1.2.1 tag as the approved update target.
- Keep project-owned policy, product runtime, public paths, and links unchanged unless v1.2.1 reports an explicit migration requiring review.
- Stop before commit if Copier leaves a conflict, unclassified deletion, ownership violation, or validation regression.

## Tasks

- [ ] Preview v1.2.1 and inspect the expected migration behavior.
- [ ] Execute the Copier update from the clean committed baseline.
- [ ] Review ownership boundaries, conflicts, and generated workflow behavior.
- [ ] Validate, archive the plan, commit the update, and confirm idempotence.

## Validation Notes
