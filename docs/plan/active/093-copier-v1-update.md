# Adopt the Copier v1 managed-workflow layout

status: active
task_type: tooling
review_class: B
human_design_required: no
human_approval_status: approved
target_files:
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
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_DECISION_AUDIT.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
validation:
  - uv run copier update --trust --vcs-ref v1.0.0 --pretend
  - find . -name '*.rej' -o -name '*.orig'
  - rg '^(<<<<<<<|=======|>>>>>>>)' --glob '!node_modules/**' --glob '!dist/**'
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
expected_output: full-implementation
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

- [ ] Preview the Copier update and inspect migration scope.
- [ ] Execute the v1.0.0 update and run the legacy-layout migration helper.
- [ ] Preserve project-specific rules in the v1 extension points.
- [ ] Validate the managed workflow and application.
- [ ] Archive the plan and commit the completed update.

## Validation Notes
