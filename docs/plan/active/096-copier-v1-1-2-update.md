# Update managed workflow to Copier v1.1.2

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
  - .github/workflows/project-agent-workflow.yml
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
  - python3 .project-agent-workflow/scripts/security-static-check.py
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
acceptance:
  - Copier records v1.1.2 and leaves no rejection files or conflict markers.
  - Existing project-owned files and product runtime behavior remain unchanged.
  - Managed workflow validation passes after the update.
acceptance_focus:
  - Preserve the boundary between Copier-managed workflow files and project-owned policy.
  - Detect broken bridges, lifecycle scripts, hooks, or validation before committing.
checked_summary_ja: Copier v1.1.2 の変更を検証し、管理ワークフローを安全に更新した。

## Problem

The repository currently records template v1.0.0. The user updated the `temp_project` template and requested adoption of v1.1.2 after checking whether the Copier update would break the managed workflow or overwrite project-owned state.

## Goal

Preview and apply the requested v1.1.2 update only when its generated changes preserve project ownership boundaries and remain internally valid.

## Implementation Instructions

Record the clean baseline, preview the requested update, and inspect the generated path set. Execute the exact requested update when the preview has no unresolved conflict. Compare project-owned paths to the baseline, search for rejection files and conflict markers, review the full diff, and run change-aware validation plus focused managed-workflow checks.

## Decisions

- Treat the user's requested v1.1.2 tag and command as the approved update target.
- Keep product runtime, public paths, links, and project-owned policy out of the template update.
- Stop before commit if Copier emits unresolved conflicts or if validation shows a managed-workflow regression.

## Tasks

- [ ] Preview v1.1.2 and inspect the affected ownership surfaces.
- [ ] Execute the requested Copier update when the preview is safe.
- [ ] Review the resulting diff for conflicts, ownership violations, and workflow regressions.
- [ ] Validate, archive the plan, and commit the scoped update.

## Validation Notes
