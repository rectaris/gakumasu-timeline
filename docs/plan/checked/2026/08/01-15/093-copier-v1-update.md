# Adopt the Copier v1 managed-workflow layout

status: checked
task_types:
  - copier_adoption
  - planning_docs
  - environment_data_flow
  - security
  - orchestration_meta
review_class: B
human_design_required: no
human_approval_status: approved
write_scope:
  - .copier-answers.yml
  - .project-agent-workflow/
  - .project-agent-workflow-migration/
  - .agents/
  - .codex/
  - .github/workflows/
  - AGENTS.md
  - docs/agent/
  - docs/plan/
  - scripts/
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
  - .project-agent-workflow/docs/agent/SPEC_DECISION_AUDIT.md
  - .project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md
  - .project-agent-workflow/docs/agent/SPEC_COPIER_ADOPTION.md
  - .project-agent-workflow/docs/agent/SPEC_SECURITY.md
  - .project-agent-workflow/docs/agent/SPEC_ORCHESTRATION.md
  - .project-agent-workflow/docs/agent/SPEC_EXTERNAL_SERVICES.md
  - .project-agent-workflow/docs/agent/SPEC_AGENT_LOGGING.md
  - .project-agent-workflow/docs/agent/CODEX_CI_AUTOFIX.md
  - .project-agent-workflow/docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - python3 .project-agent-workflow/scripts/lint-plan-docs.py
  - python3 .project-agent-workflow/scripts/structure-map.py --check
  - python3 .project-agent-workflow/scripts/security-static-check.py
  - python3 .project-agent-workflow/scripts/validate-changes.py --all
  - npm run test
  - npm run build
acceptance:
  - Copier records v1.0.0 without unresolved conflicts.
  - Project-owned timeline, validation, deployment, and interaction rules remain reachable.
  - Managed workflow validation and application tests/build pass.
acceptance_focus:
  - Preserve project-specific policy while adopting the managed namespace.
  - Avoid product runtime, public-path, and link changes.
checked_summary_ja: Copier v1.0.0 の管理ワークフロー構成へ安全に更新した。

## Problem

The repository was generated from template v0.4.1. Template v1.0.0 introduces a managed `.project-agent-workflow/` namespace and a one-time migration that moves legacy generated files into a reviewable backup area.

## Goal

Update to Copier template v1.0.0 without losing project-owned rules or changing timeline runtime behavior, public paths, or links.

## Implementation Instructions

Confirm that the remote v1.0.0 tag matches `../temp_project`, preview the exact Copier update, then execute it only when the preview is conflict-free. Run the generated legacy migration helper, compare the migration backup with the new managed core, and preserve only timeline-specific policy in project-owned extension files. Do not restore obsolete generated duplicates into their legacy paths.

## Decisions

- Require a clean committed baseline before the real Copier update.
- Use the exact requested v1.0.0 command after a `--pretend` preview.
- Treat conflict markers, rejection files, loss of project policy, or validation failures as blockers.
- Keep generated workflow implementation in `.project-agent-workflow/` and project-specific rules under root extension points.
- Keep the template-managed CI autofix mode disabled and preserve the existing manual-only workflow under a project-owned filename.
- Resolve the known hardening-hook merge by adopting the v1 compatibility bridge after confirming the managed hook retains the security rules.

## Tasks

- [x] Preview the Copier update and inspect migration scope.
- [x] Execute the v1.0.0 update and run the legacy-layout migration helper.
- [x] Preserve project-specific rules in the v1 extension points.
- [x] Validate the managed workflow and application.
- [x] Prepare the completed update for plan archival and commit.

## Validation Notes

- The local and remote `v1.0.0` tags resolve to template commit `da6362671ca3f3095eeee425c6ff1e1f58481d35`.
- `uv run copier update --trust --vcs-ref v1.0.0 --pretend --defaults` completed without modifying the worktree; isolated full-update trials identified and verified the migration resolutions before the requested interactive command ran.
- `uv run copier update --trust --vcs-ref v1.0.0` completed with CI autofix disabled, template-only Codex hooks, documented optional external-service policies, and documented optional SkillSpector support.
- The migration backup was compared with a freshly rendered v0.4.1 baseline. Project-specific rules were preserved in `docs/agent/PROJECT_*.md`, and the manual-only CI autofix remains project-owned.
- Nine managed skills passed the system `skill-creator` quick validation. NVIDIA SkillSpector was unavailable because its optional CLI is not installed.
- `python3 .project-agent-workflow/scripts/validate-changes.py --all` passed, including plan, structure, syntax, TOML, external-policy, and static-security checks.
- `npm run test` passed 26 core files with 144 tests, 1 Worker file with 7 tests, and the timeline authoring UI verification.
- `npm run build` passed with Vite 7.3.6.
- Product runtime files and public-path configuration have no diff from the pre-update commit; no browser verification was required for this workflow-only migration.
