# Update managed workflow to Copier v1.1.2

status: checked
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
  - python3 .project-agent-workflow/scripts/security-static-check.py --managed
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - npm run test
  - npm run build
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
- Accept deletion of the four template-originated plan-directory `.gitkeep` placeholders; every directory contains durable project-owned files, and v1.1.2 intentionally stops rendering placeholders so Copier cannot recreate a project-deleted placeholder on later updates.

## Tasks

- [x] Preview v1.1.2 and inspect the affected ownership surfaces.
- [x] Execute the requested Copier update when the preview is safe.
- [x] Review the resulting diff for conflicts, ownership violations, and workflow regressions.
- [x] Validate, archive the plan, and commit the scoped update.

## Validation Notes

- The local `temp_project` tag and the remote `refs/tags/v1.1.2` resolve to annotated tag object `f08b8b8cae359436fdcdbbaac8eaa0bbc58e9cad`.
- `uv run copier update --trust --defaults --vcs-ref v1.1.2 --pretend` completed with the expected Hook-wiring migration and did not modify the clean worktree.
- `uv run copier update --trust --defaults --vcs-ref v1.1.2` completed and updated `.copier-answers.yml` from v1.0.0 to v1.1.2.
- No unmerged paths, rejection files, backup files, inline conflict markers, or unexpected project-owned file changes remain. Root policy, project policy, helper-agent definitions, product runtime, public paths, and links have no diff.
- The only `docs/plan` deletions are four blank template-originated `.gitkeep` placeholders intentionally removed by v1.1.2; active, backlog, checked, and handoff content remains present.
- `python3 .project-agent-workflow/scripts/validate-changes.py --all` passed, including Python compilation, Codex TOML, plan lint and format, and changed-file static security checks.
- `python3 .project-agent-workflow/scripts/structure-map.py --check`, `python3 .project-agent-workflow/scripts/security-static-check.py --managed`, and `sh .project-agent-workflow/scripts/check-agent-completion.sh --plans-only` passed.
- The compatibility Stop Hook returned `{}` for the current valid plan lifecycle state.
- `npm run test` passed 26 core files with 144 tests, one Worker file with seven tests, and the timeline authoring UI verification.
- `npm run build` passed with Vite 7.3.6.
